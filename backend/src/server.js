// Load environment variables FIRST
require("dotenv").config();

const http = require("http");
const app = require("./app");
const {setupWebSocket} = require("./ws/socket");
if (process.env.USE_KAFKA === "true") {
  const { initProducer } = require("./kafka/producer");
  const { startConsumer } = require("./kafka/consumer");

  (async () => {
    await initProducer();
    await startConsumer();
  })();
}


// Create HTTP server from Express app
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
setupWebSocket(server);

// Read port from env 
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
