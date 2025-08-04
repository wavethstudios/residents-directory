import { NextRequest, NextResponse } from "next/server";
const isVercelDeployment = process.env.VERCEL_ENV !== undefined;
export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();
    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }
    let browser;
    if (isVercelDeployment) {
      const puppeteerCore = await import("puppeteer-core");
      const chromium = await import("@sparticuz/chromium");
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: {
          width: 1280,
          height: 720,
        },
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      const puppeteer = await import("puppeteer");
      browser = await puppeteer.default.launch({
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
    }
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
