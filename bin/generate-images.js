const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const FILES_DIR = path.join(__dirname, '../_site/og')

const PUPPETEER_OPTIONS = {
  headless: true,
  args: [
    "--no-sandbox",

    // These all disable features of Chromium that we don't need
    "--autoplay-policy=user-gesture-required",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-speech-api",
    "--disable-sync",
    "--hide-scrollbars",
    "--ignore-gpu-blacklist",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pings",
    "--no-zygote",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
  ],
  defaultViewport: {
    width: 1200,
    height: 600
  },
};

async function createBrowser() {
  return puppeteer.launch(PUPPETEER_OPTIONS);
}

async function generateImage(browser, html) {
  // Create a new isolated context for this page
  const context = await browser.createIncognitoBrowserContext();

  try {
    // Create a new page
    const page = await context.newPage();

    // Set the content to our rendered HTML
    await page.setContent(html, { waitUntil: "load" });

    // Wait until fonts have loaded
    await page.waitForFunction(() => document.fonts.ready);

    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });

    await context.close();

    return screenshotBuffer;
  } catch (err) {
    // Ensure the page gets closed if there's an error taking the screenshot
    await context.close();
    throw err;
  }
}

function getHTMLFiles() {
  const files = fs.readdirSync(FILES_DIR).filter(file => file.endsWith('.html'))
  return files.map(file => ({
    file,
    content: fs.readFileSync(path.join(FILES_DIR, file), 'utf8')
  }))
}

async function main() {
  console.log('📷 Generating OG images...')
  const browser = await createBrowser()
  const htmlFiles = getHTMLFiles()
  const css = await fs.promises.readFile(path.join(__dirname, '../_site/css/index.css'), 'utf8')

  for (const file of htmlFiles) {
    const withCSS = `<style>${css}</style>${file.content}`
    const image = await generateImage(browser, withCSS)
    const filepath = path.join(FILES_DIR, file.file.replace(path.extname(file.file), '.png'))
    await fs.promises.writeFile(filepath, image)
    process.stdout.write('.')
  }
  await browser.close()
  console.log('\n✅ Done generating OG images!')
}

if (require.main === module) {
  main()
} else {
  module.exports = main
}
