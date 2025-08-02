import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();
    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        if (document.fonts) {
          document.fonts.ready.then(() => {
            setTimeout(resolve, 1000);
          });
        } else {
          setTimeout(resolve, 2000);
        }
      });
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: true,
    });
    await browser.close();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          filename || "document.pdf"
        }"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
