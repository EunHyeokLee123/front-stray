/* eslint-env node */
/* global process */
/**
 * 빌드 시 상세 페이지 URL을 sitemap-detail.xml로 생성합니다.
 * - 유기동물: POST /pet-service/pet/search/{page} → /stray/detail/{desertionNo}
 * - 행사: GET /map-service/festival/list/{page} → /festival/detail/{festivalId}
 *
 * 사용: node scripts/generate-sitemap-detail.js
 * API 주소: configs/host-config.js의 API_BASE_URL 사용 (Node에서는 process.env.VITE_API_BASE_URL 또는 기본값)
 *
 * 인증 (백엔드가 토큰을 요구하는 경우):
 * - .env에 SITEMAP_TOKEN=your_token 추가 또는
 * - 환경변수: SITEMAP_TOKEN=your_token node scripts/generate-sitemap-detail.js
 * - fingerprint가 필요하면: SITEMAP_FINGERPRINT=your_fingerprint
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// .env 로드 (axios-config·host-config가 Node에서 process.env 참조하므로 먼저 로드)
try {
  const envPath = path.join(projectRoot, ".env");
  const env = fs.readFileSync(envPath, "utf8");
  env.split("\n").forEach((line) => {
    const trimmed = line.trim();
    // 주석이나 빈 줄 건너뛰기
    if (!trimmed || trimmed.startsWith("#")) return;

    const apiMatch = trimmed.match(/^VITE_API_BASE_URL=(.+)$/);
    if (apiMatch) {
      const v = apiMatch[1].trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
      if (v) process.env.VITE_API_BASE_URL = v;
    }
    const tokenMatch = trimmed.match(/^SITEMAP_TOKEN=(.+)$/);
    if (tokenMatch) {
      const v = tokenMatch[1].trim().replace(/^["']|["']$/g, "");
      if (v) {
        process.env.SITEMAP_TOKEN = v;
        console.log("✓ Loaded SITEMAP_TOKEN from .env");
      }
    }
    const fpMatch = trimmed.match(/^SITEMAP_FINGERPRINT=(.+)$/);
    if (fpMatch) {
      const v = fpMatch[1].trim().replace(/^["']|["']$/g, "");
      if (v) {
        process.env.SITEMAP_FINGERPRINT = v;
        console.log("✓ Loaded SITEMAP_FINGERPRINT from .env");
      }
    }
  });
} catch (err) {
  console.warn("⚠️  .env file not found or error:", err.message);
}

const { API_BASE_URL, PET, FESTIVAL } = await import("../configs/host-config.js");
const { default: axiosInstance } = await import("../configs/axios-config.js");

const API_BASE = API_BASE_URL.replace(/\/+$/, "");
const SITE_BASE = "https://nyangmong.com";
const MAX_PAGES = 100;
const LASTMOD = new Date().toISOString().slice(0, 10);

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
    const res = await axiosInstance.post(`${PET}/search/${page}`, {
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
    const res = await axiosInstance.get(`${FESTIVAL}/list/${page}`);
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

  // Sitemap 규격: 최소 1개의 <url> 필요. API 실패 시 빈 urlset이 되면 검색엔진 오류 발생
  if (urls.length === 0) {
    urls.push(
      `  <url>\n    <loc>${escapeXml(SITE_BASE + "/stray/list")}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>0.6</priority>\n  </url>`,
      `  <url>\n    <loc>${escapeXml(SITE_BASE + "/festival/list")}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>0.6</priority>\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

async function main() {
  console.log("Sitemap detail: API_BASE =", API_BASE);
  console.log("SITEMAP_TOKEN:", process.env.SITEMAP_TOKEN ? "✓ Set" : "✗ Not set");
  console.log("SITEMAP_FINGERPRINT:", process.env.SITEMAP_FINGERPRINT ? "✓ Set" : "✗ Not set");
  
  if (process.env.SITEMAP_TOKEN) {
    console.log("Using token authentication (axios-config)");
  } else {
    console.warn(
      "⚠️  No SITEMAP_TOKEN. If backend requires auth, add SITEMAP_TOKEN to .env (axios-config reads it in Node)."
    );
  }

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
