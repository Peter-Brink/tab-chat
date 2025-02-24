"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchStream,
  fetchTabStream,
  setRedisCookies,
  clearTabHistory,
} from "@/lib/api-connector";
import TabButton from "@/components/side-drawer";

const Search = () => {
  const [searchString, setSearchString] = useState("");
  const [tabResults, setTabResults] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
      setTabResults(
        (prev) =>
          prev +
          "\n-------------------------------------------------------------------------\n\n"
      );
      setIsFetching(false);
      setTabText("");
    });
  };

  const search = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setSearchString("");
    await setRedisCookies(searchString, replyText);
    fetchStream((chunk) => {
      setSearchResults((prev) => prev + chunk);
    }).then(() => {
      setSearchResults(
        (prev) =>
          prev +
          "\n-------------------------------------------------------------------------\n\n"
      );
      setIsFetching(false);
      setReplyText("");
    });
  };

  return (
    <div className="flex flex-col w-screen min-h-screen items-center">
      <div className="flex flex-col flex-grow w-full max-w-[1000px] overflow-y-auto">
        <p className="whitespace-pre-line">{searchResults}</p>
      </div>
      <div className="flex fixed bottom-0 mb-10 w-full justify-center">
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
            disabled={isFetching}
          >
            Search
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
