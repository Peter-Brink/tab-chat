const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  connectIoRedis,
  getChatHistory,
  getTabHistory,
  storeTabMessage,
} = require("../../src/lib/storage/ioredis");

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");

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
    const tabHistory = await getTabHistory(sessionId);
    const history = chatHistory.concat(tabHistory);
    const replyTo = await client.get(`replyTo:${sessionId}`);

    if (!searchString) {
      return res
        .status(404)
        .json({ error: "Search string not found for the given session" });
    }

    const genAI = new GoogleGenerativeAI(
      "AIzaSyB_OxBGcKK3XxsfzIV5p2p_xIZl_Zu-mJA"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are a friendly AI assistant that provides succinct additional information about text. You should answer in a relaxed, conversational tone, but remain informative and helpful.  You should also be consice and keep things brief. If the question starts with a quote delimited by the # key, then your response should be based off of the text in that quote.",
    });

    const chat = model.startChat({
      history: history,
    });

    const nextMessage = replyTo
      ? `#${replyTo}.#\n${searchString}`
      : searchString;

    const result = await chat.sendMessageStream(nextMessage);

    let llmResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      llmResponse += chunkText;
      res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
      res.flush();
    }

    storeTabMessage(sessionId, "model", llmResponse);
    await client.set(`replyTo:${sessionId}`, "");

    res.write(`data: ${JSON.stringify("[DONE]")}\n\n`);
    res.flush();
    res.end();
  } catch (error) {
    console.log(error);
  }
}
