#!/usr/bin/env node

const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const fs = require("fs");
const path = require("path");

const SITE_DIR = path.join(__dirname, "../_site");
const SOURCE = path.join(SITE_DIR, "cv/index.html");
const DEST = path.join(SITE_DIR, "cv.pdf");

// Set CHROME_PATH to use a local Chrome (e.g. on macOS), since
// @sparticuz/chromium only ships a Linux binary.
async function getExecutablePath() {
  return process.env.CHROME_PATH || chromium.executablePath;
}

async function main() {
  console.log("📄 Generating CV PDF...");

  const [html, css] = await Promise.all([
    fs.promises.readFile(SOURCE, "utf8"),
    fs.promises.readFile(path.join(SITE_DIR, "css/index.css"), "utf8"),
  ]);

  // Inline the stylesheet, since the page is loaded without a server
  const withCSS = html.replace(
    /<link rel="stylesheet" href="\/css\/index.css"[^>]*>/,
    `<style>${css}</style>`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    executablePath: await getExecutablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.setContent(withCSS, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: DEST,
      format: "letter",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }

  console.log(`✅ Wrote ${path.relative(process.cwd(), DEST)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  module.exports = main;
}
