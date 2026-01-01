const { makeMove, checkWin } = require("./logic.js");

/**
 * Decide bot move based on priority.
 * Returns column index (0–6)
 */
function getBotMove(board, botPlayer, humanPlayer) {
  // Try to win
  const winMove = findWinningMove(board, botPlayer);
  if (winMove !== null) return winMove;

  // Try to block opponent
  const blockMove = findWinningMove(board, humanPlayer);
  if (blockMove !== null) return blockMove;

  // Prefer center column
  if (isColumnPlayable(board, 3)) return 3;

  // Fallback: first available column
  for (let col = 0; col < 7; col++) {
    if (isColumnPlayable(board, col)) {
      return col;
    }
  }

  return null; // no move possible
}

/**
 * Check if a player can win by playing one move.
 */
function findWinningMove(board, player) {
  for (let col = 0; col < 7; col++) {
    if (!isColumnPlayable(board, col)) continue;

    // Clone board (simple deep copy)
    const tempBoard = board.map(row => [...row]);

    makeMove(tempBoard, col, player);

    if (checkWin(tempBoard, player)) {
      return col;
    }
  }

  return null;
}

/**
 * Check if a column can accept a disc.
 */
function isColumnPlayable(board, column) {
  return board[0][column] === null;
}

module.exports = {
  getBotMove
};
