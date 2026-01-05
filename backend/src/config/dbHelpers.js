const db = require("./db");


  // Save completed game
 
async function saveGame(game, result, winnerId = null) {
  const durationSeconds = Math.floor(
    (Date.now() - game.startedAt) / 1000
  );

  // Normalize BOT values to NULL
  const player1Id = game.player1Id || null;
  const player2Id = game.isBotGame ? null : game.player2Id;
  const normalizedWinnerId =
    winnerId === "BOT" ? null : winnerId;

  await db.query(
    `
    INSERT IGNORE INTO games
      (id, player1_id, player2_id, winner_id, is_bot_game, duration_seconds, result)
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      game.gameId,
      player1Id,
      player2Id,
      normalizedWinnerId,
      game.isBotGame ? 1 : 0,
      durationSeconds,
      result
    ]
  );
}

// Update leaderboard (wins only for HUMAN players)
async function updateLeaderboard(winnerId) {
  if (!winnerId || winnerId === "BOT") return;

  await db.query(
    `
    INSERT INTO leaderboard (player_id, wins)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE wins = wins + 1
    `,
    [winnerId]
  );
}

module.exports = {
  saveGame,
  updateLeaderboard
};
