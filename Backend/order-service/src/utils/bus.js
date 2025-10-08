import amqplib from "amqplib";

let channel;

export async function getChannel() {
  if (channel) return channel;
  const url = process.env.AMQP_URL || "amqp://localhost:5672";
  const conn = await amqplib.connect(url);
  channel = await conn.createChannel();
  return channel;
}

export async function publishEvent(exchange, routingKey, message) {
  const ch = await getChannel();
  const queues = {
    ORDER_CREATED: "order_created",
    ORDER_STATUS_UPDATE: "order_status_update",
    SHOP_CAPACITY_UPDATE: "shop_capacity_update",
    NOTIFICATION: "notification",
  };
  await ch.assertExchange(exchange, "topic", { durable: true });
  const payload = Buffer.from(JSON.stringify(message));
  ch.publish(exchange, routingKey, payload, { contentType: "application/json" });
  // also route to named queues if they match
  const q = queues[routingKey];
  if (q) {
    await ch.assertQueue(q, { durable: true });
    ch.sendToQueue(q, payload, { contentType: "application/json" });
  }
}


