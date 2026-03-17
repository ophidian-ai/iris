const sharp = require('sharp');
const path = require('path');
const { chromium } = require('playwright');

const OUTPUT_WIDTH = 2400;
const OUTPUT_HEIGHT = 1260;
const GAP = 4;
const BORDER = 4;
const LABEL_BAR_HEIGHT = 48;
const VIEWPORT = { width: 1280, height: 800 };

const HALF_WIDTH = Math.floor((OUTPUT_WIDTH - GAP - BORDER * 2) / 2);
const INNER_HEIGHT = OUTPUT_HEIGHT - BORDER * 2;

/**
 * Take a full-page screenshot of a URL at the standard viewport.
 * @param {import('playwright').Browser} browser
 * @param {string} url
 * @returns {Promise<Buffer>} PNG screenshot buffer
 */
async function screenshotUrl(browser, url) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const buf = await page.screenshot({ type: 'png' });
    return buf;
  } finally {
    await page.close();
  }
}

/**
 * Build an SVG label bar (colored accent strip with white text).
 * @param {string} label - Text to display
 * @param {string} accentColor - Hex color for the bar background
 * @param {number} width
 * @param {number} height
 * @returns {Buffer}
 */
function buildLabelBar(label, accentColor, width, height) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${accentColor}" />
  <text x="${width / 2}" y="${height / 2 + 8}" font-family="Arial, Helvetica, sans-serif"
        font-size="28" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
</svg>`;
  return Buffer.from(svg);
}

/**
 * Build an SVG watermark for the bottom-right corner.
 * @returns {Buffer}
 */
function buildWatermark() {
  const svg = `<svg width="220" height="36" xmlns="http://www.w3.org/2000/svg">
  <text x="210" y="26" font-family="Arial, Helvetica, sans-serif"
        font-size="18" font-weight="bold" fill="white" fill-opacity="0.5"
        text-anchor="end">OphidianAI</text>
</svg>`;
  return Buffer.from(svg);
}

/**
 * Composite two website screenshots into a branded Before/After image.
 * @param {string} oldUrl - URL of the old/existing site
 * @param {string} newUrl - URL of the new/redesigned site
 * @param {string} outputPath - File path for the output PNG
 * @returns {Promise<string>} Absolute path to the output file
 */
async function compositeBeforeAfter(oldUrl, newUrl, outputPath) {
  const browser = await chromium.launch({ headless: true });

  let oldScreenshot, newScreenshot;
  try {
    oldScreenshot = await screenshotUrl(browser, oldUrl);
    newScreenshot = await screenshotUrl(browser, newUrl);
  } finally {
    await browser.close();
  }

  // Resize each screenshot to fit its half (below the label bar)
  const thumbHeight = INNER_HEIGHT - LABEL_BAR_HEIGHT;
  const oldResized = await sharp(oldScreenshot)
    .resize(HALF_WIDTH, thumbHeight, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  const newResized = await sharp(newScreenshot)
    .resize(HALF_WIDTH, thumbHeight, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  // Build label bars
  const beforeBar = buildLabelBar('BEFORE', '#ff4444', HALF_WIDTH, LABEL_BAR_HEIGHT);
  const afterBar = buildLabelBar('AFTER', '#39ff14', HALF_WIDTH, LABEL_BAR_HEIGHT);

  // Build watermark
  const watermark = buildWatermark();

  // Left half x offset, right half x offset
  const leftX = BORDER;
  const rightX = BORDER + HALF_WIDTH + GAP;
  const barY = BORDER;
  const thumbY = BORDER + LABEL_BAR_HEIGHT;

  const absOutput = path.resolve(outputPath);

  await sharp({
    create: {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      channels: 4,
      background: { r: 24, g: 24, b: 24, alpha: 1 },
    },
  })
    .composite([
      // Left: before bar + screenshot
      { input: beforeBar, top: barY, left: leftX },
      { input: oldResized, top: thumbY, left: leftX },
      // Right: after bar + screenshot
      { input: afterBar, top: barY, left: rightX },
      { input: newResized, top: thumbY, left: rightX },
      // Watermark bottom-right
      { input: watermark, top: OUTPUT_HEIGHT - 44, left: OUTPUT_WIDTH - 232 },
    ])
    .png()
    .toFile(absOutput);

  return absOutput;
}

// CLI entry point
if (require.main === module) {
  const [oldUrl, newUrl, output] = process.argv.slice(2);

  if (!oldUrl || !newUrl || !output) {
    console.error('Usage: node compositor.js <old-url> <new-url> <output.png>');
    process.exit(1);
  }

  compositeBeforeAfter(oldUrl, newUrl, output)
    .then((p) => console.log(`Composite saved: ${p}`))
    .catch((err) => {
      console.error('Compositor failed:', err.message);
      process.exit(1);
    });
}

module.exports = { compositeBeforeAfter };
