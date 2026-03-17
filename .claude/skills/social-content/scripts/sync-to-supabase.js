/**
 * Sync a social content batch JSON to the Supabase content_batches and content_posts tables.
 *
 * CLI: node sync-to-supabase.js <batch-json-path>
 *
 * Reads environment variables from the ophidian-ai .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * If a batch with the same batch_label already exists, it updates it.
 * Otherwise it creates a new batch.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ENV_PATH = path.resolve(
  __dirname,
  "../../../../engineering/projects/ophidian-ai/.env.local"
);

function loadEnv() {
  const content = fs.readFileSync(ENV_PATH, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function supabaseRequest(url, apiKey, method, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: method === "POST" ? "return=representation" : "return=representation",
      },
    };

    if (postData) {
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        if (res.statusCode >= 400) {
          reject(new Error(`Supabase ${res.statusCode}: ${JSON.stringify(data)}`));
        } else {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error("Usage: node sync-to-supabase.js <batch-json-path>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(batchPath), "utf8");
  const batch = JSON.parse(raw);

  const env = loadEnv();
  const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !apiKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const restUrl = `${baseUrl}/rest/v1`;

  // Parse date range
  const [periodStart, periodEnd] = (batch.dateRange || "").split(" to ").map((d) => d.trim());
  const batchLabel = batch.batchId || path.basename(batchPath, ".json");

  // Check if batch already exists
  const existing = await supabaseRequest(
    `${restUrl}/content_batches?batch_label=eq.${encodeURIComponent(batchLabel)}&select=id`,
    apiKey,
    "GET"
  );

  let batchId;

  if (existing && existing.length > 0) {
    // Update existing batch
    batchId = existing[0].id;
    console.log(`Updating existing batch: ${batchId}`);

    await supabaseRequest(
      `${restUrl}/content_batches?id=eq.${batchId}`,
      apiKey,
      "PATCH",
      {
        status: batch.status || "draft",
        post_count: batch.posts?.length || 0,
      }
    );

    // Delete existing posts to replace them
    await supabaseRequest(
      `${restUrl}/content_posts?batch_id=eq.${batchId}`,
      apiKey,
      "DELETE"
    );
  } else {
    // Create new batch
    const result = await supabaseRequest(
      `${restUrl}/content_batches`,
      apiKey,
      "POST",
      {
        client_id: null,
        batch_label: batchLabel,
        status: batch.status || "draft",
        period_start: periodStart || new Date().toISOString().split("T")[0],
        period_end: periodEnd || new Date().toISOString().split("T")[0],
        post_count: batch.posts?.length || 0,
      }
    );

    batchId = Array.isArray(result) ? result[0].id : result.id;
    console.log(`Created new batch: ${batchId}`);
  }

  // Insert posts
  if (batch.posts && batch.posts.length > 0) {
    const PILLAR_MAP = {
      "Proof of Work": "proof_of_work",
      "AI Education": "ai_education",
      "Website Tips": "website_tips",
      Showcase: "showcase",
      "Local Relevance": "local_relevance",
      "Behind the Scenes": "behind_the_scenes",
    };

    const IMAGE_SOURCE_MAP = {
      nanoBanana: "nano_banana",
      nano_banana: "nano_banana",
      pexels: "pexels",
      playwright: "compositor",
      compositor: "compositor",
      excalidraw: "excalidraw",
    };

    const posts = batch.posts.map((post, idx) => {
      // Extract the first platform's copy as the main hook/body
      const firstPlatform = Object.values(post.platforms || {})[0] || {};
      const allHashtags = new Set();
      for (const p of Object.values(post.platforms || {})) {
        for (const h of p.hashtags || []) allHashtags.add(h);
      }

      return {
        batch_id: batchId,
        post_number: post.postNumber || idx + 1,
        pillar: PILLAR_MAP[post.pillar] || post.pillar?.toLowerCase().replace(/\s+/g, "_") || "website_tips",
        hook: post.title || firstPlatform.copy?.split("\n")[0] || "",
        body: firstPlatform.copy || "",
        cta: post.cta || "",
        hashtags: Array.from(allHashtags),
        platforms: Object.keys(post.platforms || { facebook: 1, instagram: 1, linkedin: 1, tiktok: 1 }),
        image_source: IMAGE_SOURCE_MAP[post.imageSource] || "pexels",
        image_prompt: post.imagePrompt || null,
        image_urls: null,
        scheduled_date: post.scheduledDate || null,
        published_urls: null,
      };
    });

    await supabaseRequest(`${restUrl}/content_posts`, apiKey, "POST", posts);
    console.log(`Synced ${posts.length} posts to batch ${batchId}`);
  }

  console.log("Sync complete.");
}

main().catch((err) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
