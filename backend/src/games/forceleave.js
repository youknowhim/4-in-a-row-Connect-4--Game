const {findGameByPlayer, removeFromQueue} = require("./gameUtils");
const {clients, activeGames} = require("./state");

function forceLeaveCurrentGame(playerId) {
  const game = findGameByPlayer(playerId);
  if (!game) return;

  const opponentId =
    game.player1Id === playerId ? game.player2Id : game.player1Id;

  if (opponentId && opponentId !== "BOT") {
    clients.get(opponentId)?.send(JSON.stringify({
      type: "OPPONENT_LEFT",
      message: "Opponent disconnected"
    }));
  }

  activeGames.delete(game.gameId);
  removeFromQueue(game.player1Id);
  removeFromQueue(game.player2Id);
}
module.exports = {
  forceLeaveCurrentGame
};