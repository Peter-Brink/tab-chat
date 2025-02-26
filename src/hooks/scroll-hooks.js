import { useEffect } from "react";

export const useCustomScroll = (scrollRef, setShowScrollButton) => {
  useEffect(() => {
    const handleSetShowScrollButton = () => {
      const shouldShowScrollButton =
        scrollRef.current.scrollTop <=
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight - 250;

      setShowScrollButton(shouldShowScrollButton);
    };

    const scrollElement = scrollRef.current;
    scrollElement.addEventListener("scroll", handleSetShowScrollButton);
    return () => {
      scrollElement.removeEventListener("scroll", handleSetShowScrollButton);
    };
  }, []);
};

export const useShouldScroll = (scrollRef, messageArray) => {
  useEffect(() => {
    const shouldScroll =
      scrollRef.current.scrollTop >
      scrollRef.current.scrollHeight - scrollRef.current.clientHeight - 250;

    if (shouldScroll || scrollRef.current.scrollTop === 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messageArray]);
};
