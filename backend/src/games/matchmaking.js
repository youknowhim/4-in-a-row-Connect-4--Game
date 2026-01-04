const {findGameByPlayer, createEmptyBoard, generateId,removeFromQueue} = require("./gameUtils");
const {clients, waitingQueue, activeGames} = require("./state");
const {BOT_FALLBACK_TIME} = require("../games/config");

function startBotFallback(playerId) {
  setTimeout(() => {
    if (!waitingQueue.includes(playerId)) return;
    if (findGameByPlayer(playerId)) return;

    removeFromQueue(playerId);

    const game = {
      gameId: generateId(),
      player1Id: playerId,
      player2Id: "BOT",
      currentTurn: playerId,
      board: createEmptyBoard(),
      isBotGame: true,
      startedAt: Date.now()
    };
  

    activeGames.set(game.gameId, game);

    clients.get(playerId)?.send(JSON.stringify({
      type: "GAME_START",
      board: game.board,
      currentTurn: game.currentTurn,
      isBotGame: true
    }));
  }, BOT_FALLBACK_TIME);
}

function tryMatchmaking(playerId) {
  if (!playerId) return;
  if (findGameByPlayer(playerId)) return;
  if (waitingQueue.includes(playerId)) return;

  if (waitingQueue.length > 0) {
    const opponentId = waitingQueue.shift();

    const game = {
      gameId: generateId(),
      player1Id: opponentId,
      player2Id: playerId,
      currentTurn: opponentId,
      board: createEmptyBoard(),
      isBotGame: false,
      startedAt: Date.now()
    };
  

    activeGames.set(game.gameId, game);

    const payload = JSON.stringify({
      type: "GAME_START",
      board: game.board,
      currentTurn: game.currentTurn,
      isBotGame: false
    });

    clients.get(opponentId)?.send(payload);
    clients.get(playerId)?.send(payload);
  } else {
    waitingQueue.push(playerId);
    clients.get(playerId)?.send(JSON.stringify({ type: "MATCHMAKING" }));
    startBotFallback(playerId);
  }
}
module.exports = {
  tryMatchmaking,
  startBotFallback
};