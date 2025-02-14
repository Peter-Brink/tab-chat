"use client";

import { useState } from "react";
import { fetchStream, setRedisCookies } from "@/lib/api-connector";

const Search = () => {
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const search = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString);
    fetchStream((chunk) => {
      setSearchResults((prev) => prev + chunk);
    }).then(() => {
      setSearchResults(
        (prev) =>
          prev +
          "\n-------------------------------------------------------------------------\n\n"
      );
      setIsFetching(false);
    });
  };

  return (
    <div className="flex flex-col w-screen min-h-screen items-center">
      <div className="flex flex-col flex-grow w-full max-w-2xl overflow-y-auto">
        <p className="whitespace-pre-line">{searchResults}</p>
      </div>
      <div className="flex fixed bottom-0 mb-10 w-full justify-center">
        <div className="w-[400px] flex items-center">
          <input
            className="text-black w-[300px]"
            type="text"
            onChange={(e) => setSearchString(e.target.value)}
            value={searchString}
          />
          <button
            className="bg-blue-600 disabled:bg-gray-500"
            onClick={search}
            disabled={isFetching}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
