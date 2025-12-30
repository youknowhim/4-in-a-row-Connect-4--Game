const express = require("express");

const app = express();
app.use(express.json());

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
