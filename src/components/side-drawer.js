"use client";

import { useImperativeHandle, useState, forwardRef } from "react";
import { setRedisCookies, fetchTabStream } from "@/lib/network/api-connector";
import MarkdownConverter from "@/lib/utility/markdown-converter";

const SideDrawer = forwardRef(({ tabText }, ref) => {
  const [tabSearchString, setTabSearchString] = useState("");
  const [tabIsFetching, setTabIsFetching] = useState(false);
  const [tabMessageArray, setTabMessageArray] = useState([]);

  useImperativeHandle(ref, () => {
    return {
      clearTabMessages: () => setTabMessageArray([]),
    };
  });

  function handleNewTabChunk(chunk) {
    setTabMessageArray((prev) => {
      const newState =
        prev[prev.length - 1].role === "user"
          ? [...prev, { role: "model", text: chunk }]
          : [
              ...prev.slice(0, -1),
              {
                role: "model",
                text: prev[prev.length - 1].text + chunk,
              },
            ];

      return newState;
    });
  }

  async function searchTab() {
    if (tabIsFetching || !tabSearchString) return;
    setTabMessageArray((prev) => {
      return [...prev, { role: "user", text: tabSearchString }];
    });
    setTabIsFetching(true);
    setTabSearchString("");
    await setRedisCookies(tabSearchString, tabText, true);
    fetchTabStream((chunk) => {
      handleNewTabChunk(chunk);
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
    <div className="flex flex-col flex-grow mt-12 p-7">
      <div className="flex flex-col flex-grow prose prose-invert overflow-auto items-center">
        {tabText && (
          <div>
            <p className="text-lg mb-12 font-bold transition-all duration-500 ease-in-out text-myTextGrey">
              "{tabText}"
            </p>
          </div>
        )}
        <div className="text-base mt-0 prose-p:m-2 w-full transition-all duration-500 ease-in-out text-myTextGrey">
          {tabMessageArray.map((message, index) => {
            return (
              <div
                key={index}
                className={`flex flex-grow mb-7 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`text-base ${
                    message.role === "model"
                      ? "text-left text-[15px] leading-7 text-myTextGrey rounded-xl"
                      : "bg-myTextGrey text-[15px] text-myMessageGrey rounded-3xl pl-4 pr-4"
                  }`}
                >
                  <MarkdownConverter input={message.text} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center w-full">
        <input
          className="text-black h-10 rounded-2xl flex-grow mr-4 p-4 focus:outline-none bg-myTextGrey"
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Get more context..."
          onChange={(e) => setTabSearchString(e.target.value)}
          value={tabSearchString}
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
});

export default SideDrawer;
