# AI News Reporter

키워드를 입력하면 최근 7일 이내 주요 이슈를 자동으로 수집하여 보고서를 생성하고 이메일로 발송합니다.

## 기능

- Google 스타일 검색 UI
- Google News RSS를 통한 최근 7일 AI 뉴스 수집
- Gemini 2.5 Flash를 활용한 보고서 자동 생성
- 이메일 자동 발송 (psj0110@gmail.com)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env.local`로 복사 후 값을 입력합니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey)에서 발급 |
| `SMTP_USER` | Gmail 발송 계정 |
| `SMTP_PASS` | Gmail [앱 비밀번호](https://myaccount.google.com/apppasswords) |
| `REPORT_EMAIL` | 보고서 수신 이메일 (기본: psj0110@gmail.com) |

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 사용 방법

1. AI 관련 키워드를 입력하거나 예시 키워드를 클릭
2. **보고서 생성 및 이메일 발송** 버튼 클릭
3. Gemini 2.5 Flash가 뉴스를 분석하여 보고서 생성
4. psj0110@gmail.com 으로 보고서 이메일 발송

## 기술 스택

- **Frontend**: Next.js 15, React 19
- **AI**: Google Gemini 2.5 Flash
- **News**: Google News RSS
- **Email**: Nodemailer (Gmail SMTP)
