import nodemailer from "nodemailer";

const RECIPIENT_EMAIL = "psj0110@gmail.com";

export async function sendReportEmail(
  keyword: string,
  reportHtml: string
): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const recipient = process.env.REPORT_EMAIL ?? RECIPIENT_EMAIL;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "SMTP_USER 및 SMTP_PASS 환경변수가 설정되지 않았습니다."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await transporter.sendMail({
    from: `"AI News Reporter" <${smtpUser}>`,
    to: recipient,
    subject: `[AI News Reporter] "${keyword}" 주간 이슈 보고서 - ${today}`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
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
}
