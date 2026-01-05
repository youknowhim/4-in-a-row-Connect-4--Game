🎮 4-in-a-Row (Connect-4) – Real-Time Multiplayer Game

A real-time Connect-4 multiplayer game built with WebSockets, Node.js, MySQL, and optional Kafka for event-driven processing.
Supports PvP, Bot games, Reconnect handling, and Leaderboard tracking.

TechStacks-Frontend
ReactJS,TailwindCSS

Backend-
NodeJS
MYSQL
WS for socket
KAFKA

🚀 Features

🔴🟡 Real-time gameplay using WebSockets

🤖 Play against a Bot or another Player , bot gets connected if no player found for 10 seconds

🤖 BOT will stop players from winning

🔁 Reconnect support (temporary disconnects)

🏆 Leaderboard ,match history & All game analytics in DB

⚡ async event processing 
🗄️ Direct DB writes in Production (Kafka-free)

🌍 Cloud-ready (Vercel + Render + Aiven DB)

🧠 Architecture Overview
Game Flow

Players connect via WebSocket

Matchmaking starts (PvP or Bot)

Game runs fully in memory

On game end:

Local / Dev → Kafka event → Consumer → DB

Production → Direct DB write (no Kafka)

Kafka is feature-flagged and never required in production.

📁 Project Structure
backend/
 ├── src/
 │   ├── server.js
 │   ├── ws/socket.js
 │   ├── games/
 │   ├── kafka/
 │   ├── config/
 │   └── gameFinalizer.js
 └── package.json

frontend/
 ├── src/
 └── package.json

⚙️ Setup Guide
1️⃣ Prerequisites

Node.js ≥ 18

MySQL (Aiven or Local)

Kafka local

🔧 Backend Setup
📍 Local Development (Kafka + Aiven DB)
Environment Variables (backend/.env) / required for locally running
# Server
PORT=1030
NODE_ENV=development

# Database (Aiven MySQL)
DB_HOST=local/cluster
DB_PORT=port
DB_USER=username
DB_PASSWORD=your_password
DB_NAME=yout_db_name

# Kafka (LOCAL)
USE_KAFKA=true
KAFKA_BROKER=localhost:9092


ℹ️ SSL is automatically disabled for localhost Kafka.

Run Backend
cd backend
npm install
npm run dev

🌍 Production ENV
Environment Variables (Render Dashboard)
PORT=10000
NODE_ENV=production

DB_HOST=xxxxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=connect4

USE_KAFKA=false


🎨 Frontend Setup
Local Frontend/ENV for frontend
VITE_BACKED_URL=http//localhost:1030
VITE_BACKEND_SOCKET_URL=ws://localhost:1030

Run frontend
cd frontend
npm install
npm run dev

Production Frontend
VITE_BACKEND_URL= https://four-in-a-row-connect-4-game-5.onrender.com
VITE_BACKEND_SOCKET_URL= wss://four-in-a-row-connect-4-game-5.onrender.com


Deploy frontend on:

Vercel/Netlify

Render Static Site

🧩 Kafka (Optional – Local Only)

When Kafka is used:

Async processing

Event-based game finalization

Scalable architecture

When Kafka is disabled:

Same logic

Direct DB writes

Simpler production setup

Controlled via:

USE_KAFKA=true | false

🏁 Scripts
Backend
npm run dev      # Local development
npm start        # Production

Frontend
npm run dev
npm run build
