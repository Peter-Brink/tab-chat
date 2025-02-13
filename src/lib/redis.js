import { createClient } from "redis";

let client;

async function connectRedis() {
  if (!client) {
    client = createClient({
      url: "redis://localhost:6379",
    });

    await client.connect();
    console.log("Redis Client Connected");

    client.on("error", (err) => {
      console.log("Redis Client Error:", err);
    });
  }

  return client;
}

export { connectRedis };
