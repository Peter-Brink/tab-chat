const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  connectIoRedis,
  getChatHistory,
  storeChatMessage,
} = require("../../src/lib/ioredis");

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  // res.setHeader("Cache-Control", "no-cach, no transform");
  // res.setHeader("Connection", "keep-alive");
  // //TODO: Change this to the domain of your website
  // res.setHeader("Access-Control-Allow-Origin", "http://wekhbwejvlhvbwelh");
  // res.setHeader("Access-Control-Allow-Credentials", "true");

  const client = await connectIoRedis();

  req.on("close", () => {
    console.log("Client disconnected");
    res.end();
  });

  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "No session ID found in cookies" });
  }

  try {
    const searchString = await client.get(sessionId);
    const chatHistory = await getChatHistory(sessionId);

    if (!searchString) {
      return res
        .status(404)
        .json({ error: "Search string not found for the given session" });
    }

    const genAI = new GoogleGenerativeAI(
      "AIzaSyB_OxBGcKK3XxsfzIV5p2p_xIZl_Zu-mJA"
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessageStream(searchString);

    let llmResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      llmResponse += chunkText;
      res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
      res.flush();
    }

    storeChatMessage(sessionId, "model", llmResponse);

    res.write(`data: ${JSON.stringify("[DONE]")}\n\n`);
    res.flush();
    res.end();
  } catch (error) {
    console.log(error);
  }
}
