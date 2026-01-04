const {activeGames, waitingQueue} = require("./state");
const {ROWS, COLS} = require("./config");

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function cloneBoard(board) {
  return board.map(r => [...r]);
}

function removeFromQueue(playerId) {
  const i = waitingQueue.indexOf(playerId);
  if (i !== -1) waitingQueue.splice(i, 1);
}

function findGameByPlayer(playerId) {
  return [...activeGames.values()].find(
    g => g.player1Id === playerId || g.player2Id === playerId
  );
}
module.exports = {
  generateId,
  createEmptyBoard,
  cloneBoard,
  removeFromQueue,
  findGameByPlayer,
};