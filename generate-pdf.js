const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056 });
  const htmlPath = path.resolve('revenue/lead-generation/prospects/point-of-hope-church/outreach/pre-proposal.html');
  await page.goto('file:///' + htmlPath.split('\\').join('/'), { waitUntil: 'networkidle0' });
  const pdfPath = path.resolve('revenue/lead-generation/prospects/point-of-hope-church/outreach/pre-proposal.pdf');
  await page.pdf({
    path: pdfPath, format: 'Letter', printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  console.log('PDF generated, size:', (fs.statSync(pdfPath).size / 1024).toFixed(0), 'KB');
  await browser.close();
})();
