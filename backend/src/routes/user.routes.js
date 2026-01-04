const express = require("express");
const router = express.Router();
const db = require("../config/db");


function generatePlayerId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
router.post("/", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  const playerId = generatePlayerId();

  try {
    await db.query(
      `
      INSERT INTO players (id, username)
      VALUES (?, ?)
      `,
      [playerId, username]
    );

    res.status(201).json({
      playerId,
      username
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create player" });
  }
});

module.exports = router;
