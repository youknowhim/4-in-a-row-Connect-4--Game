const express = require("express");
const router = express.Router();
const db = require("../config/db");



router.get("/leaderboard", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT p.username, l.wins
      FROM leaderboard l, players p
      WHERE l.player_id = p.id
      ORDER BY l.wins DESC
      LIMIT 10
      `
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
