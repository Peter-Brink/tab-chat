"use client";

import { useState } from "react";
import { setRedisCookies, fetchTabStream } from "@/lib/network/api-connector";

const SideDrawer = ({ isDrawerOpen, tabText, tabResults, setTabResults }) => {
  const [searchString, setSearchString] = useState("");
  const [tabIsFetching, setTabIsFetching] = useState(false);

  async function searchTab() {
    if (tabIsFetching) return;
    setTabIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString, tabText, true);
    fetchTabStream((chunk) => {
      setTabResults((prev) => prev + chunk);
    }).then(() => {
      setTabIsFetching(false);
    });
  }

  return (
    <div className="flex flex-col flex-grow mt-20 p-4">
      <div className="flex flex-col flex-grow overflow-auto items-center">
        {tabText && (
          <p className="text-lg transition-all duration-500 ease-in-out text-myTextGrey">
            "{tabText}"
          </p>
        )}
        {tabResults && (
          <p className="text-lg mt-20 transition-all duration-500 ease-in-out text-myTextGrey">
            {tabResults}
          </p>
        )}
      </div>
      <div className="flex items-center w-full">
        <input
          className="text-black h-10 rounded-2xl flex-grow mr-4 p-4 focus:outline-none bg-myTextGrey"
          type="text"
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
        />
        <button
          className="bg-gradient-to-b cursor-pointer text-myTextGrey from-gradientBlue1 to-gradientBlue2 h-10 rounded-2xl pl-4 pr-4 disabled:bg-gray-500"
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
