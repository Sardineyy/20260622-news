export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.Gemini_api ??
    process.env.GEMINI_API ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY ?? process.env.Resend_api;
}

export function getEnvStatus() {
  return {
    gemini: Boolean(getGeminiApiKey()),
    resend: Boolean(getResendApiKey()),
    reportEmail: process.env.REPORT_EMAIL ?? "psj0110@gmail.com",
    vercelEnv: process.env.VERCEL_ENV ?? "local",
  };
}
