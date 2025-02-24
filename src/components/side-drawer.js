"use client";

import { useState } from "react";

const SideDrawer = ({
  toggleDrawer,
  isDrawerOpen,
  tabText,
  searchTab,
  tabResults,
}) => {
  const [searchString, setSearchString] = useState("");

  const search = async () => {
    await searchTab(searchString);
    setSearchString("");
  };

  return (
    <div>
      {/* The button that triggers the drawer */}
      <button
        onClick={toggleDrawer}
        className={`fixed top-5 right-5 bg-blue-600 text-white p-3 rounded-lg shadow-lg focus:outline-none transition-all duration-300 ease-in-out z-20`}
      >
        Tab
      </button>

      {/* The side drawer */}
      <div
        className={`fixed flex h-screen bg-gray-500 w-96 top-0 right-0 text-white p-5 transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col w-96 min-h-screen items-center overflow-auto">
          {tabText && <p className="mt-20 text-lg">"{tabText}"</p>}
          <br />
          <br />
          {tabResults && <p className="mt-20 text-lg">{tabResults}</p>}

          <div className="flex fixed bottom-0 mb-10 w-full">
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
