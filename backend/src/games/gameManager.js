const { v4: uuidv4 } = require("uuid");
const activeGames = new Map();
const playerGameMap = new Map();

function createGame(player1, player2) {
  const gameId = uuidv4();

  const game = {
    gameId,
    player1,
    player2,
    startedAt: Date.now()
  };

  activeGames.set(gameId, game);
  playerGameMap.set(player1, gameId);
  playerGameMap.set(player2, gameId);

  return game;
}

module.exports = {
  createGame,
  activeGames
};
