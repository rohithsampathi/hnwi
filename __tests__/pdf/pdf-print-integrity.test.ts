/**
 * PDF Print System Integrity Tests
 *
 * These tests validate the structural integrity of the Puppeteer PDF generation
 * system. They ensure the root causes of content-overlapping-footer and blank
 * pages cannot regress:
 *
 *   1. @page CSS margin MUST match Puppeteer margin config exactly
 *   2. preferCSSPageSize MUST be false
 *   3. No aggressive break-inside:avoid on variable-height elements
 *   4. Footer template must override Chrome's default padding
 *   5. Print page sections must have correct structural classes
 *   6. Overflow must be forced visible in print sections
 *   7. Animations must be killed for static PDF rendering
 */

import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────
// FILE LOADING
// ─────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "../..");
const CSS_PATH = path.join(ROOT, "styles/pdf-print.css");
const ROUTE_PATH = path.join(
  ROOT,
  "app/api/decision-memo/pdf-puppeteer/[intakeId]/route.ts"
);
const PRINT_PAGE_PATH = path.join(
  ROOT,
  "app/decision-memo-print/[intakeId]/page.tsx"
);

const cssContent = fs.readFileSync(CSS_PATH, "utf-8");
const routeContent = fs.readFileSync(ROUTE_PATH, "utf-8");
const printPageContent = fs.readFileSync(PRINT_PAGE_PATH, "utf-8");

// ─────────────────────────────────────────────────────────────────────
// HELPERS: Parse CSS and Puppeteer config values from source
// ─────────────────────────────────────────────────────────────────────

/**
 * Extract @page margin values from CSS.
 * Expected format: @page { size: A4; margin: 40px 0 56px 0; }
 * Returns { top, right, bottom, left } in px strings.
 */
function parseCSSPageMargin(css: string): {
  top: string;
  right: string;
  bottom: string;
  left: string;
} | null {
  // Match @page { ... margin: <value>; ... }
  const pageBlockMatch = css.match(/@page\s*\{([^}]+)\}/);
  if (!pageBlockMatch) return null;

  const block = pageBlockMatch[1];
  const marginMatch = block.match(/margin:\s*([^;]+);/);
  if (!marginMatch) return null;

  const parts = marginMatch[1].trim().split(/\s+/);

  if (parts.length === 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  } else if (parts.length === 2) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[0],
      left: parts[1],
    };
  } else if (parts.length === 1) {
    return {
      top: parts[0],
      right: parts[0],
      bottom: parts[0],
      left: parts[0],
    };
  }
  return null;
}

/**
 * Extract Puppeteer margin config from the route source.
 * Looks for the margin: { top: "...", bottom: "...", left: "...", right: "..." } block.
 */
function parsePuppeteerMargins(source: string): {
  top: string;
  right: string;
  bottom: string;
  left: string;
} | null {
  // Find the margin block inside page.pdf({ ... })
  const topMatch = source.match(/top:\s*["']([^"']+)["']/);
  const bottomMatch = source.match(/bottom:\s*["']([^"']+)["']/);
  const leftMatch = source.match(/left:\s*["']([^"']+)["']/);
  const rightMatch = source.match(/right:\s*["']([^"']+)["']/);

  if (!topMatch || !bottomMatch || !leftMatch || !rightMatch) return null;

  return {
    top: topMatch[1],
    right: rightMatch[1],
    bottom: bottomMatch[1],
    left: leftMatch[1],
  };
}

/**
 * Extract preferCSSPageSize value from route source.
 */
function parsePreferCSSPageSize(source: string): boolean | null {
  const match = source.match(/preferCSSPageSize:\s*(true|false)/);
  if (!match) return null;
  return match[1] === "true";
}

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 1: @page MARGIN ↔ PUPPETEER MARGIN ALIGNMENT
//
// ROOT CAUSE: Chrome applies @page { margin } to content layout
// INDEPENDENTLY of Puppeteer margins. If they disagree, content
// flows into the footer zone (when @page margin < Puppeteer margin)
// or creates excessive whitespace (when @page margin > Puppeteer margin).
// ═══════════════════════════════════════════════════════════════════════

