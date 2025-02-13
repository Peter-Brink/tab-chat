"use client";

import { useState } from "react";
import { fetchStream, setRedisCookies } from "@/lib/api-connector";

const Search = () => {
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const search = async () => {
    setSearchResults("");
    await setRedisCookies(searchString);
    fetchStream((chunk) => {
      setSearchResults((prev) => prev + chunk);
    }, searchString);
  };

  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <input
        className="text-blue-500"
        type="text"
        onChange={(e) => setSearchString(e.target.value)}
      />
      <button onClick={search}>Search</button>
      <p>{searchResults}</p>
    </div>
  );
};

export default Search;
