const db = require("./db");

async function saveGame(game, result, winner = null) {
  const durationSeconds = Math.floor(
    (Date.now() - game.startedAt) / 1000
  );

  await db.query(
    `
    INSERT INTO games
    (id, player1, player2, winner, is_bot_game, duration_seconds, result)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      game.gameId,
      game.player1,
      game.player2,
      winner,
      game.isBotGame || false,
      durationSeconds,
      result
    ]
  );
}

async function updateUserStats(player1, player2, winner = null) {
  // Increment games played for both users
  await db.query(
    `
    UPDATE users
    SET games_played = games_played + 1
    WHERE username IN (?, ?)
    `,
    [player1, player2]
  );

  // Increment games won for the winner (if any)
  if (winner) {
    await db.query(
      `
      UPDATE users
      SET games_won = games_won + 1
      WHERE username = ?
      `,
      [winner]
    );
  }
}

module.exports = {
  saveGame,
  updateUserStats
};
