🎮 4-in-a-Row (Connect-4) – Real-Time Multiplayer Game

A real-time Connect-4 multiplayer game built with WebSockets, Node.js, MySQL, and optional Kafka for event-driven processing.
Supports PvP, Bot games, Reconnect handling, and Leaderboard tracking.

LINK - https://4-in-a-row-connect-4-game.vercel.app/

TechStacks-Frontend<br/>
ReactJS<br/> TailwindCSS<br/>

Backend-<br/>
NodeJS<br/>
MYSQL<br/>
WS for socket<br/>
KAFKA<br/>

🚀 Features

🔴🟡 Real-time gameplay using WebSockets<br/>

🤖 Play against a Bot or another Player , bot gets connected if no player found for 10 seconds<br/>

🤖 BOT will stop players from winning<br/>

🔁 Reconnect support (temporary disconnects)<br/>

🏆 Leaderboard ,match history & All game analytics in DB<br/>

⚡ async event processing <br/>
🗄️ Direct DB writes in Production (Kafka-free)<br/>

🌍 Cloud-ready (Vercel + Render + Aiven DB)<br/>

🧠 Architecture Overview<br/>
Game Flow<br/>

Players connect via WebSocket<br/>

Matchmaking starts (PvP or Bot)<br/>

Game runs fully in memory<br/>

Gives 30sec time for rejoining for disconnected player<br/>

On game end:<br/>

Local / Dev → Kafka event → Consumer → DB<br/>

Production → Direct DB write (no Kafka)<br/>

Kafka is feature-flagged and never required in production.<br/>

📁 Project Structure<br/>
backend/<br/>
 ├── src/<br/>
 │   ├── server.js<br/>
 │   ├── ws/socket.js<br/>
 │   ├── games/<br/>
 │   ├── kafka/<br/>
 │   ├── config/<br/>
 │   └── gameFinalizer.js<br/>
 └── package.json<br/>

frontend/<br/>
 ├── src/<br/>
 └── package.json<br/>

⚙️ Setup Guide<br/>
1️⃣ Prerequisites<br/>

Node.js ≥ 18<br/>

MySQL (Aiven or Local)<br/>

Kafka local<br/>

🔧 Backend Setup<br/>
📍 Local Development (Kafka + Aiven DB)<br/>
Environment Variables (backend/.env) / required for locally running<br/>
# Server<br/>
PORT=1030<br/>
NODE_ENV=development<br/>

# Database (Aiven MySQL)<br/>
DB_HOST=local/cluster<br/>
DB_PORT=port<br/>
DB_USER=username<br/>
DB_PASSWORD=your_password<br/>
DB_NAME=yout_db_name<br/>

# Kafka (LOCAL)
USE_KAFKA=true<br/>
KAFKA_BROKER=localhost:9092<br/>


ℹ️ SSL is automatically disabled for localhost Kafka.<br/>

Run Backend<br/>
cd backend<br/>
npm install<br/>
npm run dev<br/>

🌍 Production ENV<br/>
Environment Variables (Render Dashboard)<br/>
PORT=10000<br/>
NODE_ENV=production<br/><br/>

DB_HOST=xxxxx.aivencloud.com
DB_PORT=12345<br/>
DB_USER=avnadmin<br/>
DB_PASSWORD=your_password<br/>
DB_NAME=connect4<br/>

USE_KAFKA=false<br/>


🎨 Frontend Setup<br/>
Local Frontend/ENV for frontend<br/>
VITE_BACKED_URL=http//localhost:1030<br/>
VITE_BACKEND_SOCKET_URL=ws://localhost:1030<br/>

Run frontend<br/>
cd frontend<br/>
npm install<br/>
npm run dev<br/>

Production Frontend<br/>
VITE_BACKEND_URL= https://four-in-a-row-connect-4-game-5.onrender.com<br/>
VITE_BACKEND_SOCKET_URL= wss://four-in-a-row-connect-4-game-5.onrender.com<br/>


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
