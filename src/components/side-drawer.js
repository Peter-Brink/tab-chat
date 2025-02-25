"use client";

import { useState } from "react";
import { setRedisCookies, fetchTabStream } from "@/lib/network/api-connector";

const SideDrawer = ({
  isDrawerOpen,
  tabText,
  tabResults,
  setTabResults,
}) => {
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
    <div className="w-[100px]">

      <div
        className={`fixed flex h-screen bg-gray-500 w-96 top-0 right-0 text-white p-5 transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col w-96 min-h-screen items-center overflow-auto">
          {tabText && <p className="mt-20 text-lg">"{tabText}"</p>}
          {tabResults && <p className="mt-20 text-lg">{tabResults}</p>}

          <div className="flex  fixed justify-center bottom-0 mb-10 w-full">
            <div className="bg-blue-200 flex items-center">
              <input
                className="text-black w-[300px]"
                type="text"
                onChange={(e) => setSearchString(e.target.value)}
                value={searchString}
              />
              <button
                className="bg-blue-600 disabled:bg-gray-500"
                onClick={searchTab}
                disabled={tabIsFetching}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
