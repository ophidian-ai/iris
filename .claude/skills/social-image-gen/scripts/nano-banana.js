/**
 * Generate AI images via the Gemini API (Nano Banana 2 pipeline).
 *
 * CLI:    node nano-banana.js "prompt text" output.png
 * Module: const { generateImage } = require('./nano-banana');
 *         await generateImage("prompt text", "output.png");
 *
 * Requires: GEMINI_API_KEY environment variable.
 * Uses only Node.js built-in modules (https, fs, path).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const MODEL = "nano-banana-pro-preview";
const API_HOST = "generativelanguage.googleapis.com";
const TIMEOUT_MS = 120000; // 2 minutes

/**
 * Generate an image from a text prompt and save it as PNG.
 *
 * @param {string} prompt  - Text prompt describing the desired image
 * @param {string} outputPath - File path to save the generated PNG
 * @returns {Promise<string>} Resolves with the absolute output path on success
 */
function generateImage(prompt, outputPath) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error("GEMINI_API_KEY environment variable is not set"));
    }

    if (!prompt || typeof prompt !== "string") {
      return reject(new Error("A text prompt is required"));
    }

    if (!outputPath || typeof outputPath !== "string") {
      return reject(new Error("An output file path is required"));
    }

    const resolvedOutput = path.resolve(outputPath);
    const outputDir = path.dirname(resolvedOutput);
    fs.mkdirSync(outputDir, { recursive: true });

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const options = {
      hostname: API_HOST,
      path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));

      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");

        let response;
        try {
          response = JSON.parse(raw);
        } catch (e) {
          return reject(new Error(`Failed to parse API response: ${e.message}`));
        }

        if (response.error) {
          return reject(
            new Error(`Gemini API error: ${response.error.message || JSON.stringify(response.error)}`)
          );
        }

        const candidates = response.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData) {
              const imageData = Buffer.from(part.inlineData.data, "base64");
              fs.writeFileSync(resolvedOutput, imageData);
              return resolve(resolvedOutput);
            }
          }
        }

        reject(new Error("No image data found in API response"));
      });
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000} seconds`));
    });

    req.on("error", (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(requestBody);
    req.end();
  });
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: node nano-banana.js <prompt> <output.png>");
    process.exit(1);
  }

  const [prompt, outputPath] = args;

  console.log(`Generating image with ${MODEL}...`);
  generateImage(prompt, outputPath)
    .then((savedPath) => {
      const stats = fs.statSync(savedPath);
      console.log(`Image saved: ${savedPath}`);
      console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { generateImage };
