const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

(async () => {
  // Load OAuth credentials
  const creds = JSON.parse(fs.readFileSync('C:/Users/Eric/.config/gws/client_secret.json', 'utf8'));
  const tokens = JSON.parse(fs.readFileSync('C:/Users/Eric/.config/gws/gmail-tokens.json', 'utf8'));

  const { client_id, client_secret } = creds.installed || creds.web;
  const oauth2 = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/oauth2callback');
  oauth2.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  // Read the PDF
  const pdfPath = path.resolve('revenue/lead-generation/prospects/point-of-hope-church/outreach/pre-proposal.pdf');
  const pdfData = fs.readFileSync(pdfPath);
  const pdfB64 = pdfData.toString('base64');

  // Check if mockup image exists
  const mockupPath = path.resolve('revenue/lead-generation/prospects/point-of-hope-church/mockup/screenshot.png');
  let mockupB64 = null;
  if (fs.existsSync(mockupPath)) {
    mockupB64 = fs.readFileSync(mockupPath).toString('base64');
  }

  // Find existing draft
  const drafts = await gmail.users.drafts.list({ userId: 'me' });
  let existingDraftId = null;
  if (drafts.data.drafts) {
    for (const d of drafts.data.drafts) {
      const detail = await gmail.users.drafts.get({ userId: 'me', id: d.id, format: 'metadata', metadataHeaders: ['Subject'] });
      const subj = detail.data.message.payload.headers.find(h => h.name === 'Subject');
      if (subj && subj.value.includes('Point of Hope')) {
        existingDraftId = d.id;
        break;
      }
    }
  }

  // Build MIME message
  const boundary = 'boundary_' + Date.now();
  const to = 'stephen_gossage@yahoo.com';
  const cc = 'stevenastock@gmail.com';
  const subject = 'Website Pre-Proposal for Point of Hope Apostolic Church';

  let mime = [
    `From: eric.lefler@ophidianai.com`,
    `To: ${to}`,
    `Cc: ${cc}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    'Pastor Gossage,',
    '',
    'Steve Stock connected us, and I wanted to follow up with some materials for you to review.',
    '',
    'Attached you\'ll find:',
    '',
    '1. A pre-proposal with two website options -- Web Starter ($1,200) and Web Professional ($2,500). Both include a $500 referral discount from Steve and a $500 religious institution discount.',
    '',
    '2. A mockup showing what a refreshed Point of Hope website could look like.',
    '',
    'This isn\'t a formal proposal yet -- just an overview so you can see what each approach includes and decide which direction interests you. Once you\'ve had a chance to look it over, I\'m happy to answer any questions or set up a quick call.',
    '',
    'Looking forward to hearing from you.',
    '',
    'Eric Lefler',
    'Founder, OphidianAI',
    'eric.lefler@ophidianai.com',
    '',
    `--${boundary}`,
    'Content-Type: application/pdf',
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="OphidianAI-PreProposal-PointOfHope.pdf"`,
    '',
    pdfB64,
  ];

  if (mockupB64) {
    mime.push(
      `--${boundary}`,
      'Content-Type: image/png',
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="PointOfHope-Mockup.png"`,
      '',
      mockupB64
    );
  }

  mime.push(`--${boundary}--`);

  const raw = Buffer.from(mime.join('\r\n')).toString('base64url');

  if (existingDraftId) {
    // Update existing draft
    await gmail.users.drafts.update({
      userId: 'me',
      id: existingDraftId,
      requestBody: { message: { raw } }
    });
    console.log('Draft updated:', existingDraftId);
  } else {
    // Create new draft
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw } }
    });
    console.log('Draft created:', res.data.id);
  }
})();
