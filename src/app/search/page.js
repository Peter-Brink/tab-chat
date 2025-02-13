"use client";

import { useState } from "react";
import { fetchStream } from "@/utils/api-connector";

const Search = () => {
  const [searchString, setSearhcString] = useState("");

  const search = () => {
    console.log("button clicked, initiating api call");
    fetchStream()
      .then((eventSource) => {
        console.log("SSE connection established");
      })
      .catch((error) => {
        console.error("Error in SSE connection:", error);
      });
  };

  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <input
        className="text-blue-500"
        type="text"
        onChange={(e) => setSearhcString(e.target.value)}
      />
      <button onClick={search}>Search</button>
    </div>
  );
};

export default Search;
