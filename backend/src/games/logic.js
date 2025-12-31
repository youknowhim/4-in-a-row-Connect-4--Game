/*
 * Try to place a disc in the given column.
 * This function ONLY updates board state.
 */
function makeMove(board, column, player) {
  // Invalid column
  if (column < 0 || column > 6) {
    return { error: "Invalid column" };
  }

  // Find the lowest empty cell
  for (let row = 5; row >= 0; row--) {
    if (board[row][column] === null) {
      board[row][column] = player;
      return { row, column };
    }
  }

  return { error: "Column full" };
}

/*
 * Check if the given player has won the game.
 */
function checkWin(board, player) {
  const ROWS = 6;
  const COLS = 7;

  // 4 directions: horizontal, vertical, 2 diagonals
  const directions = [
    [0, 1],  
    [1, 0],   
    [1, 1],   
    [1, -1]   
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;

      for (let [dr, dc] of directions) {
        let count = 0;

        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;

          if (
            nr >= 0 && nr < ROWS &&
            nc >= 0 && nc < COLS &&
            board[nr][nc] === player
          ) {
            count++;
          }
        }

        if (count === 4) return true;
      }
    }
  }

  return false;
}

/**
 * Check if the game is a draw.
 * If top row has no empty cells, board is full.
 */
function checkDraw(board) {
  return board[0].every(cell => cell !== null);
}

module.exports = {
  makeMove,
  checkWin,
  checkDraw
};
