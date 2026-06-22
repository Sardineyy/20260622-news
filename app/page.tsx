"use client";

import { useState } from "react";
import styles from "./page.module.css";

const EXAMPLE_KEYWORDS = [
  "ChatGPT",
  "Gemini",
  "생성형 AI",
  "AI 반도체",
  "AI 규제",
  "머신러닝",
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    report?: string;
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
          report: data.report,
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
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.logo}>
            <span className={styles.logoAi}>AI</span>
            <span className={styles.logoNews}>News</span>
            <span className={styles.logoReporter}>Reporter</span>
          </h1>
          <p className={styles.description}>
            키워드를 입력하면 최근 7일 이내 주요 이슈를 자동으로 수집하여
            보고서를 생성하고 이메일로 발송합니다.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="AI 관련 키워드를 입력하세요"
              className={styles.searchInput}
              disabled={loading}
            />
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>예시 키워드:</span>
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

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !keyword.trim()}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  보고서 생성 중...
                </>
              ) : (
                "보고서 생성 및 이메일 발송"
              )}
            </button>
          </div>
        </form>

        {result && (
          <div
            className={`${styles.result} ${
              result.type === "success" ? styles.resultSuccess : styles.resultError
            }`}
          >
            <p className={styles.resultMessage}>{result.message}</p>
            {result.type === "success" && result.articleCount !== undefined && (
              <p className={styles.resultMeta}>
                수집된 기사: {result.articleCount}건 | 수신: psj0110@gmail.com
              </p>
            )}
            {result.report && (
              <div
                className={styles.reportPreview}
                dangerouslySetInnerHTML={{ __html: result.report }}
              />
            )}
          </div>
        )}

        <footer className={styles.footer}>
          <p>Powered by Gemini 2.5 Flash</p>
        </footer>
      </div>
    </main>
  );
}
