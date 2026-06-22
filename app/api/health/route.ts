import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

export async function GET() {
  const status = getEnvStatus();
  const ready = status.gemini && status.resend;

  return NextResponse.json({
    service: "AI News Reporter",
    ready,
    env: status,
  });
}
