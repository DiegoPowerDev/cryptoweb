import { NextResponse } from "next/server";
import { chromium } from "playwright";

export async function GET() {
  console.log("🚀 Iniciando scraping con Playwright...");

  let browser;
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    await page.goto("https://www.coingecko.com/es", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(3000);
    await page.waitForSelector("table tbody tr", {
      timeout: 40000,
      state: "attached",
    });

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      return rows.map((row) => {
        const cols = Array.from(row.querySelectorAll("td")).map((col) =>
          col.innerText.trim(),
        );

        const [name, symbol] = (() => {
          const parts = cols[2].split(" ");
          const symbol = parts.pop();
          const name = parts.join(" ");
          return [name, symbol];
        })();

        return {
          name,
          symbol,
          price: cols[4],
          change1h: cols[5],
          change24h: cols[6],
          change7d: cols[7],
        };
      });
    });

    await browser.close();

    return NextResponse.json({
      data,
    });
  } catch (error: any) {
    if (browser) await browser.close();
    console.error("❌ Error Playwright:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
