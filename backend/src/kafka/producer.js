const { Kafka } = require("kafkajs");

const useKafka = process.env.USE_KAFKA === "true";
const isLocalKafka = process.env.KAFKA_BROKER?.includes("localhost");

let producer = null;

async function initProducer() {
  if (!useKafka) {
    console.log("Kafka disabled (producer)");
    return null;
  }

  const kafkaConfig = {
    clientId: "connect4-backend",
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

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka Producer connected");
  return producer;
}

async function publishGameFinished(payload) {
  if (!useKafka) return;

  if (!producer) await initProducer();

  await producer.send({
    topic: "game-events",
    messages: [{ value: JSON.stringify(payload) }],
  });
}

module.exports = {
  publishGameFinished,
  initProducer
};
