import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI News Reporter",
  description:
    "키워드를 입력하면 최근 7일 이내 주요 이슈를 자동으로 수집하여 보고서를 생성하고 이메일로 발송합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
