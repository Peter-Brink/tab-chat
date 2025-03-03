import { X, ChevronDown, ArrowUp } from "lucide-react";

export default function ({
  setSearchString,
  searchString,
  handleSearch,
  handleKeyDown,
  isFetching,
  replyTo,
  setReplyTo,
  showScrollButton,
  handleScroll,
  inputRef,
  tab = false,
}) {
  return (
    <div className="absolute bottom-0 bg-transparent w-full">
      {showScrollButton && (
        <div className="flex items-center justify-center h-8 w-full mb-2">
          <div
            className="flex items-center justify-center rounded-3xl h-8 w-8 bg-myMessageGrey hover:bg-myQuoteBackground"
            onClick={handleScroll}
          >
            <ChevronDown className="text-myTextGrey" />
          </div>
        </div>
      )}
      {replyTo && (
        <div className="flex pl-5 pr-5 pt-3 pb-3 items-center justify-between w-full text-base bg-myQuoteBackground text-myTextGrey mb-2 rounded-3xl">
          <div className="line-clamp-2 max-h-12 w-full">"{replyTo}"</div>
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
            ref={inputRef}
            autoFocus
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
            className={`bg-white text-black cursor-pointer disabled:opacity-50 pl-2 pr-2 pt-2 pb-2 rounded-full ${
              isFetching
                ? "bg-myTextGrey"
                : "transition-all duration-[300ms] hover:bg-black hover:text-white"
            }`}
            onClick={handleSearch}
            disabled={isFetching}
          >
            <ArrowUp className={isFetching ? "" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
