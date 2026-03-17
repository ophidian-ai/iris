const sharp = require('sharp');
const path = require('path');

const PLATFORM_SPECS = {
  facebook:  { width: 1200, height: 630, fit: 'cover' },
  instagram: { width: 1080, height: 1080, fit: 'cover' },
  instagram_portrait: { width: 1080, height: 1350, fit: 'cover' },
  instagram_reel: { width: 1080, height: 1920, fit: 'cover' },
  linkedin:  { width: 1200, height: 630, fit: 'cover' },
  tiktok:    { width: 1080, height: 1920, fit: 'cover' },
};

const IG_CONTENT_TYPE_MAP = {
  'carousel': 'instagram',
  'text-post': 'instagram',
  'reel': 'instagram_reel',
  'story': 'instagram_reel',
};

/**
 * Resize a master image into platform-specific variants.
 * @param {string} masterPath - Path to the master image file
 * @param {string} outputDir - Directory to save resized images
 * @param {string} prefix - Filename prefix (e.g., 'post-01')
 * @param {string} igContentType - Instagram content type ('carousel', 'text-post', 'reel', 'story')
 * @returns {Object} Map of platform -> absolute file path
 */
async function resizeForPlatforms(masterPath, outputDir, prefix, igContentType = 'text-post') {
  const results = {};
  const igSpecKey = IG_CONTENT_TYPE_MAP[igContentType] || 'instagram';

  const platformsToGenerate = {
    facebook: PLATFORM_SPECS.facebook,
    instagram: PLATFORM_SPECS[igSpecKey],
    linkedin: PLATFORM_SPECS.linkedin,
    tiktok: PLATFORM_SPECS.tiktok,
  };

  for (const [platform, spec] of Object.entries(platformsToGenerate)) {
    const outputPath = path.join(outputDir, `${prefix}-${platform}.png`);

    await sharp(masterPath)
      .resize(spec.width, spec.height, { fit: spec.fit, position: 'centre' })
      .png()
      .toFile(outputPath);

    results[platform] = outputPath;
  }

  return results;
}

module.exports = { resizeForPlatforms, PLATFORM_SPECS, IG_CONTENT_TYPE_MAP };
