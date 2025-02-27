import { useEffect } from "react";

export const useCustomScroll = (
  scrollRef,
  setShowScrollButton,
  allowAutoScroll,
  previousScrollPosition,
  tab = false
) => {
  useEffect(() => {
    const handleSetShowScrollButton = () => {
      const scrollIsAtBottom =
        scrollRef.current.scrollTop >=
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (scrollIsAtBottom) {
        allowAutoScroll.current = true;
      }

      const currentScrollPosition = scrollRef.current.scrollTop;

      if (currentScrollPosition < previousScrollPosition.current) {
        allowAutoScroll.current = false;
      }

      const offset = tab ? 400 : 140;

      const shouldShowScrollButton =
        scrollRef.current.scrollTop <=
        scrollRef.current.scrollHeight -
          scrollRef.current.clientHeight -
          offset;

      previousScrollPosition.current = currentScrollPosition;
      setShowScrollButton(shouldShowScrollButton);
    };

    const scrollElement = scrollRef.current;
    scrollElement.addEventListener("scroll", handleSetShowScrollButton);
    return () => {
      scrollElement.removeEventListener("scroll", handleSetShowScrollButton);
    };
  }, []);
};

export const useShouldScroll = (
  scrollRef,
  messageArray,
  allowAutoScroll,
  tab = false
) => {
  useEffect(() => {
    const offset = tab ? 700 : 250;

    const shouldAutoScroll =
      scrollRef.current.scrollTop >
        scrollRef.current.scrollHeight -
          scrollRef.current.clientHeight -
          offset && allowAutoScroll.current;

    if (shouldAutoScroll || scrollRef.current.scrollTop === 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messageArray]);
};
