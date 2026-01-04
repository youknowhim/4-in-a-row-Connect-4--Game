import { useState, useEffect } from "react";
import { createUser, getLeaderboard } from "./api";
import { connectSocket, sendMessage } from "./socket";
import UsernamePage from "./components/UsernamePage";

export default function App() {
  const myPlayerId = localStorage.getItem("playerId");

  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState([]);
  const [status, setStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  
 function getTurnText(currentTurn) {
  const storedId = localStorage.getItem("playerId");

  if (!currentTurn) return "";

  if (currentTurn === "BOT") return "Bot's turn";

  if (currentTurn === storedId) return "Your turn";

  return "Opponent's turn";
}

  useEffect(() => {
    const gameFinished = localStorage.getItem("gameFinished");

    if (gameFinished) {
      localStorage.clear();
      setCheckingSession(false);
      return;
    }

    const storedId = localStorage.getItem("playerId");
    const storedName = localStorage.getItem("username");

    if (storedId && storedName) {
      setUsername(storedName);

      connectSocket(handleSocketMessage, () => {
        sendMessage({ type: "REJOIN", playerId: storedId });
      });

      setTimeout(() => {
        setCheckingSession(false);
      }, 2000);
    } else {
      setCheckingSession(false);
    }
  }, []);

  async function handleJoin(name) {
    if (!name) return alert("Username is required");

    setLoading(true);

    const res = await createUser(name);

    localStorage.setItem("playerId", res.playerId);
    localStorage.setItem("username", res.username);

    setUsername(res.username);

    connectSocket(handleSocketMessage, () => {
      sendMessage({
        type: "JOIN",
        playerId: res.playerId,
        username: res.username
      });
    });

    setLoading(false);
  }


  function startMatch() {
    localStorage.removeItem("gameFinished");
    setIsSearching(true);
    setGameActive(false);
    setBoard([]);
    setStatus("Searching for opponent...");

    sendMessage({ type: "START_MATCH" });

    setTimeout(() => {
      setIsSearching(false);
    }, 10000);
  }

  function makeMove(column) {
    if (!gameActive || isSearching) return;
    sendMessage({ type: "MOVE", column });
  }

  function handleSocketMessage(data) {

    if (data.type === "OPPONENT_LEFT") {
      setGameActive(false);
      setBoard([]);
      setStatus("Opponent disconnected");
      return;
    }

    if (data.type === "REJOIN_FAILED") {
      localStorage.clear();
      return;
    }

    if (data.type === "JOINED") {
      setIsLoggedIn(true);
      return;
    }

    if (data.type === "MATCHMAKING") {
      setIsLoggedIn(true);
      return;
    }

    if (data.type === "GAME_START") {
      setGameActive(true);
      setIsSearching(false);
      setBoard(data.board);
      setStatus(getTurnText(data.currentTurn));
      return;
    }

      if (data.type === "GAME_RESUME") {
    setIsLoggedIn(true);
    setGameActive(true);
    setBoard(data.board);
    setStatus(
      data.currentTurn === myPlayerId
        ? "Your turn"
        : "Opponent's turn"
    );
    return;
  }

    if (data.type === "GAME_UPDATE") {
      setBoard(data.board);
      setStatus(getTurnText(data.currentTurn));
      return;
    }

if (data.type === "GAME_END") {
  setGameActive(true);
  setBoard(data.board);

  const storedId = localStorage.getItem("playerId");

  if (!data.winner) {
    setStatus("Game Draw");
  } else if (data.winner === "BOT") {
    setStatus("Bot wins");
  } else if (data.winner === storedId) {
    setStatus("You win");
  } else {
    setStatus("Opponent wins");
  }

  localStorage.setItem("gameFinished", "true");
  return;
}

  }

  // LEADERBOARD
  async function openLeaderboard() {
    setShowLeaderboard(true);
    const data = await getLeaderboard();
    setLeaderboard(data);
  }

  // RENDER CONTROL
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Restoring session…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <UsernamePage onSubmit={handleJoin} loading={loading} />;
  }

  if (showLeaderboard) {
    return (
      <div className="min-h-screen p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>

        <div className="bg-white rounded shadow p-4">
          <ul className="space-y-2">
            {leaderboard.map((u, i) => (
              <li key={i} className="flex justify-between">
                <span>{i + 1}. {u.username}</span>
                <span>{u.wins} wins</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowLeaderboard(false)}
        >
          Back
        </button>
      </div>
    );
  }

  // MAIN GAME UI
  return (
    <div className="min-h-screen p-6 bg-gray-100 space-y-6">
      <h1 className="text-3xl font-bold">Connect Four</h1>

      <div className="space-x-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={startMatch}
          disabled={isSearching}
        >
          Start Match
        </button>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={openLeaderboard}
        >
          View Leaderboard
        </button>
      </div>

      <p className="text-lg">{status}</p>

      {gameActive && (
        <div className="bg-blue-800 p-2 rounded-lg inline-block">
          <div className="grid grid-cols-7 gap-1">
            {board.map((row, r) =>
              row.map((cell, c) => {
                let color = "bg-gray-200";

                if (cell) {
                  color =
                    cell === myPlayerId
                      ? "bg-blue-500"
                      : "bg-red-500";
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => makeMove(c)}
                    className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center"
                  >
                    <div className={`w-8 h-8 rounded-full ${color}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
            {/* SEARCHING OVERLAY */}
      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-80 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Searching for opponent
            </h2>
            <p className="text-gray-600 text-sm">
              We’ll match you with a player or bot shortly…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
