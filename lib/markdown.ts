import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

function stripCodeFences(text: string): string {
  const cleaned = text.trim();
  const fenceMatch = cleaned.match(
    /^```(?:html|markdown|md)?\s*\n?([\s\S]*?)\n?```$/i
  );
  if (fenceMatch) return fenceMatch[1].trim();
  return cleaned;
}

function hasMarkdownSyntax(text: string): boolean {
  return (
    /^#{1,6}\s/m.test(text) ||
    /^\s*[-*+]\s/m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /^\s*\d+\.\s/m.test(text)
  );
}

function hasHtmlTags(text: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(text);
}

/** Gemini 응답(마크다운/HTML 혼합)을 이메일·화면용 HTML로 변환 */
export function formatReportHtml(raw: string): string {
  const cleaned = stripCodeFences(raw);

  if (hasHtmlTags(cleaned) && !hasMarkdownSyntax(cleaned)) {
    return cleaned;
  }

  return marked.parse(cleaned) as string;
}
