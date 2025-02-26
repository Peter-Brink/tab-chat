const Redis = require("ioredis");

let client = null;

async function connectIoRedis() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL;
    client = new Redis(redisUrl + "?family=0", {
      tls: redisUrl.includes("rediss://") ? {} : undefined,
    });
    console.log("Redis Client Connected");

    // Set max memory limit (500MB)
    await client.config("SET", "maxmemory", "500mb");
    // Set eviction policy to LRU (Least Recently Used)
    await client.config("SET", "maxmemory-policy", "allkeys-lru");

    client.on("error", (err) => {
      console.log("Redis Client Error:", err);
    });
  }

  return client;
}

async function storeChatMessage(sessionId, role, message) {
  const key = `session:${sessionId}`;

  await client.ltrim(key, -50, -1);

  await client.rpush(
    key,
    JSON.stringify({ role: role, parts: [{ text: message }] })
  );

  await client.expire(key, 86400);
}

async function storeTabMessage(sessionId, role, message) {
  const key = `tab:${sessionId}`;

  await client.ltrim(key, -50, -1);

  await client.rpush(
    key,
    JSON.stringify({ role: role, parts: [{ text: message }] })
  );

  await client.expire(key, 86400);
}

async function clearTabHistory(sessionId) {
  const key = `tab:${sessionId}`;
  await client.del(key);
}

async function clearChatHistory(sessionId) {
  const key = `session:${sessionId}`;
  await client.del(key);
}

async function getTabHistory(sessionId) {
  const key = `tab:${sessionId}`;
  const messages = await client.lrange(key, 0, -1);
  return messages.map((msg) => JSON.parse(msg));
}

async function getChatHistory(sessionId) {
  const key = `session:${sessionId}`;
  const messages = await client.lrange(key, 0, -1);
  return messages.map((msg) => JSON.parse(msg));
}

module.exports = {
  connectIoRedis,
  storeChatMessage,
  getChatHistory,
  storeTabMessage,
  getTabHistory,
  clearTabHistory,
  clearChatHistory,
};
