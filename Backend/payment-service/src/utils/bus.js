import amqplib from "amqplib";

let channel;

export async function getChannel() {
  if (channel) return channel;
  const url = process.env.AMQP_URL || "amqp://localhost:5672";
  const conn = await amqplib.connect(url);
  channel = await conn.createChannel();
  return channel;
}

export async function publishPaymentEvent(routingKey, message) {
  const ch = await getChannel();
  await ch.assertExchange("payments", "topic", { durable: true });
  const payload = Buffer.from(JSON.stringify(message));
  ch.publish("payments", routingKey, payload, { contentType: "application/json" });
}


