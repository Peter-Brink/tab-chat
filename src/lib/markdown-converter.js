import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MarkdownConverter({ input }) {
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
}
