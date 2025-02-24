"use client";

export const fetchStream = async (onNewData) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/llm-connector`
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

export const fetchTabStream = async (onNewData) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/tab-chat-completion`
    );

    eventSource.onopen = () => {
      console.log("SSE connection established for tab");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data === "[DONE]") {
          console.log("✅ Server has finished sending messages for tab.");
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
        console.log("SSE connection for tab closed prematurely by the server.");
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

export const setRedisCookies = async (searchString, replyTo, tab = false) => {
  try {
    let jsonBody = JSON.stringify({ searchString: searchString });

    if (replyTo && replyTo.trim().length > 0) {
      jsonBody = JSON.stringify({
        tab: tab,
        searchString: searchString,
        replyTo: replyTo,
      });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/store-search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonBody,
      }
    );

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

export const clearTabHistory = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/clear-tab-history`,
      {
        method: "POST",
      }
    );
  } catch (e) {
    console.error("Error in API-connecter/clearTabHistory", e);
  }
};

export const getChatHistory = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-chat-history`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.error);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Error in API-connecter/clearTabHistory", e);
  }
}
