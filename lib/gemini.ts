import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NewsArticle } from "./news";

const MODEL_NAME = "gemini-2.5-flash";

export async function generateReport(
  keyword: string,
  articles: NewsArticle[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const articlesText = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title}\n출처: ${a.source}\n날짜: ${a.pubDate}\n링크: ${a.link}\n${a.snippet ? `요약: ${a.snippet}` : ""}`
    )
    .join("\n\n");

  const prompt = `당신은 AI 뉴스 전문 리포터입니다. 아래 수집된 최근 7일 이내 뉴스 기사들을 바탕으로 "${keyword}" 키워드에 대한 종합 보고서를 작성해주세요.

## 작성 지침
- 한국어로 작성
- 보고서 제목, 핵심 요약(3~5문장), 주요 이슈 분석(항목별), 향후 전망, 참고 기사 목록 순으로 구성
- 객관적이고 전문적인 톤 유지
- HTML 형식으로 작성 (h1, h2, p, ul, li, a 태그 사용)
- 각 섹션을 명확히 구분

## 수집된 뉴스 기사 (${articles.length}건)
${articlesText || "수집된 기사가 없습니다. 키워드 관련 일반적인 AI 동향을 기반으로 보고서를 작성해주세요."}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
