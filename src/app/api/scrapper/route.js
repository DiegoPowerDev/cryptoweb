export const maxDuration = 60; // Permite que la función corra hasta 60s (requiere plan Pro o Trial)
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function GET() {
  console.log("🚀 Iniciando scraping con Puppeteer + Chromium...");

  let browser = null;

  try {
    const isLocal = process.env.NODE_ENV === "development";

    let executablePath;
    if (isLocal) {
      executablePath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    } else {
      // Aquí forzamos la ruta de los archivos binarios de @sparticuz
      executablePath = await chromium.executablePath(
        "https://github.com/sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar",
      );
    }

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "font", "stylesheet", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    );

    // 3. Ir a la URL, pero esperar solo al DOM básico
    await page.goto("https://www.coingecko.com/es", {
      waitUntil: "domcontentloaded", // No esperes a que termine la red, solo el HTML
      timeout: 30000,
    });

    try {
      await page.waitForSelector("table tbody tr", { timeout: 10000 });
    } catch (e) {
      // Si falla, sacamos una captura al log para ver qué está viendo el servidor (útil en logs de Vercel)
      const title = await page.title();
      throw new Error(`No se encontró la tabla. Título de la página: ${title}`);
    }

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      return rows
        .map((row) => {
          const cols = Array.from(row.querySelectorAll("td")).map((col) =>
            col.innerText.trim(),
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
  } catch (error) {
    // Tipamos correctamente el cierre del navegador en el error
    if (browser) await browser.close();

    console.error("❌ Error Puppeteer:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
