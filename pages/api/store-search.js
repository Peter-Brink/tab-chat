const { v4: uuidv4 } = require("uuid");
const {
  connectIoRedis,
  storeChatMessage,
  getChatHistory,
} = require("../../src/lib/ioredis");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  } else {
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = uuidv4();

      res.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; HttpOnly; Max-Age=3600; SameSite=Strict; Path=/`
      );
    }

    const { searchString } = req.body;

    if (!searchString) {
      return res.status(400).json({ error: "No search string provided" });
    }

    try {
      const client = await connectIoRedis();

      await client.set(sessionId, searchString);
      await storeChatMessage(sessionId, "user", searchString);
      // const chats = await getChatHistory(sessionId);
      // console.log("Chat history:", JSON.stringify(chats));
      res
        .status(200)
        .json({ message: "Search string stored and session ID set." });
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Error storing search string: " + e });
    }
  }
}
