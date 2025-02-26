import { X } from "lucide-react";

export default function ({
  setSearchString,
  searchString,
  handleSearch,
  handleKeyDown,
  isFetching,
  replyTo,
  setReplyTo,
  tab = false,
}) {
  return (
    <div className="absolute bottom-0 bg-transparent w-full">
      {replyTo && (
        <div className="flex pl-5 pr-5 pt-3 pb-3 items-center justify-between w-full text-base bg-myQuoteBackground text-myTextGrey mb-2 rounded-3xl">
          <div className="line-clamp-2 max-h-12 w-full">
            "{replyTo}"
          </div>

          <div
            className="ml-2 w-[25px] h-[25px] cursor-pointer"
            onClick={() => setReplyTo("")}
          >
            <X className="text-myTextGrey hover:text-myBackgroundGrey" />
          </div>
        </div>
      )}
      <div className="flex justify-center mb-8 rounded-3xl">
        <div
          className={`flex flex-grow h-[116px] items-end rounded-3xl pl-6 pr-4 pt-4 pb-4 ${
            tab ? "bg-white" : "bg-myMessageGrey"
          }`}
        >
          <textarea
            placeholder="Ask away..."
            autoCapitalize="sentences"
            onKeyDown={handleKeyDown}
            className={`text-myTextgrey placeholder:text-myTextGrey text-mytextGrey text-xl w-full h-full focus:outline-none resize-none mr-4 ${
              tab ? "bg-white" : "bg-myMessageGrey"
            }`}
            onChange={(e) => setSearchString(e.target.value)}
            value={searchString}
          />
          <button
            className="bg-gradient-to-b text-myTextGrey cursor-pointer from-gradientBlue1 to-gradientBlue2 disabled:bg-gray-500 pl-4 pr-4 pt-2 pb-2 rounded-2xl"
            onClick={handleSearch}
            disabled={isFetching}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
