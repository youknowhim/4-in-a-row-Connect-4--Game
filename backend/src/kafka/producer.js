const fs = require("fs");
const path = require("path");
const { Kafka } = require("kafkajs");

if (!process.env.KAFKA_BROKER) {
  throw new Error("KAFKA_BROKER not defined");
}

const kafka = new Kafka({
  clientId: "connect4-backend",
  brokers: process.env.KAFKA_BROKER.split(","),

  //AIVEN mTLS CONFIG
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

const producer = kafka.producer();

async function initProducer() {
  await producer.connect();
  console.log("Kafka Producer connected (Aiven mTLS)");
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
