import { marked } from "marked";
import DOMPurify from "dompurify";
import React from "react";

const MarkdownConverter = React.memo(({ input }) => {
  if (!input) {
    return "";
  }

  const html = marked.parse(input);

  const sanitizedHtml = DOMPurify.sanitize(html);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
});

export default MarkdownConverter;
