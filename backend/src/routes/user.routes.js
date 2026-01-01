const express = require("express");
const router = express.Router();
const db = require("../config/db");


//   USER STATS
 
router.get("/:username/stats", async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT username, games_played, games_won
      FROM users
      WHERE username = ?
      `,
      [username]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    res.json({
      username: user.username,
      gamesPlayed: user.games_played,
      gamesWon: user.games_won,
      winRate:
        user.games_played === 0
          ? 0
          : Number(
              ((user.games_won / user.games_played) * 100).toFixed(2)
            )
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

/**
 * USER ANALYTICS
 * Used on main/dashboard page
 */
router.get("/:username/analytics", async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT
        COUNT(*) AS totalGames,
        AVG(duration_seconds) AS avgDuration
      FROM games
      WHERE player1 = ? OR player2 = ?
      `,
      [username, username]
    );

    res.json({
      totalGames: rows[0].totalGames || 0,
      avgDurationSeconds: Math.floor(rows[0].avgDuration || 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
