const { v4: uuidv4 } = require("uuid");

const activeGames = new Map();
const playerGameMap = new Map();

function createGame(player1, player2, isBotGame = false) {
  const gameId = uuidv4();

  // 6 rows x 7 columns (Connect Four standard)
  const board = Array.from({ length: 6 }, () => Array(7).fill(null));

  const game = {
    gameId,
    player1,
    player2,
    board,
    currentTurn: player1,
    isBotGame,
    startedAt: Date.now(),
    status: "ACTIVE"
  };

  activeGames.set(gameId, game);
  playerGameMap.set(player1, gameId);
  playerGameMap.set(player2, gameId);

  return game;
}

function getGame(gameId) {
  return activeGames.get(gameId);
}

module.exports = {
  createGame,
  getGame,
  activeGames
};
