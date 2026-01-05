const fs = require("fs");
const path = require("path");
const { Kafka } = require("kafkajs");
const { saveGame, updateLeaderboard } = require("../config/dbHelpers");

if (!process.env.KAFKA_BROKER) {
  throw new Error(" KAFKA_BROKER not defined");
}

const kafka = new Kafka({
  clientId: "connect4-consumer",
  brokers: process.env.KAFKA_BROKER.split(","),

  // AIVEN mTLS CONFIG
  ssl: {
    rejectUnauthorized: true,
    key: fs.readFileSync(
      path.join(__dirname, "../../", process.env.KAFKA_SSL_KEY),
      "utf-8"
    ),
    cert: fs.readFileSync(
      path.join(__dirname, "../../", process.env.KAFKA_SSL_CERT),
      "utf-8"
    ),
    ca: fs.readFileSync(
      path.join(__dirname, "../../", process.env.KAFKA_SSL_CA),
      "utf-8"
    ),
  },
});

const consumer = kafka.consumer({ groupId: "game-group-v2" });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "game-events", fromBeginning: false });

  console.log("Kafka Consumer running (Aiven mTLS)");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());

        if (event.event !== "GAME_FINISHED") return;

        await saveGame(
          {
            gameId: event.gameId,
            player1Id: event.player1Id,
            player2Id: event.player2Id,
            isBotGame: event.isBotGame,
            startedAt: event.startedAt,
          },
          event.result,
          event.winnerId
        );

        await updateLeaderboard(event.winnerId);
      } catch (err) {
        console.error(" Kafka consumer error:", err.message);
      }
    },
  });
}

module.exports = { startConsumer };
