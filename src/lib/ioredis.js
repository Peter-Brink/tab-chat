const Redis = require("ioredis");

let client = null;

async function connectIoRedis() {
  if (!client) {
    client = new Redis("redis://localhost:6379");
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

  await client.ltrim(key, -30, -1);

  await client.rpush(
    key,
    JSON.stringify({ role: role, parts: [{ text: message }] })
  );

  await client.expire(key, 3600);
}

async function getChatHistory(sessionId) {
  const key = `session:${sessionId}`;
  const messages = await client.lrange(key, 0, -1);
  return messages.map((msg) => JSON.parse(msg));
}

module.exports = { connectIoRedis, storeChatMessage, getChatHistory };
