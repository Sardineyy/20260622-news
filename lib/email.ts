import { Resend } from "resend";
import { getResendApiKey } from "./env";

const RECIPIENT_EMAIL = "psj0110@gmail.com";
const DEFAULT_FROM = "AI News Reporter <onboarding@resend.dev>";

export async function sendReportEmail(
  keyword: string,
  reportHtml: string
): Promise<void> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY 환경변수가 설정되지 않았습니다. Resend(https://resend.com)에서 무료 API 키를 발급하세요."
    );
  }

  const recipient = process.env.REPORT_EMAIL ?? RECIPIENT_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: recipient,
    subject: `[AI News Reporter] "${keyword}" 주간 이슈 보고서 - ${today}`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">AI News Reporter</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">키워드: <strong>${keyword}</strong> | 생성일: ${today}</p>
        </div>
        ${reportHtml}
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;" />
        <p style="color: #888; font-size: 12px; text-align: center;">
          이 보고서는 AI News Reporter에 의해 자동 생성되었습니다.<br/>
          Gemini 2.5 Flash 모델을 사용하여 요약되었습니다.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }
}
