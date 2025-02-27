const { v4: uuidv4 } = require("uuid");
const {
  connectIoRedis,
  storeChatMessage,
  storeTabMessage,
} = require("../../src/lib/storage/ioredis");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  } else {
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = uuidv4();

      //TODO: Add Secure to allow only HTTPS
      res.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; HttpOnly; Max-Age=86400; SameSite=Strict; Path=/`
      );
    }

    const { searchString } = req.body;

    if (!searchString) {
      return res.status(400).json({ error: "No search string provided" });
    }

    const { replyTo } = req.body;
    const { tab } = req.body;

    try {
      const client = await connectIoRedis();

      await client.set(`searchString:${sessionId}`, searchString);
      await client.expire(`searchString:${sessionId}`, 3600);
      if (!tab) {
        await storeChatMessage(sessionId, "user", searchString);
      } else {
        await storeTabMessage(sessionId, "user", searchString);
      }
      if (replyTo) {
        await client.set(`replyTo:${sessionId}`, replyTo);
        await client.expire(`replyTo:${sessionId}`, 3600);
      }
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
