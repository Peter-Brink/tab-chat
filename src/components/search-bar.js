export default function ({
  setSearchString,
  searchString,
  handleSearch,
  isFetching,
  tab = false,
}) {
  return (
    <div className="absolute bottom-8 rounded-3xl w-full max-w-[1000px]">
      <div className="flex justify-center">
        <div
          className={`flex flex-grow h-[88px] items-end rounded-3xl pl-6 pr-4 pt-4 pb-4 ${
            tab ? "bg-white" : "bg-myMessageGrey"
          }`}
        >
          <textarea
            placeholder="Ask away..."
            autoCapitalize="sentences"
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
