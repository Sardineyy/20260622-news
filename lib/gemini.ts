import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NewsArticle } from "./news";
import { getGeminiApiKey } from "./env";
import { formatReportHtml } from "./markdown";

const MODEL_NAME = "gemini-2.5-flash";

export async function generateReport(
  keyword: string,
  articles: NewsArticle[]
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API 키 환경변수가 설정되지 않았습니다. (GEMINI_API_KEY, Gemini_api 등)"
    );
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

## 보고서 구조 (반드시 아래 순서와 형식을 따를 것)

### 1. 핵심 요약 (최상단)
- 보고서 제목(#) 아래에 가장 먼저 배치
- "${keyword}" 관련 최근 7일 흐름을 글머리 기호(-) 목록 3~5개로 압축 요약
- 전체 동향과 가장 주목할 점을 한눈에 파악할 수 있게 작성

### 2. 주요 이슈 TOP 5
- 수집된 기사를 분석해 가장 중요한 이슈 5개를 선정
- 이슈가 5개 미만이면 있는 만큼만 작성
- 각 이슈는 ## 로 번호와 제목을 표기 (예: "## 1. ○○○")

### 3. 이슈별 상세 (각 TOP 5 항목마다 아래 3가지를 반드시 포함)
각 이슈마다 ### 소제목 3개를 사용하여 구분:
- **핵심 내용**: 해당 이슈의 사실 관계와 주요 내용을 글머리 기호(-) 목록 2~4개로 설명
- **중요한 이유**: 이 이슈가 "${keyword}" 분야에서 왜 주목받는지, 업계·사회적 영향을 글머리 기호(-) 목록 2~3개로 설명
- **출처**: 관련 기사 제목과 링크를 글머리 기호(-) 목록으로 제시 (형식: - [기사 제목](링크))

## 작성 규칙
- 한국어로 작성
- 객관적이고 전문적인 톤 유지
- **반드시 마크다운만 사용** (HTML 태그 사용 금지)
- 제목 계층: # (보고서 제목), ## (섹션), ### (소제목)
- 핵심 요약, 핵심 내용, 중요한 이유 등 모든 설명에 **글머리 기호(-) 목록**을 적극 활용해 가독성을 높일 것
- 강조는 **굵게** 표기
- 각 섹션을 명확히 구분
- 향후 전망, 참고 기사 목록 등 위 구조 외 섹션은 추가하지 말 것

## 수집된 뉴스 기사 (${articles.length}건)
${articlesText || "수집된 기사가 없습니다. 키워드 관련 일반적인 AI 동향을 기반으로 보고서를 작성해주세요."}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return formatReportHtml(response.text());
}
