const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 850, height: 1100 });
  const pdfData = fs.readFileSync(path.resolve('revenue/lead-generation/prospects/point-of-hope-church/outreach/pre-proposal.pdf'));
  const b64 = pdfData.toString('base64');
  const html = `<!DOCTYPE html><html><head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>body{margin:0;background:white}canvas{display:block}</style>
  </head><body><canvas id="canvas"></canvas>
  <script>
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  window.renderPage=async function(n){
    const d=atob('${b64}');const u=new Uint8Array(d.length);
    for(let i=0;i<d.length;i++)u[i]=d.charCodeAt(i);
    const pdf=await pdfjsLib.getDocument({data:u}).promise;
    const pg=await pdf.getPage(n);const vp=pg.getViewport({scale:1.5});
    const c=document.getElementById('canvas');c.width=vp.width;c.height=vp.height;
    document.body.style.width=vp.width+'px';
    await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
    return{pages:pdf.numPages,w:vp.width,h:vp.height};
  };
  </script></body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const info = await page.evaluate(() => window.renderPage(1));
  console.log('Total pages:', info.pages);
  for (let i = 1; i <= info.pages; i++) {
    await page.evaluate((n) => window.renderPage(n), i);
    await new Promise(r => setTimeout(r, 500));
    await page.setViewport({ width: Math.ceil(info.w), height: Math.ceil(info.h) });
    await page.screenshot({ path: path.resolve(`revenue/lead-generation/prospects/point-of-hope-church/outreach/pdf-page-${i}.png`) });
    console.log('Page', i);
  }
  await browser.close();
})();
