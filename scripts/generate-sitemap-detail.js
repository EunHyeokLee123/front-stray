/**
 * 빌드 시 상세 페이지 URL을 sitemap-detail.xml로 생성합니다.
 * - 유기동물: POST /pet-service/pet/search/{page} → /stray/detail/{desertionNo}
 * - 행사: GET /map-service/festival/list/{page} → /festival/detail/{festivalId}
 *
 * 사용: node scripts/generate-sitemap-detail.js
 * 환경변수: SITEMAP_API_URL 또는 VITE_API_BASE_URL (없으면 https://api.nyangmong.com)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// .env에서 VITE_API_BASE_URL 로드 (선택)
try {
  const envPath = path.join(projectRoot, ".env");
  const env = fs.readFileSync(envPath, "utf8");
  env.split("\n").forEach((line) => {
    const m = line.match(/^VITE_API_BASE_URL=(.+)$/);
    if (m) {
      const v = m[1].trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
      if (v) process.env.VITE_API_BASE_URL = v;
    }
  });
} catch {
  // .env 없음 무시
}

const API_BASE =
  process.env.SITEMAP_API_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://api.nyangmong.com";
const PET = "/pet-service/pet";
const FESTIVAL = "/map-service/festival";
const SITE_BASE = "https://nyangmong.com";
const MAX_PAGES = 100; // 한 종류당 최대 페이지 (무한 루프 방지)
const LASTMOD = new Date().toISOString().slice(0, 10);

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchStrayIds() {
  const ids = new Set();
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_PAGES) {
    const res = await client.post(`${PET}/search/${page}`, {
      region: "전체",
      kind: "개",
      device: 0,
    });
    const data = res.data?.result || res.data;
    const content = data?.content || data?.data || data || [];
    const total = data?.totalPages ?? 1;

    totalPages = typeof total === "number" ? total : 1;
    content.forEach((item) => {
      const id = item.desertionNo ?? item.id;
      if (id) ids.add(String(id));
    });
    page++;
  }

  return Array.from(ids);
}

async function fetchFestivalIds() {
  const ids = new Set();
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_PAGES) {
    const res = await client.get(`${FESTIVAL}/list/${page}`);
    const data = res.data?.result || res.data;
    const content = data?.content || data?.data || data || [];
    const total = data?.totalPages ?? 1;

    totalPages = typeof total === "number" ? total : 1;
    content.forEach((item) => {
      const id = item.festivalId ?? item.id;
      if (id) ids.add(String(id));
    });
    page++;
  }

  return Array.from(ids);
}

function buildSitemapXml(strayIds, festivalIds) {
  const urls = [];

  strayIds.forEach((id) => {
    urls.push(
      `  <url>\n    <loc>${escapeXml(SITE_BASE + "/stray/detail/" + id)}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>0.6</priority>\n  </url>`
    );
  });

  festivalIds.forEach((id) => {
    urls.push(
      `  <url>\n    <loc>${escapeXml(SITE_BASE + "/festival/detail/" + id)}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>0.6</priority>\n  </url>`
    );
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

async function main() {
  console.log("Sitemap detail: API_BASE =", API_BASE);

  let strayIds = [];
  let festivalIds = [];

  try {
    strayIds = await fetchStrayIds();
    console.log("Stray detail URLs:", strayIds.length);
  } catch (err) {
    console.warn("Stray list fetch failed:", err.message);
  }

  try {
    festivalIds = await fetchFestivalIds();
    console.log("Festival detail URLs:", festivalIds.length);
  } catch (err) {
    console.warn("Festival list fetch failed:", err.message);
  }

  const xml = buildSitemapXml(strayIds, festivalIds);
  const outPath = path.join(projectRoot, "public", "sitemap-detail.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log("Written:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
