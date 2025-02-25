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
            top: rect.top + window.scrollY + rect.height + 10,
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
    if (isFetching) return;
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
    <div className="flex w-screen h-screen items-center overflow-hidden bg-white">
      <div className="flex flex-col h-screen flex-grow items-center">
        <div className="flex flex-col mt-10 mb-24 prose prose-code:text-gray-300 w-full max-w-[1000px] overflow-y-auto">
          {messageArray.map((test, index) => {
            return (
              <div
                key={index}
                className={`mb-6 text-lg ${
                  test.role === "model"
                    ? "text-left text-white pl-10 pr-10 bg-purple-800 rounded-xl"
                    : "text-right bg-white rounded-xl text-black pl-10 pr-10"
                }`}
              >
                <MarkdownConverter input={test.text} />
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 bg-gray-300">
          <div className=" h-10 flex justify-center mb-10 ml-10 mr-10 mt-4">
            <input
              className="text-black w-[300px] rounded-2xl mr-4 p-4"
              type="text"
              onChange={(e) => setSearchString(e.target.value)}
              value={searchString}
            />
            <button
              className="bg-blue-600 disabled:bg-gray-500 w-20 rounded-2xl"
              onClick={handleSearch}
              disabled={isFetching}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div
        className={`flex bg-gray-400 h-screen transition-all duration-500 ease-in-out ${
          isDrawerOpen ? "w-[400px]" : "w-0"
        }`}
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
          className="absolute flex items-center justify-center cursor-pointer bg-gray-400 text-black w-[140px] h-[30px] rounded shadow-lg"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div
            className="w-[70px] h-[30px] flex items-center justify-center hover:bg-gray-600 hover:text-white rounded"
            onClick={handlePopupReplyButtonClick}
          >
            Reply
          </div>
          <div
            className="w-[70px] h-[30px] flex items-center justify-center hover:bg-gray-600 hover:text-white rounded"
            onClick={handlePopupTabButtonClick}
          >
            Tab
          </div>
        </div>
      )}

      <button
        onClick={toggleTabDrawer}
        className={`absolute top-5 right-10 bg-blue-600 text-white p-3 rounded-lg shadow-lg focus:outline-none transition-all duration-300 ease-in-out`}
      >
        Tab
      </button>
    </div>
  );
};

export default Search;
