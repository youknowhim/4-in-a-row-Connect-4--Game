const { Kafka } = require("kafkajs");

if (!process.env.KAFKA_BROKER) {
  throw new Error("KAFKA_BROKERS not defined");
}

const kafka = new Kafka({
  clientId: "connect4-backend",
  brokers: process.env.KAFKA_BROKER.split(","),
});

const producer = kafka.producer();

async function initProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
}

async function publishGameFinished(payload) {
  try {
    await producer.send({
      topic: "game-events",
      messages: [
        {
          key: payload.gameId,
          value: JSON.stringify(payload),
        },
      ],
    });
  } catch (err) {
    console.error("Kafka publish failed:", err.message);
  }
}

module.exports = {
  initProducer,
  publishGameFinished,
};
