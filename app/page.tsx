"use client";

import { useEffect, useState } from "react";
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

const SEARCH_HISTORY_KEY = "ai-news-reporter-search-history";
const RECIPIENT_EMAIL = "psj0110@gmail.com";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    emailSubject?: string;
    emailHtml?: string;
    articleCount?: number;
    recipientEmail?: string;
    searchedKeyword?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {
      setSearchHistory([]);
    }
  }, []);

  const saveSearchHistory = (history: string[]) => {
    setSearchHistory(history);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  };

  const addToSearchHistory = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const next = [trimmed, ...searchHistory.filter((k) => k !== trimmed)].slice(
      0,
      10
    );
    saveSearchHistory(next);
  };

  const clearSearchHistory = () => {
    saveSearchHistory([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const searchedKeyword = keyword.trim();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchedKeyword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error });
      } else {
        addToSearchHistory(searchedKeyword);
        setResult({
          type: "success",
          message: data.message,
          emailSubject: data.emailSubject,
          emailHtml: data.emailHtml,
          articleCount: data.articleCount,
          recipientEmail: data.recipientEmail ?? RECIPIENT_EMAIL,
          searchedKeyword,
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

  const handleHistoryClick = (item: string) => {
    setKeyword(item);
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

          {searchHistory.length > 0 && (
            <div className={styles.historyRow}>
              <div className={styles.historyContent}>
                <span className={styles.historyLabel}>검색 기록:</span>
                <div className={styles.historyTags}>
                  {searchHistory.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={styles.historyTag}
                      onClick={() => handleHistoryClick(item)}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className={styles.clearHistoryButton}
                onClick={clearSearchHistory}
                disabled={loading}
              >
                검색 기록 삭제하기
              </button>
            </div>
          )}
        </form>

        {result?.type === "success" && result.recipientEmail && (
          <div className={styles.successBanner} role="status">
            <span className={styles.successIcon} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <p className={styles.successText}>
              보고서를{" "}
              <strong>{result.recipientEmail}</strong> 주소로 발송했습니다.
              메일함을 확인해 주세요.
            </p>
          </div>
        )}

        {result?.type === "error" && (
          <div className={`${styles.result} ${styles.resultError}`}>
            <p className={styles.resultMessage}>{result.message}</p>
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
              {result.searchedKeyword && (
                <p className={styles.emailSubject}>
                  <span className={styles.emailSubjectLabel}>키워드</span>
                  {result.searchedKeyword}
                  {result.articleCount !== undefined && (
                    <span className={styles.articleCount}>
                      · 수집 기사 {result.articleCount}건
                    </span>
                  )}
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
