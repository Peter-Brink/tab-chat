const {
  connectIoRedis,
  getChatHistory,
} = require("../../src/lib/storage/ioredis");

export default async function (req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectIoRedis();
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res
        .status(400)
        .json({ error: "No session ID found in cookies", code: 0 });
    }

    const chatHistory = await getChatHistory(sessionId);

    return res.status(200).json(chatHistory);
  } catch (e) {
    return res.status(500).json({ error: "Error clearing tab history:", e });
  }
}
