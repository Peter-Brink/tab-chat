"use client";

import { useEffect, useState, useRef } from "react";

import {
  fetchStream,
  setRedisCookies,
  clearTabHistory,
  clearAllHistory,
  getChatHistory,
} from "@/lib/network/api-connector";
import SideDrawer from "@/components/side-drawer";
import MarkdownConverter from "@/lib/utility/markdown-converter";
import SearchBar from "@/components/search-bar";

const Search = () => {
  const [messageArray, setMessageArray] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const [selectedText, setSelectedText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tabText, setTabText] = useState("");
  const [tabResults, setTabResults] = useState("");

  const [shouldAllowTab, setShouldAllowTab] = useState(true);
  const [screenSizeAllowed, setScreenSizeAllowed] = useState(true);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setShouldAllowTab(window.innerWidth >= 1230);
      setScreenSizeAllowed(window.innerWidth >= 745);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    retrieveChatHistory();

    const handleTextSelection = (e) => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(selection.toString());

          setPopupPosition({
            top: rect.top + window.scrollY - 44,
            left: rect.left + window.scrollX,
          });
        } else {
          setSelectedText("");
        }
      }, 0);
    };

    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  const toggleTabDrawer = async (e) => {
    if (isDrawerOpen) {
      setTabResults("");
      setTabText("");
      await clearTabHistory();
    }
    setIsDrawerOpen((prevState) => !prevState);
  };

  const handlePopupReplyButtonClick = (e) => {
    setReplyText(selectedText);
  };

  const handlePopupTabButtonClick = async (e) => {
    setTabResults("");
    await clearTabHistory();
    if (!isDrawerOpen) {
      toggleTabDrawer();
    }
    setTabText(selectedText);
  };

  function handleNewChunk(chunk) {
    setMessageArray((prev) => {
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

  const handleSearch = async () => {
    if (isFetching || !searchString) return;
    setMessageArray((prev) => {
      return [...prev, { role: "user", text: searchString }];
    });
    setIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString, replyText);
    setReplyText("");
    fetchStream((chunk) => {
      handleNewChunk(chunk);
    }).then(() => {
      setIsFetching(false);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents creating a new line in the textarea
      handleSearch(); // Trigger the submit action
    }
  };

  const handleClearChat = async () => {
    await clearAllHistory();
    setTabText("");
    setSelectedText("");
    setReplyText("");
    setTabResults("");
    setMessageArray([]);
  };

  async function retrieveChatHistory() {
    const history = await getChatHistory();
    if (!history) return;
    const formattedHistory = history.map((item) => {
      return { role: item.role, text: item.parts[0].text };
    });
    setMessageArray(() => formattedHistory);
  }

  return screenSizeAllowed ? (
    <div className="flex w-screen h-screen items-center overflow-hidden bg-myBackgroundGrey">
      <div className="flex flex-col h-screen flex-grow items-center pr-12 pl-12">
        <div className="relative max-w-[1000px] w-full flex h-full">
          <div className="mt-20 mb-24 prose prose-invert prose-p:m-3 prose-code:text-gray-300 w-full max-w-[1000px] overflow-auto scrollable">
            <div className="mb-24">
              {messageArray.map((message, index) => {
                return (
                  <div
                    key={index}
                    className={`flex mb-7 items-center ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`text-base leading-7 text-myTextGrey ${
                        message.role === "model"
                          ? "text-left text-[17px] rounded-xl"
                          : "bg-myMessageGrey rounded-3xl pl-4 pr-4"
                      }`}
                    >
                      <MarkdownConverter input={message.text} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <SearchBar
            setSearchString={setSearchString}
            searchString={searchString}
            handleSearch={handleSearch}
            handleKeyDown={handleKeyDown}
            isFetching={isFetching}
            replyTo={replyText}
            setReplyTo={setReplyText}
          />
        </div>
      </div>
      <div
        className={`flex bg-myMessageGrey h-screen transition-all duration-500 ease-in-out rounded-l-3xl ${
          isDrawerOpen ? "w-[500px]" : "w-0"
        }`}
        style={{ boxShadow: "-5px 0px 10px rgba(0, 0, 0, 0.2)" }}
      >
        <SideDrawer
          tabText={tabText}
          tabResults={tabResults}
          setTabResults={setTabResults}
        />
      </div>

      {selectedText && (
        <div
          ref={popupRef}
          className="absolute flex items-center justify-center cursor-pointer text-myTextGrey w-[140px] h-[30px] rounded-xl shadow-lg space-x-2"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div
            className="pl-4 pr-4 pt-1 pb-1 flex items-center justify-center border-2 border-myMessageGrey bg-popupGrey hover:bg-myMessageGrey rounded-2xl"
            onClick={handlePopupReplyButtonClick}
          >
            Quote
          </div>
          {shouldAllowTab && (
            <div
              className="pl-4 pr-4 pt-1 pb-1 flex items-center justify-center border-2 border-myMessageGrey bg-popupGrey hover:bg-myMessageGrey rounded-2xl"
              onClick={handlePopupTabButtonClick}
            >
              Tab
            </div>
          )}
        </div>
      )}

      {shouldAllowTab && (
        <button
          onClick={toggleTabDrawer}
          className={`fixed top-5 cursor-pointer right-10 bg-myTextGrey text-black hover:text-myTextGrey pl-4 pr-4 pt-2 pb-2 rounded-2xl focus:outline-none hover:shadow-2xl transition-all duration-300 ease-in-out ${
            isDrawerOpen
              ? "hover:bg-myBackgroundGrey"
              : "hover:bg-myMessageGrey"
          }`}
        >
          {isDrawerOpen ? "Close" : "Tab"}
        </button>
      )}

      <button
        className={`fixed top-5 cursor-pointer left-10 bg-myTextGrey text-black hover:bg-myMessageGrey hover:text-myTextGrey pl-4 pr-4 pt-2 pb-2 rounded-2xl focus:outline-none transition-all duration-300 ease-in-out`}
        onClick={handleClearChat}
      >
        Clear chat
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-myBackgroundGrey">
      <h1 className="text-5xl text-myTextGrey mb-6 mt-32">Sorry!</h1>
      <p className="text-lg pl-8 pr-8 mb-4 text-center text-myTextGrey">
        tabChat is not currently available on this screen size.
      </p>
      <p className="text-lg text-myTextGrey">please use a larger device.</p>
    </div>
  );
};

export default Search;
