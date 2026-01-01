const express = require("express");
const router = express.Router();
const db = require("../config/db");


//   LEADERBOARD
 
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT username, games_won
      FROM users
      ORDER BY games_won DESC
      LIMIT 10
      `
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
