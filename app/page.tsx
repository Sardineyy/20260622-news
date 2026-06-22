"use client";

import { useState } from "react";
import styles from "./page.module.css";

const EXAMPLE_KEYWORDS = [
  "OpenAI",
  "Gemini",
  "AI 반도체",
  "생성형 AI",
  "스타트업 투자",
  "공공데이터",
  "신약개발",
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    emailSubject?: string;
    emailHtml?: string;
    articleCount?: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error });
      } else {
        setResult({
          type: "success",
          message: data.message,
          emailSubject: data.emailSubject,
          emailHtml: data.emailHtml,
          articleCount: data.articleCount,
        });
      }
    } catch {
      setResult({
        type: "error",
        message: "서버와 통신 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setKeyword(example);
    setResult(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>AI NEWS REPORTER</p>
          <h1 className={styles.title}>
            <span className={styles.titleIcon} aria-hidden="true">
              📰
            </span>
            AI News Reporter
          </h1>
          <p className={styles.description}>
            키워드를 입력하면 최근 7일 이내 주요 이슈를 자동으로 수집하여
            보고서를 생성하고 이메일로 발송합니다.
          </p>
        </div>
      </header>

      <main className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.card}>
          <label className={styles.inputLabel} htmlFor="keyword">
            키워드
          </label>

          <div className={styles.inputRow}>
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: OpenAI, AI 반도체, 신약개발 ..."
              className={styles.searchInput}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !keyword.trim()}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  생성 중...
                </>
              ) : (
                "보고서 생성 및 이메일 발송"
              )}
            </button>
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>예시:</span>
            <div className={styles.exampleTags}>
              {EXAMPLE_KEYWORDS.map((example) => (
                <button
                  key={example}
                  type="button"
                  className={styles.exampleTag}
                  onClick={() => handleExampleClick(example)}
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </form>

        {result && (
          <div
            className={`${styles.result} ${
              result.type === "success"
                ? styles.resultSuccess
                : styles.resultError
            }`}
          >
            <p className={styles.resultMessage}>{result.message}</p>
            {result.type === "success" && result.articleCount !== undefined && (
              <p className={styles.resultMeta}>
                수집된 기사: {result.articleCount}건 | 수신: psj0110@gmail.com
              </p>
            )}
          </div>
        )}

        {result?.type === "success" && result.emailHtml && (
          <section className={styles.emailPreview}>
            <div className={styles.emailPreviewHeader}>
              <h2 className={styles.emailPreviewTitle}>발송된 보고서</h2>
              {result.emailSubject && (
                <p className={styles.emailSubject}>
                  <span className={styles.emailSubjectLabel}>제목</span>
                  {result.emailSubject}
                </p>
              )}
            </div>
            <div
              className={styles.emailBody}
              dangerouslySetInnerHTML={{ __html: result.emailHtml }}
            />
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Powered by Gemini (Google Search Grounding) · Resend · Next.js
        </p>
      </footer>
    </div>
  );
}
