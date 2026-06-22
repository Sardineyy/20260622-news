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

## 보고서 구조 (반드시 아래 순서대로, 2개 대섹션만 작성)

# [보고서 제목]
"${keyword}" 관련 주간 이슈 보고서

## 1. 핵심 요약
"${keyword}" 관련 최근 7일 전체 흐름을 3~5문장의 문단으로 작성합니다.

## 2. 주요 이슈 TOP 5
가장 중요한 이슈 5개를 선정합니다 (5개 미만이면 있는 만큼만).

**각 이슈는 반드시 아래 순서로 완성한 뒤, 다음 이슈로 넘어가세요.**
모든 이슈 제목을 먼저 나열하지 마세요. 1번 이슈의 내용을 전부 쓴 다음 2번 이슈를 시작하세요.

### 1. [이슈 제목]
**핵심 뉴스**
(해당 이슈의 사실 관계와 주요 내용을 2~4문장으로 서술)

**중요한 이유**
(이 이슈가 "${keyword}" 분야에서 왜 주목받는지, 영향을 2~3문장으로 서술)

**출처**
[기사 제목](링크)

### 2. [이슈 제목]
**핵심 뉴스**
...

**중요한 이유**
...

**출처**
...

(3~5번 이슈도 동일한 형식으로 이어서 작성)

## 작성 규칙
- 한국어로 작성
- 객관적이고 전문적인 톤 유지
- **반드시 마크다운만 사용** (HTML 태그 절대 사용 금지)
- 제목 계층: # → ## → ### 만 사용
- **핵심 뉴스**, **중요한 이유**, **출처**는 ### 소제목이 아니라 **굵은 라벨**로 표기 후 바로 내용을 이어서 작성
- 글머리 기호(-) 목록 사용 금지
- 향후 전망, 참고 기사 목록 등 위 구조 외 섹션 추가 금지

## 수집된 뉴스 기사 (${articles.length}건)
${articlesText || "수집된 기사가 없습니다. 키워드 관련 일반적인 AI 동향을 기반으로 보고서를 작성해주세요."}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return formatReportHtml(response.text());
}
