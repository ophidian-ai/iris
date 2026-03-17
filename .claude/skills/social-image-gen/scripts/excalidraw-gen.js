#!/usr/bin/env node
"use strict";

const sharp = require("sharp");
const path = require("path");

// --- Brand constants ---
const CANVAS_W = 2400;
const CANVAS_H = 1260;
const BG_COLOR = { r: 26, g: 26, b: 46, alpha: 1 }; // #1a1a2e
const STROKE = "#39ff14"; // venom green
const TEXT_COLOR = "#ffffff";
const NODE_W = 280;
const NODE_H = 60;
const NODE_R = 12;
const GAP = 80;
const STROKE_W = 2;
const FONT_SIZE = 18;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escape text for safe SVG embedding.
 */
function esc(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Word-wrap text to fit inside a node. Returns an array of lines.
 */
function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur.length + 1 + w.length) > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Compute { x, y } positions for each step.
 * Horizontal row for <= 3 steps; 2-column grid for 4+.
 */
function layoutNodes(count) {
  const positions = [];

  if (count <= 3) {
    // Single horizontal row, centred on canvas
    const totalW = count * NODE_W + (count - 1) * GAP;
    const startX = (CANVAS_W - totalW) / 2;
    const y = (CANVAS_H - NODE_H) / 2;
    for (let i = 0; i < count; i++) {
      positions.push({ x: startX + i * (NODE_W + GAP), y });
    }
  } else {
    // 2-column grid, reading left-to-right then top-to-bottom
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const totalW = cols * NODE_W + (cols - 1) * GAP;
    const totalH = rows * NODE_H + (rows - 1) * GAP;
    const startX = (CANVAS_W - totalW) / 2;
    const startY = (CANVAS_H - totalH) / 2;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push({
        x: startX + col * (NODE_W + GAP),
        y: startY + row * (NODE_H + GAP),
      });
    }
  }

  return positions;
}

// ---------------------------------------------------------------------------
// SVG generation
// ---------------------------------------------------------------------------

function buildArrowSvg(from, to) {
  const fx = from.x + NODE_W / 2;
  const fy = from.y + NODE_H / 2;
  const tx = to.x + NODE_W / 2;
  const ty = to.y + NODE_H / 2;

  // Determine connection points on node edges
  let x1, y1, x2, y2;
  const dx = tx - fx;
  const dy = ty - fy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal-dominant
    if (dx > 0) {
      x1 = from.x + NODE_W;
      y1 = fy;
      x2 = to.x;
      y2 = ty;
    } else {
      x1 = from.x;
      y1 = fy;
      x2 = to.x + NODE_W;
      y2 = ty;
    }
  } else {
    // Vertical-dominant
    if (dy > 0) {
      x1 = fx;
      y1 = from.y + NODE_H;
      x2 = tx;
      y2 = to.y;
    } else {
      x1 = fx;
      y1 = from.y;
      x2 = tx;
      y2 = to.y + NODE_H;
    }
  }

  // Arrowhead (small triangle)
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 14;
  const ha1 = angle + Math.PI * 0.8;
  const ha2 = angle - Math.PI * 0.8;
  const ax1 = x2 + headLen * Math.cos(ha1);
  const ay1 = y2 + headLen * Math.sin(ha1);
  const ax2 = x2 + headLen * Math.cos(ha2);
  const ay2 = y2 + headLen * Math.sin(ha2);

  return [
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="${STROKE_W}" />`,
    `<polygon points="${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}" fill="${STROKE}" />`,
  ].join("\n");
}

function buildNodeSvg(label, x, y) {
  const maxChars = Math.floor(NODE_W / (FONT_SIZE * 0.55));
  const lines = wrapText(label, maxChars);
  const lineHeight = FONT_SIZE + 4;
  const textBlockH = lines.length * lineHeight;
  const baseY = y + (NODE_H - textBlockH) / 2 + FONT_SIZE;

  const textEls = lines
    .map(
      (line, i) =>
        `<text x="${x + NODE_W / 2}" y="${baseY + i * lineHeight}" ` +
        `text-anchor="middle" fill="${TEXT_COLOR}" ` +
        `font-family="Arial, Helvetica, sans-serif" font-size="${FONT_SIZE}">${esc(line)}</text>`
    )
    .join("\n");

  return [
    `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="${NODE_R}" ry="${NODE_R}" ` +
      `fill="none" stroke="${STROKE}" stroke-width="${STROKE_W}" />`,
    textEls,
  ].join("\n");
}

function buildSvg(steps) {
  const positions = layoutNodes(steps.length);
  const parts = [];

  // Arrows first (behind nodes)
  for (let i = 0; i < steps.length - 1; i++) {
    parts.push(buildArrowSvg(positions[i], positions[i + 1]));
  }

  // Nodes
  for (let i = 0; i < steps.length; i++) {
    parts.push(buildNodeSvg(steps[i], positions[i].x, positions[i].y));
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}">`,
    parts.join("\n"),
    "</svg>",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a workflow diagram PNG.
 * @param {string} description  Steps separated by "->"
 * @param {string} outputPath   Destination .png file
 */
async function generateDiagram(description, outputPath) {
  const steps = description
    .split("->")
    .map((s) => s.trim())
    .filter(Boolean);

  if (steps.length === 0) {
    throw new Error("No steps found. Separate steps with '->'.");
  }

  const svg = buildSvg(steps);

  const bg = sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: BG_COLOR,
    },
  });

  await bg
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(outputPath);

  return outputPath;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node excalidraw-gen.js \"Step 1 -> Step 2\" output.png");
    process.exit(1);
  }
  const description = args[0];
  const outputPath = args[1];

  generateDiagram(description, outputPath)
    .then((p) => console.log("Diagram saved:", p))
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { generateDiagram };
