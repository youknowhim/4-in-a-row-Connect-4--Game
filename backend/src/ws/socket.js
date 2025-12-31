const WebSocket = require("ws");
const { addToQueue } = require("../games/matchmaking");
const { activeGames } = require("../games/gameManager");
const { makeMove, checkWin, checkDraw } = require("../games/logic");

// Track connected users
// username -> websocket
const clients = new Map();

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

      // JOIN
      if (data.type === "JOIN") {
        username = data.username;
        clients.set(username, ws);

        ws.send(JSON.stringify({
          type: "JOINED",
          message: "Connected"
        }));
      }

      // START MATCH
      if (data.type === "START_MATCH") {
        addToQueue(username, (game) => {
          if (!game) {
            ws.send(JSON.stringify({
              type: "WAITING",
              message: "No opponent yet"
            }));
            return;
          }

          gameId = game.gameId;

          const startPayload = JSON.stringify({
            type: "GAME_START",
            gameId: game.gameId,
            player1: game.player1,
            player2: game.player2,
            currentTurn: game.currentTurn,
            board: game.board
          });

          clients.get(game.player1)?.send(startPayload);
          clients.get(game.player2)?.send(startPayload);
        });
      }

      // MOVE
      if (data.type === "MOVE") {
        const game = activeGames.get(gameId);
        if (!game) return;

        // Turn validation stays outside logic.js
        if (game.currentTurn !== username) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not your turn"
          }));
          return;
        }

        // Apply move (pure board logic)
        const result = makeMove(game.board, data.column, username);

        if (result.error) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: result.error
          }));
          return;
        }

        // Check win
        if (checkWin(game.board, username)) {
          const endPayload = JSON.stringify({
            type: "GAME_END",
            winner: username,
            board: game.board
          });

          clients.get(game.player1)?.send(endPayload);
          clients.get(game.player2)?.send(endPayload);

          activeGames.delete(gameId);
          return;
        }

        // Check draw
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

        // Switch turn (server responsibility)
        game.currentTurn =
          username === game.player1 ? game.player2 : game.player1;

        // Send updated board
        const updatePayload = JSON.stringify({
          type: "GAME_UPDATE",
          board: game.board,
          currentTurn: game.currentTurn
        });

        clients.get(game.player1)?.send(updatePayload);
        clients.get(game.player2)?.send(updatePayload);
      }
    });

    ws.on("close", () => {
      if (username) {
        clients.delete(username);
      }
    });
  });
}

module.exports = setupWebSocket;
