import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function GET() {
  console.log("🚀 Iniciando scraping con Puppeteer + Chromium...");

  let browser: Browser | null = null;

  try {
    const isLocal = process.env.NODE_ENV === "development";

    const executablePath = isLocal
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      // Usamos el casting 'as any' o valores manuales para evitar el error de tipado de la librería
      defaultViewport: chromium.defaultViewport as any,
      executablePath: executablePath,
      headless: chromium.headless as any,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.goto("https://www.coingecko.com/es", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.waitForSelector("table tbody tr", { timeout: 30000 });

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      return rows
        .map((row) => {
          const cols = Array.from(row.querySelectorAll("td")).map((col) =>
            (col as HTMLElement).innerText.trim(),
          );

          if (cols.length < 8) return null;

          const nameAndSymbol = cols[2]
            .split("\n")
            .filter((s) => s.trim() !== "");
          const name = nameAndSymbol[0];
          const symbol = nameAndSymbol[nameAndSymbol.length - 1];

          return {
            name,
            symbol,
            price: cols[4],
            change1h: cols[5],
            change24h: cols[6],
            change7d: cols[7],
          };
        })
        .filter(Boolean);
    });

    await browser.close();

    return NextResponse.json({ data });
  } catch (error: any) {
    // Tipamos correctamente el cierre del navegador en el error
    if (browser) await (browser as Browser).close();

    console.error("❌ Error Puppeteer:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
