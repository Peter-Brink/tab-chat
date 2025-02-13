const { GoogleGenerativeAI } = require("@google/generative-ai");
const { connectRedis } = require("../../src/lib/redis");

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cach, no transform");
  res.setHeader("Connection", "keep-alive");
  //TODO: Change this to the domain of your website
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const client = await connectRedis();

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
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
    });

    const result = await chat.sendMessageStream(searchString);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
      res.flush();
    }

    res.write(`data: ${JSON.stringify("[DONE]")}\n\n`);
    res.flush();
    res.end();
  } catch (error) {
    console.log(error);
  }
}
