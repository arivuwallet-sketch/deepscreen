#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const defaultKeyFile = path.join(repoRoot, "public", "25a5468a0a1c4479ad9f864b24f58c60.txt");
const host = process.env.INDEXNOW_HOST ?? "deepscreen.online";
const key = process.env.INDEXNOW_KEY ?? fs.readFileSync(defaultKeyFile, "utf8").trim();

const args = process.argv.slice(2);
const normalizeUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.href;
  } catch {
    return new URL(trimmed, `https://${host}/`).href;
  }
};

const argUrls = args
  .filter((arg) => !arg.startsWith("--"))
  .map(normalizeUrl)
  .filter(Boolean);

const envUrls = (process.env.INDEXNOW_URLS ?? "")
  .split(",")
  .map(normalizeUrl)
  .filter(Boolean);

const urls = argUrls.length > 0 ? argUrls : envUrls.length > 0 ? envUrls : [
  `https://${host}/`,
  `https://${host}/sitemap.xml`,
];

const dryRun = args.includes("--dry-run");
const payload = { host, key, urlList: [...new Set(urls)] };

if (dryRun || args.includes("--help") || args.includes("-h")) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/submit-indexnow.mjs [--dry-run] [https://example.com/path ...]");
    console.log("Environment variables: INDEXNOW_HOST, INDEXNOW_KEY, INDEXNOW_URLS");
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
  process.exit(0);
}

if (!key) {
  throw new Error("INDEXNOW_KEY is missing. Set it in the environment or provide public/<key>.txt");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(payload),
});

const responseText = await response.text();
console.log(`IndexNow status: ${response.status} ${response.statusText}`);
console.log(responseText);

if (!response.ok) {
  process.exitCode = 1;
}
