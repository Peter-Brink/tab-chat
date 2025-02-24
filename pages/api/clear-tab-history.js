const { connectIoRedis, clearTabHistory } = require("../../src/lib/ioredis");

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectIoRedis();
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(400).json({ error: "No session ID found in cookies" });
    }

    clearTabHistory(sessionId);

    return res.status(200).json({ message: "Tab history cleared" });
  } catch (e) {
    return res.status(500).json({ error: "Error clearing tab history:", e });
  }
}
