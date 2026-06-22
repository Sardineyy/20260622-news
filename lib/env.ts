export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

export function getEnvStatus() {
  return {
    gemini: Boolean(getGeminiApiKey()),
    smtpUser: Boolean(process.env.SMTP_USER),
    smtpPass: Boolean(process.env.SMTP_PASS),
    reportEmail: Boolean(process.env.REPORT_EMAIL ?? "psj0110@gmail.com"),
  };
}
