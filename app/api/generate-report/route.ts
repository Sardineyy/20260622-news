import { NextRequest, NextResponse } from "next/server";
import { fetchRecentNews } from "@/lib/news";
import { generateReport } from "@/lib/gemini";
import {
  buildReportEmailHtml,
  buildReportEmailSubject,
  sendReportEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyword = body.keyword?.trim();

    if (!keyword) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    const articles = await fetchRecentNews(keyword);
    const report = await generateReport(keyword, articles);
    const emailHtml = buildReportEmailHtml(keyword, report);
    const emailSubject = buildReportEmailSubject(keyword);

    await sendReportEmail(keyword, report);

    return NextResponse.json({
      success: true,
      message: `보고서가 psj0110@gmail.com 으로 발송되었습니다.`,
      articleCount: articles.length,
      emailSubject,
      emailHtml,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    const message =
      error instanceof Error ? error.message : "보고서 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
