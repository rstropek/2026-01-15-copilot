import { marked } from "marked";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export function renderMarkdownToSafeHtml(markdown: string): string {
  const { window } = new JSDOM("");
  const DOMPurify = createDOMPurify(
    window as unknown as Parameters<typeof createDOMPurify>[0]
  );

  const rawHtml = marked.parse(markdown, {
    gfm: true,
    breaks: true,
  }) as string;

  return DOMPurify.sanitize(rawHtml);
}
