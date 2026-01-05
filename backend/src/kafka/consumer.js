const { saveGame, updateLeaderboard } = require("../config/dbHelpers");

const useKafka = process.env.USE_KAFKA === "true";
const isLocalKafka = process.env.KAFKA_BROKER?.includes("localhost");

async function startConsumer() {
  if (!useKafka) {
    console.log("Kafka consumer disabled (USE_KAFKA=false)");
    return;
  }

  const { Kafka } = require("kafkajs");

  const kafkaConfig = {
    clientId: "connect4-consumer",
    brokers: process.env.KAFKA_BROKER.split(","),
  };

  // ONLY enable SSL for Aiven / cloud Kafka
  if (!isLocalKafka) {
    kafkaConfig.ssl = {
      rejectUnauthorized: true,
      ca: process.env.KAFKA_CA_CERT.replace(/\\n/g, "\n"),
      cert: process.env.KAFKA_ACCESS_CERT.replace(/\\n/g, "\n"),
      key: process.env.KAFKA_ACCESS_KEY.replace(/\\n/g, "\n"),
    };
  }

  const kafka = new Kafka(kafkaConfig);
  const consumer = kafka.consumer({ groupId: "game-group-v2" });

  await consumer.connect();
  await consumer.subscribe({ topic: "game-events", fromBeginning: false });

  console.log("Kafka Consumer running");

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

        if (event.winnerId) {
          await updateLeaderboard(event.winnerId);
        }
      } catch (err) {
        console.error("Kafka consumer error:", err.message);
      }
    },
  });
}

module.exports = { startConsumer };
