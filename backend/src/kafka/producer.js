const { Kafka } = require("kafkajs");

const useKafka = process.env.USE_KAFKA === "true";

let producer = null;

async function initProducer() {
  if (!useKafka) {
    console.log("Kafka disabled (producer)");
    return null;
  }

  const kafka = new Kafka({
    clientId: "connect4-backend",
    brokers: process.env.KAFKA_BROKER.split(","),
    ssl: {
      rejectUnauthorized: true,
      ca: [process.env.KAFKA_CA_CERT],
      cert: process.env.KAFKA_ACCESS_CERT,
      key: process.env.KAFKA_ACCESS_KEY,
    },
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka Producer connected");
  return producer;
}

async function publishGameFinished(payload) {
  if (!useKafka) return; //

  if (!producer) await initProducer();

  await producer.send({
    topic: "game-events",
    messages: [{ value: JSON.stringify(payload) }],
  });
}

module.exports = {
  publishGameFinished,
};
