import amqplib from "amqplib";

let channel;

async function getChannel() {
  if (channel) return channel;
  const url = process.env.AMQP_URL || "amqp://localhost:5672";
  const conn = await amqplib.connect(url);
  channel = await conn.createChannel();
  return channel;
}

export async function publishCapacityUpdate(shopId, capacity) {
  const ch = await getChannel();
  const payload = Buffer.from(
    JSON.stringify({ shopId, capacity, at: new Date().toISOString() })
  );
  await ch.assertExchange("orders", "topic", { durable: true });
  ch.publish("orders", "SHOP_CAPACITY_UPDATE", payload, { contentType: "application/json" });
  await ch.assertQueue("shop_capacity_update", { durable: true });
  ch.sendToQueue("shop_capacity_update", payload, { contentType: "application/json" });
}


