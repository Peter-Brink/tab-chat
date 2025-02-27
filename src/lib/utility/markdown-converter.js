import { marked } from "marked";
import DOMPurify from "dompurify";
import React, { useEffect } from "react";
import Prism from "prismjs";

import "prismjs/components/prism-dart";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";

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
