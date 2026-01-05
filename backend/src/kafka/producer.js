
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
  ca: process.env.KAFKA_CA_CERT.split("\\n"),
  cert: process.env.KAFKA_ACCESS_CERT.replace(/\\n/g, "\n"),
  key: process.env.KAFKA_ACCESS_KEY.replace(/\\n/g, "\n"),
}

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
