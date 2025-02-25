"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchStream,
  setRedisCookies,
  clearTabHistory,
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

  const popupRef = useRef(null);

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
    fetchStream((chunk) => {
      handleNewChunk(chunk);
    }).then(() => {
      setIsFetching(false);
      setReplyText("");
    });
  };

  async function retrieveChatHistory() {
    const history = await getChatHistory();
    if (!history) return;
    const formattedHistory = history.map((item) => {
      return { role: item.role, text: item.parts[0].text };
    });
    setMessageArray(() => formattedHistory);
  }

  return (
    <div className="flex w-screen h-screen items-center overflow-hidden bg-myBackgroundGrey">
      <div className="flex flex-col h-screen flex-grow items-center pr-32 pl-32">
        <div className="flex flex-col mt-10 mb-24 prose prose-p:m-3 prose-code:text-gray-300 w-full max-w-[1000px] overflow-y-auto">
          {messageArray.map((message, index) => {
            return (
              <div
                key={index}
                className={`flex mb-6 items-center ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`text-base leading-7 text-myTextGrey ${
                    message.role === "model"
                      ? "text-left rounded-xl"
                      : "bg-myMessageGrey rounded-3xl pl-4 pr-4"
                  }`}
                >
                  <MarkdownConverter input={message.text} />
                </div>
              </div>
            );
          })}
        </div>
        <SearchBar
          setSearchString={setSearchString}
          searchString={searchString}
          handleSearch={handleSearch}
          isFetching={isFetching}
        />
      </div>
      <div
        className={`flex bg-myMessageGrey h-screen transition-all duration-500 ease-in-out rounded-l-3xl ${
          isDrawerOpen ? "w-[500px]" : "w-0"
        }`}
        style={{ boxShadow: "-5px 0px 10px rgba(0, 0, 0, 0.2)" }}
      >
        <SideDrawer
          isDrawerOpen={isDrawerOpen}
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
            Reply
          </div>
          <div
            className="pl-4 pr-4 pt-1 pb-1 flex items-center justify-center border-2 border-myMessageGrey bg-popupGrey hover:bg-myMessageGrey rounded-2xl"
            onClick={handlePopupTabButtonClick}
          >
            Tab
          </div>
        </div>
      )}

      <button
        onClick={toggleTabDrawer}
        className={`fixed top-5 cursor-pointer right-10 bg-gradient-to-b from-gradientBlue1 to-gradientBlue2 text-myTextGrey pl-4 pr-4 pt-2 pb-2 rounded-2xl focus:outline-none hover:shadow-2xl`}
      >
        {isDrawerOpen ? "Close" : "Tab"}
      </button>

      <button
        onClick={toggleTabDrawer}
        className={`fixed top-5 cursor-pointer left-10 bg-myTextGrey text-black hover:bg-myMessageGrey hover:text-myTextGrey pl-4 pr-4 pt-2 pb-2 rounded-2xl focus:outline-none`}
      >
        Clear chat
      </button>
    </div>
  );
};

export default Search;
