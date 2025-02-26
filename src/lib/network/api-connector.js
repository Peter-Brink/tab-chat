"use client";

export const fetchStream = async (onNewData) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat-completion`
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
    let jsonBody = JSON.stringify({ tab: tab, searchString: searchString });

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

export const clearAllHistory = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/clear-all-history`,
      {
        method: "POST",
      }
    );
  } catch (e) {
    console.error("Error in API-connecter/clearAllHistory", e);
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    } else if (data.code === 0) {
      console.log("No session ID found in cookies");
      return;
    }

    return data;
  } catch (e) {
    console.error("Error in API-connecter/clearTabHistory", e);
  }
};
