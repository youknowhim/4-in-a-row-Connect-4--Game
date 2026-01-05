const { saveGame, updateLeaderboard } = require("./config/dbHelpers");
const { publishGameFinished } = require("./kafka/producer");

const USE_KAFKA = process.env.USE_KAFKA === "true";

async function finalizeGame(event) {
  if (USE_KAFKA) {
    // LOCAL / EVENT-DRIVEN
    await publishGameFinished({
      event: "GAME_FINISHED",
      ...event,
    });
  } else {
    // PRODUCTION / DIRECT DB
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
