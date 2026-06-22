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

function htmlToMarkdownText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/h([1-6])>/gi, "\n\n")
    .replace(/<h([1-6])[^>]*>/gi, (_, level) => "\n" + "#".repeat(Number(level)) + " ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeMarkdown(text: string): string {
  return text
    .replace(/^(#{1,6})([^\s#\n])/gm, "$1 $2")
    .replace(/[ \t]+$/gm, "");
}

function convertResidualMarkdownInHtml(html: string): string {
  let result = html;

  result = result.replace(
    /<p>\s*(#{1,6})\s+([^<]+?)\s*<\/p>/gi,
    (_, hashes: string, title: string) => {
      const level = Math.min(hashes.length, 6);
      return `<h${level}>${title.trim()}</h${level}>`;
    }
  );

  result = result.replace(
    /(#{1,6})\s+([^\n<]+)/g,
    (match, hashes: string, title: string) => {
      if (match.includes("<")) return match;
      const level = Math.min(hashes.length, 6);
      return `<h${level}>${title.trim()}</h${level}>`;
    }
  );

  return result;
}

/** Gemini 응답을 이메일·화면용 HTML로 변환 (마크다운 기호 미노출 보장) */
export function formatReportHtml(raw: string): string {
  let text = stripCodeFences(raw);

  if (/<\/?[a-z][\s\S]*?>/i.test(text)) {
    text = htmlToMarkdownText(text);
  }

  text = normalizeMarkdown(text);

  let html = marked.parse(text) as string;
  return convertResidualMarkdownInHtml(html);
}
