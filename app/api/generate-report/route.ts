import { NextRequest, NextResponse } from "next/server";
import { fetchRecentNews } from "@/lib/news";
import { generateReport } from "@/lib/gemini";
import {
  buildReportEmailHtml,
  buildReportEmailSubject,
  sendReportEmail,
} from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/validate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyword = body.keyword?.trim();
    const emailInput = body.email?.trim();

    if (!keyword) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!emailInput) {
      return NextResponse.json(
        { error: "수신 이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!isValidEmail(emailInput)) {
      return NextResponse.json(
        { error: "올바른 이메일 주소 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    const recipientEmail = normalizeEmail(emailInput);

    const articles = await fetchRecentNews(keyword);
    const report = await generateReport(keyword, articles);
    const emailHtml = buildReportEmailHtml(keyword, report);
    const emailSubject = buildReportEmailSubject(keyword);

    await sendReportEmail(keyword, report, recipientEmail);

    return NextResponse.json({
      success: true,
      message: `보고서가 ${recipientEmail} 으로 발송되었습니다.`,
      articleCount: articles.length,
      emailSubject,
      emailHtml,
      recipientEmail,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    const message =
      error instanceof Error ? error.message : "보고서 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
