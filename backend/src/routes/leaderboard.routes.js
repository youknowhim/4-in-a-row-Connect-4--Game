const express = require("express");
const router = express.Router();
const db = require("../config/db");



router.get("/leaderboard", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.username, l.wins
      FROM leaderboard l
      JOIN players p ON l.player_id = p.id
      ORDER BY l.wins DESC
      LIMIT 10
    `);

    res.json(rows); // MUST be an array
  } catch (err) {
    console.error("LEADERBOARD DB ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch leaderboard",
      details: err.message
    });
  }
});


module.exports = router;
