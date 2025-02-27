"use client";

import { useImperativeHandle, useState, forwardRef, useRef } from "react";
import { setRedisCookies, fetchTabStream } from "@/lib/network/api-connector";
import MarkdownConverter from "@/lib/utility/markdown-converter";
import { useCustomScroll, useShouldScroll } from "@/hooks/scroll-hooks";
import { ChevronDown } from "lucide-react";

const SideDrawer = forwardRef(({ tabText, inputRef }, ref) => {
  const [tabSearchString, setTabSearchString] = useState("");
  const [tabIsFetching, setTabIsFetching] = useState(false);
  const [tabMessageArray, setTabMessageArray] = useState([]);
  const [showTabScrollButton, setShowTabScrollButton] = useState(false);

  const scrollRef = useRef(null);

  useCustomScroll(scrollRef, setShowTabScrollButton);
  useShouldScroll(scrollRef, tabMessageArray);

  useImperativeHandle(ref, () => {
    return {
      clearTabMessages: () => {
        setTabMessageArray([]);
        setShowTabScrollButton(false);
        setTabSearchString("");
      },
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

  const handleScrollRequest = () => {
    setShowTabScrollButton(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents creating a new line in the textarea
      searchTab(); // Trigger the submit action
    }
  };

  return (
    <div className="flex flex-col flex-grow mt-20 p-7">
      {tabText && (
        <div>
          <p className="text-lg mb-12 font-bold transition-all text-center duration-500 ease-in-out text-myTextGrey">
            "{tabText}"
          </p>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex flex-col flex-grow prose prose-invert overflow-auto scrollable items-center"
      >
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
        {showTabScrollButton && (
          <div
            className="flex absolute bottom-20 items-center justify-center rounded-3xl h-7 w-7 bg-myBackgroundGrey hover:bg-myQuoteBackground"
            onClick={handleScrollRequest}
          >
            <ChevronDown className="text-myTextGrey" />
          </div>
        )}
      </div>
      <div className="flex items-center w-full">
        <input
          ref={inputRef}
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
