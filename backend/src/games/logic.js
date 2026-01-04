const { ROWS, COLS } = require("./config");
function makeMove(board, column, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][column] === 0) {
      board[r][column] = player;
      return true;
    }
  }
  return false;
}

function checkDraw(board) {
  return board[0].every(c => c !== 0);
}

function checkWin(board, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr*i, nc = c + dc*i;
          if (
            nr < 0 || nr >= ROWS ||
            nc < 0 || nc >= COLS ||
            board[nr][nc] !== player
          ) break;
          count++;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}
module.exports = {
  makeMove,
  checkWin,
  checkDraw
};