"use client";

import { useState } from "react";
import { setRedisCookies, fetchTabStream } from "@/lib/network/api-connector";
import MarkdownConverter from "@/lib/utility/markdown-converter";

const SideDrawer = ({ tabText, tabResults, setTabResults }) => {
  const [searchString, setSearchString] = useState("");
  const [tabIsFetching, setTabIsFetching] = useState(false);

  async function searchTab() {
    if (tabIsFetching || !searchString) return;
    setTabIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString, tabText, true);
    fetchTabStream((chunk) => {
      setTabResults((prev) => prev + chunk);
    }).then(() => {
      setTabIsFetching(false);
    });
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents creating a new line in the textarea
      searchTab(); // Trigger the submit action
    }
  };

  return (
    <div className="flex flex-col flex-grow mt-20 p-7">
      <div className="flex prose prose-invert flex-col flex-grow overflow-auto items-center">
        {tabText && (
          <div>
            <p className="text-lg font-bold transition-all duration-500 ease-in-out text-myTextGrey">
              "{tabText}"
            </p>
          </div>
        )}
        {tabResults && (
          <div className="text-base mt-10 leading-7 transition-all duration-500 ease-in-out text-myTextGrey">
            <MarkdownConverter input={tabResults} />
          </div>
        )}
      </div>
      <div className="flex items-center w-full">
        <input
          className="text-black h-10 rounded-2xl flex-grow mr-4 p-4 focus:outline-none bg-myTextGrey"
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Get more context..."
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
        />
        <button
          className={`bg-gradient-to-b cursor-pointer text-myTextGrey from-gradientBlue1 to-gradientBlue2 h-10 rounded-2xl pl-4 pr-4 disabled:opacity-50 ${
            tabIsFetching
              ? ""
              : "transition-all duration-[500ms] hover:shadow-[0_0_12px_4px_rgba(0,87,209,0.9)]"
          }`}
          onClick={searchTab}
          disabled={tabIsFetching}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SideDrawer;
