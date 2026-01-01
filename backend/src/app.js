const express = require("express");
const cors = require('cors');

const app = express();
app.use(cors());
// Parse JSON request bodies
app.use(express.json());


// User creation, stats & analytics (main dashboard)
app.use("/user", require("./routes/user.routes"));

// Global leaderboard
app.use("/", require("./routes/leaderboard.routes"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
