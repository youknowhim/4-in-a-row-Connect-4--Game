const WebSocket = require("ws");
const { addToQueue } = require("../game/matchmaking");
const { activeGames } = require("../game/gameManager");
const { makeMove, checkWin, checkDraw } = require("../game/logic");

// Track connected users
// username -> websocket
const clients = new Map();

// Track disconnect timers for reconnection
// username -> timeoutId
const disconnectTimers = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    let username = null;
    let gameId = null;

    ws.on("message", (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        return;
      }

      /* -------------------- JOIN -------------------- */
      if (data.type === "JOIN") {
        username = data.username;
        clients.set(username, ws);

        // If user reconnects within 30s, cancel forfeit timer
        if (disconnectTimers.has(username)) {
          clearTimeout(disconnectTimers.get(username));
          disconnectTimers.delete(username);
        }

        ws.send(JSON.stringify({
          type: "JOINED",
          message: "Connected successfully"
        }));
      }

      /* -------------------- START MATCH -------------------- */
      if (data.type === "START_MATCH") {
        addToQueue(username, (game) => {
          if (!game) {
            ws.send(JSON.stringify({
              type: "WAITING",
              message: "Waiting for opponent"
            }));
            return;
          }

          gameId = game.gameId;

          const payload = JSON.stringify({
            type: "GAME_START",
            gameId: game.gameId,
            player1: game.player1,
            player2: game.player2,
            currentTurn: game.currentTurn,
            board: game.board
          });

          clients.get(game.player1)?.send(payload);
          clients.get(game.player2)?.send(payload);
        });
      }

      /* -------------------- MOVE -------------------- */
      if (data.type === "MOVE") {
        const game = activeGames.get(gameId);
        if (!game) return;

        // Turn validation (server decides)
        if (game.currentTurn !== username) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not your turn"
          }));
          return;
        }

        // Apply move using pure logic
        const result = makeMove(game.board, data.column, username);

        if (result.error) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: result.error
          }));
          return;
        }

        // Win check
        if (checkWin(game.board, username)) {
          const endPayload = JSON.stringify({
            type: "GAME_END",
            winner: username,
            result: "WIN",
            board: game.board
          });

          clients.get(game.player1)?.send(endPayload);
          clients.get(game.player2)?.send(endPayload);

          activeGames.delete(gameId);
          return;
        }

        // Draw check
        if (checkDraw(game.board)) {
          const drawPayload = JSON.stringify({
            type: "GAME_END",
            result: "DRAW",
            board: game.board
          });

          clients.get(game.player1)?.send(drawPayload);
          clients.get(game.player2)?.send(drawPayload);

          activeGames.delete(gameId);
          return;
        }

        // Switch turn
        game.currentTurn =
          username === game.player1 ? game.player2 : game.player1;

        // Broadcast updated state
        const updatePayload = JSON.stringify({
          type: "GAME_UPDATE",
          board: game.board,
          currentTurn: game.currentTurn
        });

        clients.get(game.player1)?.send(updatePayload);
        clients.get(game.player2)?.send(updatePayload);
      }
    });

    /* -------------------- DISCONNECT -------------------- */
    ws.on("close", () => {
      if (!username || !gameId) return;

      // Start 30-second grace period
      const timer = setTimeout(() => {
        const game = activeGames.get(gameId);
        if (!game) return;

        const winner =
          username === game.player1 ? game.player2 : game.player1;

        const payload = JSON.stringify({
          type: "GAME_END",
          result: "FORFEIT",
          winner
        });

        clients.get(winner)?.send(payload);

        activeGames.delete(gameId);
        disconnectTimers.delete(username);
      }, 30000);

      disconnectTimers.set(username, timer);
    });
  });
}

module.exports = setupWebSocket;
