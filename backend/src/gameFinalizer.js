const { saveGame, updateLeaderboard } = require("./config/dbHelpers");

let publishGameFinished;

if (process.env.USE_KAFKA === "true") {
  ({ publishGameFinished } = require("../kafka/producer"));
}

async function finalizeGame(event) {
  if (process.env.USE_KAFKA === "true") {
    // async event-driven
    await publishGameFinished(event);
  } else {
    // synchronous direct DB write
    await saveGame(
      {
        gameId: event.gameId,
        player1Id: event.player1Id,
        player2Id: event.player2Id,
        isBotGame: event.isBotGame,
        startedAt: event.startedAt,
      },
      event.result,
      event.winnerId
    );

    if (event.winnerId) {
      await updateLeaderboard(event.winnerId);
    }
  }
}

module.exports = { finalizeGame };
