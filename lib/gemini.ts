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

## 보고서 구조 (반드시 아래 2개 섹션만 작성)

# 보고서 제목
"${keyword}" 관련 주간 이슈 보고서 형태의 제목

## 1. 핵심 요약
- "${keyword}" 관련 최근 7일 전체 흐름을 3~5문장의 문단으로 압축 요약
- 가장 주목할 핵심 포인트를 한눈에 파악할 수 있게 작성

## 2. 주요 이슈 TOP 5
- 수집된 기사를 분석해 가장 중요한 이슈 5개를 선정 (5개 미만이면 있는 만큼만)
- 아래 형식으로 각 이슈를 ### 소제목으로 나열:

### 1. [이슈 제목]
### 2. [이슈 제목]
### 3. [이슈 제목]
... (최대 5개)

각 이슈(###)마다 **하나의 연속된 본문**으로 작성:
1) 먼저 해당 이슈가 "${keyword}"와 어떤 관련이 있는지 간략히 설명
2) 바로 이어서 수집된 기사에 근거한 실제 내용·사실·영향을 자연스럽게 서술 (3~6문장)
3) 관련 출처는 본문 마지막에 [기사 제목](링크) 형태로 1~2개 포함

**절대 작성하지 말 것:**
- "이슈별 상세", "핵심 내용", "중요한 이유", "출처" 같은 별도 소제목 섹션
- 항목을 나누는 글머리 기호(-) 목록
- 향후 전망, 참고 기사 목록 등 위 구조 외 섹션

## 작성 규칙
- 한국어로 작성
- 객관적이고 전문적인 톤 유지
- **반드시 마크다운만 사용** (HTML 태그 사용 금지)
- 제목 계층으로 상하 관계 표현: # (보고서 제목) → ## (대섹션) → ### (이슈 항목)
- 가독성은 제목 계층(# ## ###)과 문단 나누기로 확보 (글머리 기호 목록 사용 금지)
- 강조는 **굵게** 표기

## 수집된 뉴스 기사 (${articles.length}건)
${articlesText || "수집된 기사가 없습니다. 키워드 관련 일반적인 AI 동향을 기반으로 보고서를 작성해주세요."}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return formatReportHtml(response.text());
}
