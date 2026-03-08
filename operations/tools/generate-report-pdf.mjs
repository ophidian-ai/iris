/**
 * Shared PDF report generator.
 *
 * Usage:
 *   node operations/tools/generate-report-pdf.mjs <html-template> <output-pdf> [--logo <logo-path>]
 *
 * Arguments:
 *   html-template  Path to the HTML report template
 *   output-pdf     Path for the generated PDF (include version in the filename)
 *   --logo         Optional path to a logo image. All occurrences of LOGO_PLACEHOLDER
 *                  in the HTML are replaced with the base64-encoded image.
 *
 * Examples:
 *   node operations/tools/generate-report-pdf.mjs \
 *     revenue/projects/active/bloomin-acres/reports/status-report-v2.html \
 *     revenue/projects/active/bloomin-acres/reports/Bloomin-Acres-Status-Report-v3.pdf \
 *     --logo shared/brand-assets/logo_icon.png
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

function printUsage() {
  console.error('Usage: node generate-report-pdf.mjs <html-template> <output-pdf> [--logo <logo-path>]');
  process.exit(1);
}

async function generatePDF() {
  const args = process.argv.slice(2);
  if (args.length < 2) printUsage();

  const htmlPath = path.resolve(args[0]);
  const pdfPath = path.resolve(args[1]);

  let logoPath = null;
  const logoIdx = args.indexOf('--logo');
  if (logoIdx !== -1 && args[logoIdx + 1]) {
    logoPath = path.resolve(args[logoIdx + 1]);
  }

  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML template not found: ${htmlPath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');

  if (logoPath) {
    if (!fs.existsSync(logoPath)) {
      console.error(`Logo file not found: ${logoPath}`);
      process.exit(1);
    }
    const ext = path.extname(logoPath).slice(1).toLowerCase();
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    const logoBase64 = `data:${mime};base64,${fs.readFileSync(logoPath).toString('base64')}`;
    html = html.replaceAll('LOGO_PLACEHOLDER', logoBase64);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  console.log(`PDF generated: ${pdfPath}`);
  await browser.close();
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
