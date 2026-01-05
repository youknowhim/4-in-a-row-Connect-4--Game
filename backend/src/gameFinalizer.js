const { saveGame, updateLeaderboard } = require("./config/dbHelpers");

const useKafka = process.env.USE_KAFKA === "true";

// Kafka is OPTIONAL
let publishGameFinished = null;

if (useKafka) {
  try {
    ({ publishGameFinished } = require("./kafka/producer"));
  } catch (err) {
    console.warn("Kafka producer not available, falling back to direct DB writes");
  }
}

/**
 * Finalize a game result
 * This is the SINGLE SOURCE OF TRUTH for game completion
 */
async function finalizeGame({
  gameId,
  player1Id,
  player2Id,
  winnerId,
  isBotGame,
  result,
  startedAt,
}) {
  const payload = {
    event: "GAME_FINISHED",
    gameId,
    player1Id,
    player2Id,
    winnerId,
    isBotGame,
    result,
    startedAt,
    endedAt: Date.now(),
  };

  // Kafka path (LOCAL / DEV)
  if (useKafka && publishGameFinished) {
    try {
      await publishGameFinished(payload);
      return;
    } catch (err) {
      console.error("Kafka publish failed, falling back to DB:", err.message);
    }
  }

  // Direct DB path (PRODUCTION)
  await saveGame(
    {
      gameId,
      player1Id,
      player2Id,
      isBotGame,
      startedAt,
    },
    result,
    winnerId
  );

  if (winnerId) {
    await updateLeaderboard(winnerId);
  }
}

module.exports = { finalizeGame };
