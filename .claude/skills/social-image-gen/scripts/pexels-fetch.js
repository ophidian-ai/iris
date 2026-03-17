#!/usr/bin/env node
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

/**
 * Search Pexels for a stock photo and download the best match.
 *
 * @param {string} query - Search query string.
 * @param {string} outputPath - File path to save the downloaded image.
 * @returns {Promise<{id: number, width: number, height: number, photographer: string, url: string, file: string}>}
 */
async function fetchPexelsPhoto(query, outputPath) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY environment variable is not set.");
  }
  if (!query || typeof query !== "string") {
    throw new Error("A search query string is required.");
  }
  if (!outputPath || typeof outputPath !== "string") {
    throw new Error("An output file path is required.");
  }

  // Search the Pexels API
  const searchUrl =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;

  const data = await httpGet(searchUrl, { Authorization: apiKey });
  const parsed = JSON.parse(data);

  if (!parsed.photos || parsed.photos.length === 0) {
    throw new Error(`No Pexels results found for query: "${query}"`);
  }

  // Pick the photo with the best resolution (largest width * height)
  const best = parsed.photos.reduce((a, b) =>
    a.width * a.height >= b.width * b.height ? a : b
  );

  const imageUrl = best.src.original;

  // Ensure output directory exists
  const dir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Download the image (follow redirects)
  await downloadFile(imageUrl, outputPath);

  return {
    id: best.id,
    width: best.width,
    height: best.height,
    photographer: best.photographer,
    url: best.url,
    file: path.resolve(outputPath),
  };
}

/**
 * HTTP GET that returns the response body as a string.
 * Follows up to 5 redirects.
 */
function httpGet(url, headers, maxRedirects) {
  if (maxRedirects === undefined) maxRedirects = 5;
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: headers || {} }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (maxRedirects <= 0) {
          return reject(new Error("Too many redirects."));
        }
        const location = res.headers.location;
        if (!location) {
          return reject(new Error("Redirect with no Location header."));
        }
        return resolve(httpGet(location, headers, maxRedirects - 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(
          new Error(`HTTP ${res.statusCode} from ${url}`)
        );
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", reject);
  });
}

/**
 * Download a URL to a file. Follows up to 5 redirects.
 */
function downloadFile(url, dest, maxRedirects) {
  if (maxRedirects === undefined) maxRedirects = 5;
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : require("http");
    const req = proto.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (maxRedirects <= 0) {
          return reject(new Error("Too many redirects."));
        }
        const location = res.headers.location;
        if (!location) {
          return reject(new Error("Redirect with no Location header."));
        }
        return resolve(downloadFile(location, dest, maxRedirects - 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(
          new Error(`HTTP ${res.statusCode} downloading image from ${url}`)
        );
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
    req.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node pexels-fetch.js <query> <output-path>");
    process.exit(1);
  }
  const [query, outputPath] = args;
  fetchPexelsPhoto(query, outputPath)
    .then((result) => {
      console.log(`Downloaded: ${result.file}`);
      console.log(
        `  Photo #${result.id} by ${result.photographer} (${result.width}x${result.height})`
      );
      console.log(`  Source: ${result.url}`);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { fetchPexelsPhoto };
