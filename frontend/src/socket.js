
let socket = null;
let reconnectTimer = null;
let reconnectStartTime = null;
let shouldReconnect = false;

const WS_URL = import.meta.env.BACKEND_SOCKET_URL || "ws://localhost:1025/ws";
const RECONNECT_WINDOW = 30000; // 30 seconds

export function connectSocket(onMessage, onOpen) {
  // prevent duplicate sockets
  if (socket && socket.readyState === WebSocket.OPEN) return;

  shouldReconnect = true;
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WS connected");

    reconnectStartTime = null;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;

    if (onOpen) onOpen();
  };

  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);

      // STOP reconnect attempts after game ends
      if (data.type === "GAME_END") {
        shouldReconnect = false;
      }
    } catch {
      console.warn("Invalid WS message");
    }
  };

  socket.onclose = () => {
    console.log("WS disconnected");

    if (!shouldReconnect) {
      console.log("Reconnect disabled");
      return;
    }

    attemptReconnect(onMessage);
  };
}

function attemptReconnect(onMessage) {
  if (reconnectTimer) return; // prevent multiple timers

  if (!reconnectStartTime) {
    reconnectStartTime = Date.now();
  }

  const elapsed = Date.now() - reconnectStartTime;

  if (elapsed >= RECONNECT_WINDOW) {
    console.log("Reconnect window expired");
    shouldReconnect = false;
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;

    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
      shouldReconnect = false;
      return;
    }

    console.log("Attempting WS reconnect...");

    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WS reconnected");

      socket.send(JSON.stringify({
        type: "REJOIN",
        playerId
      }));
    };

    socket.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {
        console.warn("Invalid WS message");
      }
    };

    socket.onclose = () => {
      if (shouldReconnect) {
        attemptReconnect(onMessage);
      }
    };
  }, 2000);
}

export function sendMessage(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WS not ready, message skipped");
    return;
  }

  socket.send(JSON.stringify(data));
}
