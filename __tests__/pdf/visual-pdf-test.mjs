/**
 * VISUAL PDF TEST — Real Data, Puppeteer-based UX validation
 *
 * This script:
 *   1. Launches VISIBLE Chrome (so you can log in if needed)
 *   2. Navigates to the print page with REAL data (no mock)
 *   3. Screenshots every rendered page at A4 dimensions
 *   4. Generates the actual PDF with production config
 *   5. Reports page count, blank pages, overlaps, and UX metrics
 *
 * Usage:
 *   node __tests__/pdf/visual-pdf-test.mjs <intakeId>
 *
 * Example:
 *   node __tests__/pdf/visual-pdf-test.mjs fo_audit_UWHQSOUtohM9
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "screenshots");
const PDF_OUTPUT = path.join(__dirname, "screenshots", "test-output.pdf");
const DATA_FIXTURE = path.join(__dirname, "screenshots", "real-data.json");
const REPORT_AUTH_EMAIL = process.env.REPORT_AUTH_EMAIL;
const REPORT_AUTH_PASSWORD = process.env.REPORT_AUTH_PASSWORD;

if (!REPORT_AUTH_EMAIL || !REPORT_AUTH_PASSWORD) {
  console.error("REPORT_AUTH_EMAIL and REPORT_AUTH_PASSWORD are required for this live PDF auth test.");
  process.exit(1);
}

// Ensure screenshot dir exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────
// MAIN TEST SCRIPT — REAL DATA
// ─────────────────────────────────────────────────────────────────────

async function runVisualTest() {
  const INTAKE_ID = process.argv[2] || "fo_audit_UWHQSOUtohM9";
  const SERVER_URL = "http://localhost:3000";

  console.log("=== VISUAL PDF TEST (REAL DATA) ===\n");
  console.log(`   Intake ID: ${INTAKE_ID}`);
  console.log(`   Server: ${SERVER_URL}\n`);

  // ─── STEP 1: Launch visible Chrome ────────────────────────────────
  console.log("1. Launching Chrome (visible)...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--window-size=900,1200",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  // ─── STEP 2: Authenticate via API ──────────────────────────────────
  console.log("2. Authenticating via report auth API...");

  // Navigate to the app first to establish origin for API calls
  await page.goto(`${SERVER_URL}/decision-memo/audit/${INTAKE_ID}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // Login via the report auth API (same as ReportAuthPopup component)
  const loginResult = await page.evaluate(async (intakeId) => {
    try {
      const res = await fetch("/api/decision-memo/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: intakeId,
          email: REPORT_AUTH_EMAIL,
          password: REPORT_AUTH_PASSWORD,
        }),
      });
      const data = await res.json();
      if (data.token) {
        // Store token exactly like the real app does
        localStorage.setItem(`report_token_${intakeId}`, data.token);
        localStorage.setItem(`report_token_exp_${intakeId}`, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        if (data.access_token) {
          sessionStorage.setItem("viewer_session", "true");
          sessionStorage.setItem("latest_report_token", data.token);
        }
        return { success: true, token: data.token.slice(0, 30) + "..." };
      }
      if (data.requires_mfa) {
        return { success: false, error: "MFA required — this test only works with skip_mfa accounts" };
      }
      return { success: false, error: data.detail || "Login failed" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, INTAKE_ID);

  if (!loginResult.success) {
    console.error(`   AUTH FAILED: ${loginResult.error}`);
    await browser.close();
    process.exit(1);
  }
  console.log(`   Authenticated: ${loginResult.token}`);

  // ─── STEP 3: Fetch real memo data ─────────────────────────────────
  console.log("\n3. Fetching real memo data from API...");

  const authToken = await page.evaluate((id) => {
    return localStorage.getItem(`report_token_${id}`);
  }, INTAKE_ID);

  const realData = await page.evaluate(async (url, token) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) return { error: `HTTP ${res.status}` };
      return await res.json();
    } catch (e) {
      return { error: e.message };
    }
  }, `${SERVER_URL}/api/decision-memo/${INTAKE_ID}`, authToken);

  if (!realData || !realData.preview_data) {
    console.error("   FAILED: Could not fetch real data from API.");
    console.error("   Response:", JSON.stringify(realData)?.slice(0, 500));
    await browser.close();
    process.exit(1);
  }

  // Save real data as fixture for future reference
  fs.writeFileSync(DATA_FIXTURE, JSON.stringify(realData, null, 2));
  console.log(`   Real data saved: ${DATA_FIXTURE}`);
  console.log(`   Data keys: ${Object.keys(realData.preview_data).length} fields in preview_data`);

  // ─── STEP 4: Navigate to print page ───────────────────────────────
  console.log("\n4. Navigating to print page...");

  // Kill animations like the production route
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);

  // Capture errors — log ALL errors including PrintErrorBoundary crashes
  const pageErrors = [];
  page.on("pageerror", (err) => {
    const msg = err.stack || err.message;
    pageErrors.push(msg);
    console.error(`   [PAGE ERROR] ${msg.slice(0, 300)}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      pageErrors.push(text);
      // Log PrintErrorBoundary crashes and all JS errors
      if (
        text.includes("PrintErrorBoundary") ||
        text.includes("TypeError") ||
        text.includes("Cannot read") ||
        text.includes("is not a function") ||
        text.includes("toFixed") ||
        text.includes("toLowerCase") ||
        text.includes("undefined") ||
        text.includes("Error") ||
        text.includes("crash")
      ) {
        console.error(`   [CONSOLE ERROR] ${text.slice(0, 400)}`);
      }
    } else if (msg.type() === "warning" && msg.text().includes("PrintError")) {
      console.warn(`   [WARN] ${msg.text().slice(0, 300)}`);
    }
  });

  const printUrl = `${SERVER_URL}/decision-memo-print/${INTAKE_ID}`;
  console.log(`   URL: ${printUrl}`);

  await page.goto(printUrl, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  // Wait for data-loaded signal
  console.log("   Waiting for data-loaded signal...");
  try {
    await page.waitForSelector("[data-loaded='true']", { timeout: 45000 });
    console.log("   Data loaded successfully.");
  } catch (e) {
    const pageState = await page.evaluate(() => ({
      dataLoaded: document.body.getAttribute("data-loaded"),
      dataError: document.body.getAttribute("data-error"),
      bodyText: document.body.innerText?.slice(0, 500),
    }));
    console.error("   FAILED: Page did not signal ready");
    console.error("   State:", JSON.stringify(pageState, null, 2));
    console.error("   Errors:", pageErrors.slice(0, 5));
    await browser.close();
    process.exit(1);
  }

  // Extra render time for all sections
  await new Promise((r) => setTimeout(r, 3000));

  // ─── STEP 5: Analyze page structure ───────────────────────────────
  console.log("\n5. Analyzing page structure...");

  const sectionInfo = await page.evaluate(() => {
    const sections = document.querySelectorAll(".print-section");
    const container = document.querySelector(".print-container");
    const results = [];
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const rect = sec.getBoundingClientRect();
      const heading =
        sec.querySelector("h2, h3")?.textContent?.slice(0, 60) || "(no heading)";

      // Check if section has any visible content
      const children = sec.querySelectorAll("*");
      let visibleCount = 0;
      children.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.height > 0 && r.width > 0) visibleCount++;
      });

      results.push({
        index: i + 1,
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        heading,
        visibleChildren: visibleCount,
      });
    }
    return {
      sectionCount: sections.length,
      containerHeight: container
        ? Math.round(container.getBoundingClientRect().height)
        : 0,
      sections: results,
    };
  });

  console.log(`   Sections found: ${sectionInfo.sectionCount}`);
  console.log(`   Container height: ${sectionInfo.containerHeight}px`);
  console.log(`   Estimated pages: ~${Math.ceil(sectionInfo.containerHeight / 1123)}`);
  console.log("\n   Section layout:");
  for (const sec of sectionInfo.sections) {
    const flag = sec.height === 0 ? " *** EMPTY ***" : "";
    console.log(
      `     [${sec.index}] ${sec.heading} (top: ${sec.top}px, h: ${sec.height}px, ${sec.visibleChildren} elements)${flag}`
    );
  }

  // ─── STEP 6: Full-page screenshot ─────────────────────────────────
  console.log("\n6. Taking full-page screenshot...");
  const fullPagePath = path.join(SCREENSHOT_DIR, "full-page.png");
  await page.screenshot({
    path: fullPagePath,
    fullPage: true,
  });
  console.log(`   Saved: ${fullPagePath}`);

  // ─── STEP 7: Generate PDF (production config) ─────────────────────
  console.log("\n7. Generating PDF with production config...");

  const refId =
    INTAKE_ID.slice(10, 22).toUpperCase() ||
    INTAKE_ID.slice(0, 12).toUpperCase();

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: "40px",
      bottom: "56px",
      left: "0",
      right: "0",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div><style>#header, #footer { padding: 0 !important; margin: 0 !important; }</style></div>`,
    footerTemplate: `
      <style>#header, #footer { padding: 0 !important; margin: 0 !important; }</style>
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 0 52px 8px;
        box-sizing: border-box;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Inter', 'Helvetica Neue', sans-serif;
          font-size: 7px;
          color: #666;
          border-top: 0.5px solid #262626;
          padding-top: 6px;
        ">
          <span style="letter-spacing: 0.5px;">Ref: ${refId}</span>
          <span style="color: #D4A843; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-size: 7px;">HNWI CHRONICLES</span>
          <span style="letter-spacing: 0.5px;">CONFIDENTIAL | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      </div>
    `,
  });

  fs.writeFileSync(PDF_OUTPUT, pdfBuffer);
  const pdfSizeKB = Math.round(pdfBuffer.length / 1024);
  console.log(`   PDF saved: ${PDF_OUTPUT} (${pdfSizeKB} KB)`);

  // ─── STEP 8: Per-page screenshots ─────────────────────────────────
  console.log("\n8. Taking per-page screenshots...");

  const A4_HEIGHT = 1123;
  const contentHeight = sectionInfo.containerHeight;
  const totalPages = Math.ceil(contentHeight / A4_HEIGHT);

  console.log(`   Total estimated pages: ${totalPages}`);

  for (let i = 0; i < Math.min(totalPages, 60); i++) {
    const yOffset = i * A4_HEIGHT;
    await page.evaluate((y) => window.scrollTo(0, y), yOffset);
    await new Promise((r) => setTimeout(r, 100));

    const pagePath = path.join(
      SCREENSHOT_DIR,
      `page-${String(i + 1).padStart(2, "0")}.png`
    );
    await page.screenshot({
      path: pagePath,
      clip: {
        x: 0,
        y: yOffset,
        width: 794,
        height: Math.min(A4_HEIGHT, contentHeight - yOffset),
      },
    });
  }
  console.log(`   Saved ${Math.min(totalPages, 60)} page screenshots.`);

  // ─── STEP 9: Blank page / UX analysis ─────────────────────────────
  console.log("\n9. Analyzing for UX issues...");

  const uxAnalysis = await page.evaluate(() => {
    const sections = document.querySelectorAll(".print-section");
    const issues = [];

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const rect = sec.getBoundingClientRect();
      const heading =
        sec.querySelector("h2, h3")?.textContent?.slice(0, 50) || "(no heading)";

      // Very tall sections (could cause problems)
      if (rect.height > 3000) {
        issues.push({
          section: i + 1,
          issue: "VERY_TALL",
          height: Math.round(rect.height),
          heading,
        });
      }

      // Sparse content (blank-looking section)
      const textContent = sec.textContent?.trim() || "";
      if (textContent.length < 20 && rect.height > 200) {
        issues.push({
          section: i + 1,
          issue: "SPARSE_CONTENT",
          height: Math.round(rect.height),
          textLength: textContent.length,
          heading,
        });
      }

      // Invisible children (framer-motion stuck at opacity:0)
      const invisibleChildren = sec.querySelectorAll('[style*="opacity: 0"]');
      if (invisibleChildren.length > 0) {
        issues.push({
          section: i + 1,
          issue: "INVISIBLE_CHILDREN",
          count: invisibleChildren.length,
          heading,
        });
      }

      // Empty section (error boundary caught a crash)
      if (rect.height === 0 || (rect.height < 5 && textContent.length === 0)) {
        issues.push({
          section: i + 1,
          issue: "EMPTY_SECTION (error boundary?)",
          height: Math.round(rect.height),
          heading,
        });
      }
    }

    // Overflow clipping issues
    const overflowHidden = document.querySelectorAll(
      '.print-section [class*="overflow-hidden"]'
    );
    const overflowIssues = [];
    overflowHidden.forEach((el) => {
      const computed = window.getComputedStyle(el);
      if (computed.overflow !== "visible") {
        overflowIssues.push({
          element:
            el.tagName + "." + el.className.split(" ").slice(0, 3).join("."),
          overflow: computed.overflow,
        });
      }
    });

    return { issues, overflowIssues };
  });

  if (uxAnalysis.issues.length > 0) {
    console.log("   UX ISSUES FOUND:");
    for (const issue of uxAnalysis.issues) {
      console.log(`     Section ${issue.section}: ${issue.issue}`, issue);
    }
  } else {
    console.log("   No UX issues detected.");
  }

  if (uxAnalysis.overflowIssues.length > 0) {
    console.log(
      `\n   OVERFLOW CLIPPING (${uxAnalysis.overflowIssues.length}):`
    );
    for (const oi of uxAnalysis.overflowIssues.slice(0, 10)) {
      console.log(`     ${oi.element} → overflow: ${oi.overflow}`);
    }
  }

  // ─── STEP 10: Footer overlap detection ────────────────────────────
  console.log("\n10. Checking for footer overlap...");

  const overlapAnalysis = await page.evaluate(() => {
    const PAGE_HEIGHT = 1123;
    const BOTTOM_MARGIN = 56;
    const contentEnd = PAGE_HEIGHT - BOTTOM_MARGIN;

    const allElements = document.querySelectorAll(".print-section *");
    const overlaps = [];

    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) continue;
      if (rect.height > 800) continue; // Skip multi-page elements

      const pageIndex = Math.floor(rect.top / PAGE_HEIGHT);
      const positionOnPage = rect.top - pageIndex * PAGE_HEIGHT;
      const bottomOnPage = positionOnPage + rect.height;

      if (bottomOnPage > contentEnd) {
        const overlapPx = Math.round(bottomOnPage - contentEnd);
        if (overlapPx > 5) {
          overlaps.push({
            tag: el.tagName,
            className:
              el.className?.split?.(" ")?.slice(0, 3)?.join(" ") || "",
            text: el.textContent?.slice(0, 40) || "",
            page: pageIndex + 1,
            bottomOnPage: Math.round(bottomOnPage),
            overlapPx,
          });
        }
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (const o of overlaps) {
      const key = `${o.page}-${o.tag}-${o.text.slice(0, 20)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(o);
      }
    }

    return unique.slice(0, 25);
  });

  if (overlapAnalysis.length > 0) {
    console.log(
      `   WARNING: ${overlapAnalysis.length} elements may overlap footer:`
    );
    for (const o of overlapAnalysis.slice(0, 15)) {
      console.log(
        `     Page ${o.page}: <${o.tag}> +${o.overlapPx}px | "${o.text}"`
      );
    }
  } else {
    console.log("   No footer overlap detected.");
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("                    SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   Intake ID:        ${INTAKE_ID}`);
  console.log(`   Sections:         ${sectionInfo.sectionCount}`);
  console.log(`   Container height: ${sectionInfo.containerHeight}px`);
  console.log(`   Estimated pages:  ~${totalPages}`);
  console.log(`   PDF size:         ${pdfSizeKB} KB`);
  console.log(`   Page errors:      ${pageErrors.length}`);
  console.log(`   UX issues:        ${uxAnalysis.issues.length}`);
  console.log(`   Overflow clips:   ${uxAnalysis.overflowIssues.length}`);
  console.log(`   Footer overlaps:  ${overlapAnalysis.length}`);
  console.log(`\n   Screenshots: ${SCREENSHOT_DIR}/`);
  console.log(`   PDF:         ${PDF_OUTPUT}`);
  console.log(`   Data:        ${DATA_FIXTURE}`);

  const hasIssues =
    pageErrors.length > 0 ||
    uxAnalysis.issues.length > 0 ||
    overlapAnalysis.length > 0;

  if (hasIssues) {
    console.log("\n   STATUS: ISSUES FOUND — review screenshots & PDF");
  } else {
    console.log("\n   STATUS: ALL CHECKS PASSED");
  }

  console.log("═══════════════════════════════════════════════════════\n");

  await browser.close();
}

runVisualTest().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
