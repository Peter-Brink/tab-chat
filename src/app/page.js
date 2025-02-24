"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchStream,
  fetchTabStream,
  setRedisCookies,
  clearTabHistory,
  getChatHistory,
} from "@/lib/api-connector";
import TabButton from "@/components/side-drawer";

const Search = () => {
  const [testArray, setTestArray] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [tabResults, setTabResults] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tabText, setTabText] = useState("");

  // Toggle drawer visibility
  const toggleDrawer = async (e) => {
    if (isDrawerOpen) {
      setTabResults("");
      setTabText("");
      await clearTabHistory();
    }
    setIsDrawerOpen((prevState) => !prevState);
  };

  useEffect(() => {
    retrieveChatHistory();

    const handleTextSelection = (e) => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (selection.toString().includes("---")) {
            setSelectedText("");
            return;
          }
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

  const handleReply = (e) => {
    console.log(selectedText);
    setReplyText(selectedText);
  };

  const handleTab = async (e) => {
    setTabResults("");
    await clearTabHistory();
    if (!isDrawerOpen) {
      toggleDrawer();
    }
    setTabText(selectedText);
  };

  const searchTab = async (tabSearchString) => {
    if (isFetching) return;
    setIsFetching(true);
    await setRedisCookies(tabSearchString, tabText, true);
    fetchTabStream((chunk) => {
      setTabResults((prev) => prev + chunk);
    }).then(() => {
      setIsFetching(false);
    });
  };

  function handleChunk(chunk) {
    setTestArray((prev) => {
      if (prev.length === 0) {
        return [{ role: "model", text: chunk, isComplete: false }];
      }
      const newState = prev[prev.length - 1].isComplete
        ? [...prev, { role: "model", text: chunk, isComplete: false }]
        : [
            ...prev.slice(0, -1),
            {
              role: "model",
              text: prev[prev.length - 1].text + chunk,
              isComplete: false,
            },
          ];

      return newState;
    });
  }

  function setIsComplete() {
    setTestArray((prev) => {
      return [
        ...prev.slice(0, -1),
        {
          role: prev[prev.length - 1].role,
          text: prev[prev.length - 1].text,
          isComplete: true,
        },
      ];
    });
  }

  async function retrieveChatHistory() {
    const history = await getChatHistory();
    const formattedHistory = history.map((item) => {
      return { role: item.role, text: item.parts[0].text, isComplete: true };
    });
    setTestArray(() => formattedHistory);
  }

  const search = async () => {
    if (isFetching) return;
    setTestArray((prev) => {
      return [...prev, { role: "user", text: searchString, isComplete: true }];
    });
    setIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString, replyText);
    fetchStream((chunk) => {
      handleChunk(chunk);
    }).then(() => {
      setIsComplete();
      setIsFetching(false);
      setReplyText("");
    });
  };

  return (
    <div className="flex flex-col w-screen min-h-screen items-center">
      <div className="flex flex-col flex-grow w-full max-w-[1000px] overflow-y-auto">
        {testArray.map((test, index) => {
          return (
            <div
              key={index}
              className={`mb-6 text-lg ${
                test.role === "model"
                  ? "bg-blue-300 text-left"
                  : "bg-green-300 text-right"
              }`}
            >
              <p className="whitespace-pre-line text-black">{test.text}</p>
            </div>
          );
        })}
      </div>
      <div className="flex fixed bottom-0 mb-10 w-full justify-center">
        <div className="w-[600px] flex items-center">
          <input
            className="text-black w-[300px]"
            type="text"
            onChange={(e) => setSearchString(e.target.value)}
            value={searchString}
          />
          <button
            className="bg-blue-600 disabled:bg-gray-500 mr-20"
            onClick={search}
            disabled={isFetching}
          >
            Search
          </button>
          <button className="bg-orange-600 disabled:bg-gray-500">
            Get History
          </button>
        </div>
      </div>

      {selectedText && (
        <div
          ref={popupRef}
          className="absolute flex items-center justify-center cursor-pointer bg-gray-400 text-black w-[140px] h-[30px] rounded shadow-lg"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div
            className="w-[70px] h-[30px] flex items-center justify-center hover:bg-gray-600 hover:text-white rounded"
            onClick={handleReply}
          >
            Reply
          </div>
          <div
            className="w-[70px] h-[30px] flex items-center justify-center hover:bg-gray-600 hover:text-white rounded"
            onClick={handleTab}
          >
            Tab
          </div>
        </div>
      )}

      <TabButton
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        tabText={tabText}
        searchTab={searchTab}
        tabResults={tabResults}
      />
    </div>
  );
};

export default Search;
