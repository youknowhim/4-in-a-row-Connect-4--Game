const { makeMove, checkWin, checkDraw } = require("./logic");
const { ROWS, COLS } = require("./config");
const { cloneBoard } = require("./gameUtils");
function botChooseColumn(game) {
  const board = game.board;
  const human = game.player1Id;

  for (let c = 0; c < COLS; c++) {
    const copy = cloneBoard(board);
    if (makeMove(copy, c, "BOT") && checkWin(copy, "BOT")) return c;
  }

  for (let c = 0; c < COLS; c++) {
    const copy = cloneBoard(board);
    if (makeMove(copy, c, human) && checkWin(copy, human)) return c;
  }

  const center = Math.floor(COLS / 2);
  if (makeMove(cloneBoard(board), center, "BOT")) return center;

  for (let c = 0; c < COLS; c++) {
    if (makeMove(cloneBoard(board), c, "BOT")) return c;
  }

  return null;
}
module.exports = {
  botChooseColumn
};