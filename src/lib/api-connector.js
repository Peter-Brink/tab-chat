"use client";

export const fetchStream = async (onNewData) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      "http://localhost:3000/api/llm-connector"
    );

    eventSource.onopen = () => {
      console.log("SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data === "[DONE]") {
          console.log("✅ Server has finished sending messages.");
          eventSource.close();
          resolve();
        } else {
          onNewData(data);
        }
      } catch (error) {
        console.error("Error parsing incoming data:", error);
      }
    };

    eventSource.onerror = (error) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("SSE connection closed prematurely by the server.");
        reject(error);
      } else {
        console.error(
          "Error in SSE connection. ReadyState:",
          eventSource.readyState
        );
        reject(error);
      }
      eventSource.close();
    };
  });
};

export const setRedisCookies = async (searchString) => {
  try {
    const response = await fetch("http://localhost:3000/api/store-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchString }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