describe("@page CSS margin ↔ Puppeteer margin alignment", () => {
  const cssMargins = parseCSSPageMargin(cssContent);
  const puppeteerMargins = parsePuppeteerMargins(routeContent);

  test("CSS @page block exists and has margin declaration", () => {
    expect(cssMargins).not.toBeNull();
  });

  test("Puppeteer margin config exists in route", () => {
    expect(puppeteerMargins).not.toBeNull();
  });

  test("@page top margin matches Puppeteer top margin", () => {
    expect(cssMargins!.top).toBe(puppeteerMargins!.top);
  });

  test("@page bottom margin matches Puppeteer bottom margin", () => {
    expect(cssMargins!.bottom).toBe(puppeteerMargins!.bottom);
  });

  test("@page left margin matches Puppeteer left margin", () => {
    expect(cssMargins!.left).toBe(puppeteerMargins!.left);
  });

  test("@page right margin matches Puppeteer right margin", () => {
    expect(cssMargins!.right).toBe(puppeteerMargins!.right);
  });

  test("@page bottom margin is ≥ 40px (enough for footer zone)", () => {
    const bottomPx = parseInt(cssMargins!.bottom, 10);
    expect(bottomPx).toBeGreaterThanOrEqual(40);
  });

  test("@page includes size: A4", () => {
    expect(cssContent).toMatch(/@page\s*\{[^}]*size:\s*A4/);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 2: PUPPETEER ROUTE CONFIG VALIDATION
//
// Ensures all the critical Puppeteer settings that prevent PDF rendering
// bugs are correctly configured.
// ═══════════════════════════════════════════════════════════════════════

describe("Puppeteer route configuration", () => {
  test("preferCSSPageSize is false (prevents CSS @page from overriding Puppeteer margins)", () => {
    const value = parsePreferCSSPageSize(routeContent);
    expect(value).toBe(false);
  });

  test("format is A4", () => {
    expect(routeContent).toMatch(/format:\s*["']A4["']/);
  });

  test("printBackground is true (renders dark theme backgrounds)", () => {
    expect(routeContent).toMatch(/printBackground:\s*true/);
  });

  test("displayHeaderFooter is true", () => {
    expect(routeContent).toMatch(/displayHeaderFooter:\s*true/);
  });

  test("headerTemplate kills Chrome default padding", () => {
    // Chrome adds hidden padding to #header and #footer elements
    // Must override with padding: 0 !important
    expect(routeContent).toMatch(
      /#header.*padding:\s*0\s*!important/s
    );
    expect(routeContent).toMatch(
      /#footer.*padding:\s*0\s*!important/s
    );
  });

  test("footerTemplate kills Chrome default padding", () => {
    // Footer template ALSO needs the padding reset
    const footerTemplateMatch = routeContent.match(
      /footerTemplate:\s*`([\s\S]*?)`/
    );
    expect(footerTemplateMatch).not.toBeNull();
    const footerTemplate = footerTemplateMatch![1];
    expect(footerTemplate).toContain("padding: 0 !important");
  });

  test("footerTemplate uses ≤ 8px font-size (Chrome renders at ~133% scale)", () => {
    const footerTemplateMatch = routeContent.match(
      /footerTemplate:\s*`([\s\S]*?)`/
    );
    const footerTemplate = footerTemplateMatch![1];
    // Extract font-size values from the footer
    const fontSizes = footerTemplate.match(/font-size:\s*(\d+)px/g);
    expect(fontSizes).not.toBeNull();
    fontSizes!.forEach((declaration) => {
      const sizeMatch = declaration.match(/(\d+)/);
      const size = parseInt(sizeMatch![1], 10);
      expect(size).toBeLessThanOrEqual(8);
    });
  });

  test("footerTemplate contains page number placeholders", () => {
    const footerTemplateMatch = routeContent.match(
      /footerTemplate:\s*`([\s\S]*?)`/
    );
    const footerTemplate = footerTemplateMatch![1];
    expect(footerTemplate).toContain("pageNumber");
    expect(footerTemplate).toContain("totalPages");
  });

  test("viewport width is 794px (A4 at 96dpi)", () => {
    expect(routeContent).toMatch(/width:\s*794/);
  });

  test("prefers-reduced-motion is set to reduce (kills framer-motion)", () => {
    expect(routeContent).toContain("prefers-reduced-motion");
    expect(routeContent).toContain("reduce");
  });

  test("waits for data-loaded signal before PDF generation", () => {
    expect(routeContent).toContain("data-loaded");
    expect(routeContent).toMatch(/waitForSelector/);
  });

  test("uses networkidle0 for initial page load", () => {
    expect(routeContent).toContain("networkidle0");
  });

  test("maxDuration is set for long PDF generation", () => {
    expect(routeContent).toMatch(/maxDuration\s*=\s*\d+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 3: CSS BREAK RULES — NO AGGRESSIVE BREAK-INSIDE:AVOID
//
// ROOT CAUSE: Chromium's break-inside:avoid pushes oversized elements
// to the next page, leaving the current page blank. This creates 10+
// empty pages in a 40-page PDF. Only small, fixed-height elements
// should use break-inside:avoid.
// See: https://github.com/puppeteer/puppeteer/issues/6951
// ═══════════════════════════════════════════════════════════════════════

describe("CSS break rules — no blank-page-causing rules", () => {
  test("NO break-inside:avoid on rounded-lg elements (variable height cards)", () => {
    // These are tall cards that can exceed a page — break-inside:avoid
    // would push them to next page, creating blank pages
    const roundedLgBreakRule = cssContent.match(
      /\[class\*=["']rounded-lg["']\][^{]*\{[^}]*break-inside:\s*avoid/s
    );
    expect(roundedLgBreakRule).toBeNull();
  });

  test("NO break-inside:avoid on rounded-xl elements", () => {
    // rounded-xl selector should only have box-decoration-break: clone
    // (visual only), NOT break-inside:avoid
    const roundedXlLines = cssContent.match(
      /\[class\*=["']rounded-xl["']\][^{]*\{[^}]*\}/gs
    );
    if (roundedXlLines) {
      roundedXlLines.forEach((block) => {
        // box-decoration-break is OK — it's visual only
        // break-inside:avoid is NOT OK — causes blank pages
        if (block.includes("break-inside")) {
          expect(block).not.toMatch(/break-inside:\s*avoid/);
        }
      });
    }
  });

  test("NO break-inside:avoid on rounded-2xl elements", () => {
    const rounded2xlLines = cssContent.match(
      /\[class\*=["']rounded-2xl["']\][^{]*\{[^}]*\}/gs
    );
    if (rounded2xlLines) {
      rounded2xlLines.forEach((block) => {
        if (block.includes("break-inside")) {
          expect(block).not.toMatch(/break-inside:\s*avoid/);
        }
      });
    }
  });

  test("NO break-inside:avoid on bg-* + border elements", () => {
    // Overly broad selectors like [class*="bg-"][class*="border"] would
    // catch hundreds of elements — many too tall for avoid
    const bgBorderRule = cssContent.match(
      /\[class\*=["']bg-["']\]\[class\*=["']border["']\][^{]*\{[^}]*break-inside:\s*avoid/s
    );
    expect(bgBorderRule).toBeNull();
  });

  test("break-inside:avoid ONLY on .print-no-break, thead, tr", () => {
    // Extract all selectors that have break-inside: avoid
    const breakInsideRules: string[] = [];
    const ruleRegex = /([^{}]+)\{[^}]*break-inside:\s*avoid[^}]*\}/g;
    let match;
    while ((match = ruleRegex.exec(cssContent)) !== null) {
      breakInsideRules.push(match[1].trim());
    }

    // Should only have ONE rule with these three selectors
    expect(breakInsideRules.length).toBe(1);
    const selectorGroup = breakInsideRules[0];
    expect(selectorGroup).toContain(".print-no-break");
    expect(selectorGroup).toContain("thead");
    expect(selectorGroup).toContain("tr");
  });

  test("box-decoration-break:clone on rounded cards (visual continuity only)", () => {
    // When a card splits across pages, clone ensures borders/bg repeat
    // This is purely visual — it does NOT prevent breaking
    expect(cssContent).toMatch(
      /box-decoration-break:\s*clone/
    );
    expect(cssContent).toMatch(
      /-webkit-box-decoration-break:\s*clone/
    );
  });

  test("headings use break-after:avoid (prevents orphaned headings)", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+h[2-4][^{]*\{[^}]*break-after:\s*avoid/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 4: OVERFLOW AND CLIPPING PREVENTION
//
// overflow:hidden on parent elements clips content at page breaks,
// making it invisible. Must be forced to overflow:visible in print.
// ═══════════════════════════════════════════════════════════════════════

describe("CSS overflow and clipping prevention", () => {
  test("overflow forced visible on elements with overflow-* classes", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+\[class\*=["']overflow-["']\]\s*\{[^}]*overflow:\s*visible\s*!important/s
    );
  });

  test(".print-container has overflow:visible", () => {
    const containerBlock = cssContent.match(
      /\.print-container\s*\{([^}]+)\}/
    );
    expect(containerBlock).not.toBeNull();
    expect(containerBlock![1]).toContain("overflow: visible");
  });

  test("print-section has word-wrap:break-word", () => {
    expect(cssContent).toMatch(
      /\.print-section\s*\{[^}]*overflow-wrap:\s*break-word/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 5: ANIMATION KILL — all motion disabled for static PDF
// ═══════════════════════════════════════════════════════════════════════

describe("CSS animation and framer-motion kill", () => {
  test("animation-duration forced to 0s on all elements", () => {
    expect(cssContent).toMatch(/animation-duration:\s*0s\s*!important/);
  });

  test("transition-duration forced to 0s on all elements", () => {
    expect(cssContent).toMatch(/transition-duration:\s*0s\s*!important/);
  });

  test("opacity forced to 1 on .print-container children (framer-motion fix)", () => {
    expect(cssContent).toMatch(
      /\.print-container\s+\*\s*\{[^}]*opacity:\s*1\s*!important/s
    );
  });

  test("transform forced to none for translateY/X elements (framer-motion fix)", () => {
    expect(cssContent).toContain('translateY');
    expect(cssContent).toMatch(
      /transform:\s*none\s*!important/
    );
  });

  test("watermark excluded from transform reset", () => {
    expect(cssContent).toMatch(
      /:not\(\.print-watermark\)/
    );
  });

  test("SVG stroke-dashoffset forced to 0 (drawing animations)", () => {
    expect(cssContent).toMatch(
      /stroke-dashoffset:\s*0\s*!important/
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 6: PRINT PAGE STRUCTURE
//
// Validates the print page JSX has the correct structural elements
// that the CSS depends on.
// ═══════════════════════════════════════════════════════════════════════

describe("Print page structure", () => {
  test("imports pdf-print.css", () => {
    expect(printPageContent).toContain("pdf-print.css");
  });

  test("has print-container wrapper div", () => {
    expect(printPageContent).toContain("print-container");
  });

  test("sections use print-section class", () => {
    const sectionCount = (
      printPageContent.match(/className="print-section/g) || []
    ).length;
    // Should have many sections (25 sections total)
    expect(sectionCount).toBeGreaterThanOrEqual(10);
  });

  test("scenario tree section has print-scenario-tree class", () => {
    expect(printPageContent).toContain("print-section print-scenario-tree");
  });

  test("sections have print-page-header divs", () => {
    const headerCount = (
      printPageContent.match(/print-page-header/g) || []
    ).length;
    expect(headerCount).toBeGreaterThanOrEqual(10);
  });

  test("sets data-loaded attribute for Puppeteer signal", () => {
    expect(printPageContent).toContain("data-loaded");
  });

  test("mocks IntersectionObserver for Puppeteer (elements with useInView)", () => {
    expect(printPageContent).toContain("IntersectionObserver");
    expect(printPageContent).toContain("isIntersecting: true");
  });

  test("has watermark element with print-watermark class", () => {
    expect(printPageContent).toContain("print-watermark");
  });

  test("has HC badge element with print-hc-badge class", () => {
    expect(printPageContent).toContain("print-hc-badge");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 7: SCENARIO TREE PRINT LAYOUT
//
// The 3-column grid (md:grid-cols-3) creates ~214px columns on A4,
// which wraps text to single words. Must be overridden to 1-column.
// ═══════════════════════════════════════════════════════════════════════

describe("Scenario tree print layout", () => {
  test("print-scenario-tree overrides md:grid-cols-3 to 1fr", () => {
    expect(cssContent).toMatch(
      /\.print-scenario-tree\s+\.md\\:grid-cols-3\s*\{[^}]*grid-template-columns:\s*1fr\s*!important/s
    );
  });

  test("print-scenario-tree tightens card padding", () => {
    expect(cssContent).toMatch(
      /\.print-scenario-tree\s+\.rounded-2xl\s*\{[^}]*padding-left:\s*24px\s*!important/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 8: COVER & LAST PAGE LAYOUT
//
// These pages need to fill exactly 1 A4 page (minus Puppeteer margins).
// ═══════════════════════════════════════════════════════════════════════

describe("Cover and last page layout", () => {
  test("cover page does NOT have break-before:page", () => {
    expect(cssContent).toMatch(
      /\.print-section:first-child\s*\{[^}]*break-before:\s*auto/s
    );
  });

  test("cover/last page uses min-height accounting for margins", () => {
    // min-height should account for top (40px) + bottom (56px) = 96px
    expect(cssContent).toMatch(/min-height:\s*calc\(100vh\s*-\s*96px\)/);
  });

  test("cover page reduces excessive web margins for A4 fit", () => {
    // Web uses mb-20 (5rem = 80px) — too much for A4
    expect(cssContent).toMatch(
      /\.print-section:first-child\s+\.mb-20\s*\{[^}]*margin-bottom:[^}]*!important/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 9: TABLE LAYOUT FOR A4
//
// Web table padding (px-4 py-3.5 = 16px/14px) is too spacious for
// 690px printable width. Must be tightened.
// ═══════════════════════════════════════════════════════════════════════

describe("Table layout for A4 print", () => {
  test("tables forced to 100% width", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+table\s*\{[^}]*width:\s*100%\s*!important/s
    );
  });

  test("table header padding reduced from web defaults", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+table\s+th\s*\{[^}]*padding:\s*6px\s+5px\s*!important/s
    );
  });

  test("table cell padding reduced from web defaults", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+table\s+td\s*\{[^}]*padding:\s*6px\s+5px\s*!important/s
    );
  });

  test("table header font-size reduced for A4", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+table\s+th\s*\{[^}]*font-size:\s*0\.6rem\s*!important/s
    );
  });

  test("table headers use white-space:nowrap", () => {
    expect(cssContent).toMatch(
      /\.print-section\s+table\s+th\s*\{[^}]*white-space:\s*nowrap/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 10: FIXED ELEMENTS (watermark, badge, hiding non-print)
// ═══════════════════════════════════════════════════════════════════════

describe("Fixed elements and non-print hiding", () => {
  test("watermark uses position:fixed (repeats on every page)", () => {
    expect(cssContent).toMatch(
      /\.print-watermark\s*\{[^}]*position:\s*fixed/s
    );
  });

  test("HC badge uses position:fixed (repeats on every page)", () => {
    expect(cssContent).toMatch(
      /\.print-hc-badge\s*\{[^}]*position:\s*fixed/s
    );
  });

  test("non-print fixed elements are hidden", () => {
    expect(cssContent).toMatch(/display:\s*none\s*!important/);
    expect(cssContent).toContain(":not(.print-watermark)");
    expect(cssContent).toContain(":not(.print-hc-badge)");
  });

  test("nextjs-portal is hidden", () => {
    expect(cssContent).toMatch(
      /nextjs-portal\s*\{[^}]*display:\s*none\s*!important/s
    );
  });

  test("print-hide class hides elements", () => {
    expect(cssContent).toMatch(
      /\.print-container\s+\.print-hide\s*\{[^}]*display:\s*none\s*!important/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 11: PRINT CONTAINER DIMENSIONS
// ═══════════════════════════════════════════════════════════════════════

describe("Print container dimensions", () => {
  test("container width is 794px (A4 at 96dpi)", () => {
    expect(cssContent).toMatch(
      /\.print-container\s*\{[^}]*width:\s*794px/s
    );
  });

  test("section padding is 52px", () => {
    expect(cssContent).toMatch(
      /\.print-section\s*\{[^}]*padding:\s*52px/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 12: RESPONSIVE OVERRIDE — force desktop layout in PDF
// ═══════════════════════════════════════════════════════════════════════

describe("Responsive overrides for print", () => {
  test("sm:grid-cols-2 forces 2-column grid", () => {
    expect(cssContent).toMatch(
      /\.print-container\s+\.sm\\:grid-cols-2\s*\{[^}]*grid-template-columns:\s*repeat\(2/s
    );
  });

  test("md:grid-cols-2 forces 2-column grid", () => {
    expect(cssContent).toMatch(
      /\.print-container\s+\.md\\:grid-cols-2\s*\{[^}]*grid-template-columns:\s*repeat\(2/s
    );
  });

  test("sm:hidden elements stay hidden in print", () => {
    expect(cssContent).toMatch(
      /\.print-container\s+\.sm\\:hidden\s*\{[^}]*display:\s*none\s*!important/s
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 13: CROSS-SYSTEM INVARIANTS
//
// These are the "golden rules" that prevent the top 3 PDF rendering
// bugs. If ANY of these fail, the PDF WILL have visual defects.
// ═══════════════════════════════════════════════════════════════════════

describe("Cross-system invariants (golden rules)", () => {
  test("GOLDEN RULE 1: @page margin === Puppeteer margin (prevents footer overlap)", () => {
    const cssM = parseCSSPageMargin(cssContent);
    const puppM = parsePuppeteerMargins(routeContent);

    expect(cssM).not.toBeNull();
    expect(puppM).not.toBeNull();

    // All four sides must match exactly
    expect(`${cssM!.top} ${cssM!.right} ${cssM!.bottom} ${cssM!.left}`).toBe(
      `${puppM!.top} ${puppM!.right} ${puppM!.bottom} ${puppM!.left}`
    );
  });

  test("GOLDEN RULE 2: preferCSSPageSize === false (Puppeteer controls page)", () => {
    expect(parsePreferCSSPageSize(routeContent)).toBe(false);
  });

  test("GOLDEN RULE 3: No break-inside:avoid on variable-height cards (prevents blank pages)", () => {
    // Check that NONE of these selectors have break-inside:avoid:
    const dangerousSelectors = [
      "rounded-lg",
      "rounded-xl",
      "rounded-2xl",
      'bg-"][class*="border',
    ];

    dangerousSelectors.forEach((sel) => {
      const regex = new RegExp(
        `\\[class\\*=["']${sel.replace(/[[\]]/g, "\\$&")}["']\\][^{]*\\{[^}]*break-inside:\\s*avoid`,
        "s"
      );
      expect(cssContent).not.toMatch(regex);
    });
  });

  test("GOLDEN RULE 4: Chrome header/footer default padding killed", () => {
    // Both header and footer templates must include the padding reset
    expect(routeContent).toMatch(
      /headerTemplate.*#header.*padding:\s*0\s*!important/s
    );
    // The footer template (which is the longer one) must also have it
    const footerMatch = routeContent.match(/footerTemplate:\s*`([\s\S]*?)`/);
    expect(footerMatch).not.toBeNull();
    expect(footerMatch![1]).toContain("padding: 0 !important");
  });

  test("GOLDEN RULE 5: @page margin comment documents the matching Puppeteer values", () => {
    // The CSS should document what Puppeteer values it's matching
    // This prevents future developers from changing one without the other
    expect(cssContent).toMatch(/Puppeteer config.*top.*bottom/s);
  });
});
