const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { resizeForPlatforms } = require('./resize');

const TEST_DIR = path.join(__dirname, '__test_output__');
const TEST_IMAGE = path.join(TEST_DIR, 'test-master.png');

async function setup() {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 57, g: 255, b: 20 } } })
    .png()
    .toFile(TEST_IMAGE);
}

async function cleanup() {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
}

async function test_produces_all_platform_variants() {
  const results = await resizeForPlatforms(TEST_IMAGE, TEST_DIR, 'test-01');

  const expected = ['test-01-facebook.png', 'test-01-instagram.png', 'test-01-linkedin.png', 'test-01-tiktok.png'];
  for (const file of expected) {
    const filePath = path.join(TEST_DIR, file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing: ${file}`);
  }

  const fbMeta = await sharp(path.join(TEST_DIR, 'test-01-facebook.png')).metadata();
  if (fbMeta.width !== 1200 || fbMeta.height !== 630) {
    throw new Error(`Facebook size wrong: ${fbMeta.width}x${fbMeta.height}, expected 1200x630`);
  }

  const igMeta = await sharp(path.join(TEST_DIR, 'test-01-instagram.png')).metadata();
  if (igMeta.width !== 1080 || igMeta.height !== 1080) {
    throw new Error(`Instagram size wrong: ${igMeta.width}x${igMeta.height}, expected 1080x1080`);
  }

  const liMeta = await sharp(path.join(TEST_DIR, 'test-01-linkedin.png')).metadata();
  if (liMeta.width !== 1200 || liMeta.height !== 630) {
    throw new Error(`LinkedIn size wrong: ${liMeta.width}x${liMeta.height}, expected 1200x630`);
  }

  const ttMeta = await sharp(path.join(TEST_DIR, 'test-01-tiktok.png')).metadata();
  if (ttMeta.width !== 1080 || ttMeta.height !== 1920) {
    throw new Error(`TikTok size wrong: ${ttMeta.width}x${ttMeta.height}, expected 1080x1920`);
  }

  if (!results.facebook || !results.instagram || !results.linkedin || !results.tiktok) {
    throw new Error('Missing platform paths in return value');
  }

  console.log('PASS: test_produces_all_platform_variants');
}

async function test_reel_sizing() {
  const results = await resizeForPlatforms(TEST_IMAGE, TEST_DIR, 'test-reel', 'reel');

  const igMeta = await sharp(path.join(TEST_DIR, 'test-reel-instagram.png')).metadata();
  if (igMeta.width !== 1080 || igMeta.height !== 1920) {
    throw new Error(`Instagram reel size wrong: ${igMeta.width}x${igMeta.height}, expected 1080x1920`);
  }

  console.log('PASS: test_reel_sizing');
}

async function test_output_files_exist() {
  const results = await resizeForPlatforms(TEST_IMAGE, TEST_DIR, 'test-01');

  for (const [platform, filePath] of Object.entries(results)) {
    if (!filePath.endsWith('.png')) throw new Error(`${platform} path should end with .png: ${filePath}`);
    if (!fs.existsSync(filePath)) throw new Error(`${platform} file does not exist: ${filePath}`);
  }

  console.log('PASS: test_output_files_exist');
}

(async () => {
  try {
    await setup();
    await test_produces_all_platform_variants();
    await test_reel_sizing();
    await test_output_files_exist();
    console.log('\nAll resize tests passed.');
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  } finally {
    await cleanup();
  }
})();
