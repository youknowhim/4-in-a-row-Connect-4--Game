const WebSocket = require("ws");
const { finalizeGame } = require("../gameFinalizer");
const {botChooseColumn} = require("../games/bot");
const {forceLeaveCurrentGame} = require("../games/forceleave");
const {makeMove, checkWin, checkDraw} = require("../games/logic");
const {tryMatchmaking, startBotFallback} = require("../games/matchmaking");
const {generateId, createEmptyBoard, findGameByPlayer, removeFromQueue} = require("../games/gameUtils");
const {ROWS, COLS,RECONNECT_WINDOW} = require("../games/config");
const {clients, waitingQueue, activeGames,disconnectTimers} = require("../games/state");

// SOCKET SERVER
function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {

    ws.on("message", async (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch { return; }

      /* JOIN / REJOIN */
      if (data.type === "JOIN" || data.type === "REJOIN") {
        ws.playerId = data.playerId;
        if (!ws.playerId) return;

        clients.set(ws.playerId, ws);

        if (disconnectTimers.has(ws.playerId)) {
          clearTimeout(disconnectTimers.get(ws.playerId));
          disconnectTimers.delete(ws.playerId);
        }

        const game = findGameByPlayer(ws.playerId);

        if (data.type === "REJOIN" && game) {
          ws.send(JSON.stringify({
            type: "GAME_RESUME",
            board: game.board,
            currentTurn: game.currentTurn,
            isBotGame: game.isBotGame
          }));
        } else {
          ws.send(JSON.stringify({ type: "JOINED" }));
        }
        return;
      }

      /* START MATCH */
      if (data.type === "START_MATCH") {
        forceLeaveCurrentGame(ws.playerId);
        tryMatchmaking(ws.playerId);
        return;
      }

      /* MOVE */
      if (data.type === "MOVE") {
  const game = findGameByPlayer(ws.playerId);
  if (!game || game.currentTurn !== ws.playerId) return;

  /*PLAYER MOVE (DELAYED)*/
  setTimeout(async () => {
    const moved = makeMove(game.board, data.column, ws.playerId);
    if (!moved) return;

    // PLAYER WIN
    if (checkWin(game.board, ws.playerId)) {
      const end = {
        type: "GAME_END",
        winner: ws.playerId,
        board: game.board
      };

      clients.get(game.player1Id)?.send(JSON.stringify(end));
      clients.get(game.player2Id)?.send(JSON.stringify(end));

      await finalizeGame({
  gameId: game.gameId,
  player1Id: game.player1Id,
  player2Id: game.isBotGame ? null : game.player2Id,
  winnerId: ws.playerId,
  isBotGame: game.isBotGame,
  result: "WIN",
  startedAt: game.startedAt,
});
 


      activeGames.delete(game.gameId);
      return;
    }

    // DRAW
    if (checkDraw(game.board)) {
      const end = { type: "GAME_END", board: game.board };

      clients.get(game.player1Id)?.send(JSON.stringify(end));
      clients.get(game.player2Id)?.send(JSON.stringify(end));

      await finalizeGame({
  gameId: game.gameId,
  player1Id: game.player1Id,
  player2Id: game.isBotGame ? null : game.player2Id,
  winnerId: null,
  isBotGame: game.isBotGame,
  result: "DRAW",
  startedAt: game.startedAt,
});

      activeGames.delete(game.gameId);
      return;
    }

    /*BOT GAME*/
    if (game.isBotGame) {
      game.currentTurn = "BOT";

      // send board AFTER player move
      clients.get(game.player1Id)?.send(JSON.stringify({
        type: "GAME_UPDATE",
        board: game.board,
        currentTurn: "BOT"
      }));

      /* BOT MOVE (AFTER 1s) */
      setTimeout(async () => {
        const col = botChooseColumn(game);
        if (col !== null) {
          makeMove(game.board, col, "BOT");
        }

        // BOT WIN
        if (checkWin(game.board, "BOT")) {
          clients.get(game.player1Id)?.send(JSON.stringify({
            type: "GAME_END",
            winner: "BOT",
            board: game.board
          }));

          await finalizeGame({
  gameId: game.gameId,
  player1Id: game.player1Id,
  player2Id: null,
  winnerId: "BOT",
  isBotGame: true,
  result: "WIN",
  startedAt: game.startedAt,
});

          activeGames.delete(game.gameId);
          return;
        }

        // BOT DRAW
        if (checkDraw(game.board)) {
          clients.get(game.player1Id)?.send(JSON.stringify({
            type: "GAME_END",
            board: game.board
          }));

            await finalizeGame({
    gameId: game.gameId,
    player1Id: game.player1Id,
    player2Id: null,
    winnerId: null,
    isBotGame: true,
    result: "DRAW",
    startedAt: game.startedAt,
  });
          activeGames.delete(game.gameId);
          return;
        }

        // back to PLAYER
        game.currentTurn = game.player1Id;

        clients.get(game.player1Id)?.send(JSON.stringify({
          type: "GAME_UPDATE",
          board: game.board,
          currentTurn: game.currentTurn
        }));

      }, 1000); // ⏱ BOT MOVE DELAY

      return;
    }

    /* PvP (UNCHANGED) */
    game.currentTurn =
      ws.playerId === game.player1Id ? game.player2Id : game.player1Id;

    const update = {
      type: "GAME_UPDATE",
      board: game.board,
      currentTurn: game.currentTurn
    };

    clients.get(game.player1Id)?.send(JSON.stringify(update));
    clients.get(game.player2Id)?.send(JSON.stringify(update));

  }, 1000); // ⏱ PLAYER MOVE DELAY
}

    });

    ws.on("close", () => {
      if (!ws.playerId) return;
      removeFromQueue(ws.playerId);

      const timer = setTimeout(async () => {
        const game = findGameByPlayer(ws.playerId);
        if (!game) return;

        if (game.isBotGame) {
            await finalizeGame({
    gameId: game.gameId,
    player1Id: game.player1Id,
    player2Id: null,
    winnerId: "BOT",
    isBotGame: true,
    result: "WIN",
    startedAt: game.startedAt,
  });
          activeGames.delete(game.gameId);
          return;
        }

        const winner =
          game.player1Id === ws.playerId ? game.player2Id : game.player1Id;

        clients.get(winner)?.send(JSON.stringify({
          type: "GAME_END",
          winner,
          result: "FORFEIT"
        }));

        await finalizeGame({
  gameId: game.gameId,
  player1Id: game.player1Id,
  player2Id: game.player2Id,
  winnerId: winner,
  isBotGame: false,
  result: "FORFEIT",
  startedAt: game.startedAt,
});

        activeGames.delete(game.gameId);
      }, RECONNECT_WINDOW);

      disconnectTimers.set(ws.playerId, timer);
    });
  });
}

module.exports = {
  setupWebSocket,
  clients,
  waitingQueue,
  activeGames
};

