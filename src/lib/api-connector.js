"use client";

export const fetchStream = async (onNewData, searchString) => {
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
      } else {
        console.log(data);
        onNewData(data);
      }
    } catch (error) {
      console.error("Error parsing incoming data:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("Error in SSE connection:", error);
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log("SSE connection closed by the server.");
    } else {
      console.error(
        "Error in SSE connection. ReadyState:",
        eventSource.readyState
      );
    }
    eventSource.close();
  };

  // Return the eventSource object to allow control over the connection
  return eventSource;
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
