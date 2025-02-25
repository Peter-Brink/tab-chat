import { marked } from "marked";
import DOMPurify from "dompurify";
import React, { useEffect } from "react";
import Prism from "prismjs";

import "prismjs/components/prism-dart";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";

const MarkdownConverter = React.memo(({ input }) => {
  if (!input) {
    return "";
  }

  useEffect(() => {
    marked.setOptions({
      highlight: (code, lang) => {
        return Prism.highlight(
          code,
          Prism.languages[lang] || Prism.languages.javascript,
          lang
        );
      },
    });
  }, []);

  const html = marked.parse(input);
  const sanitizedHtml = DOMPurify.sanitize(html);

  useEffect(() => {
    Prism.highlightAll();
  }, [sanitizedHtml]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
});

export default MarkdownConverter;
