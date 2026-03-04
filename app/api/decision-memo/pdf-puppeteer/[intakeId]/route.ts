/**
 * PUPPETEER PDF GENERATION API ROUTE
 * Endpoint: GET /api/decision-memo/pdf-puppeteer/[intakeId]
 *
 * Flow:
 *   1. Launches headless Chromium via Puppeteer
 *   2. Navigates to /decision-memo-print/[intakeId] (the print page)
 *   3. Waits for [data-loaded="true"] (signals React rendering is complete)
 *   4. Generates A4 PDF with dark background, headers, footers
 *   5. Returns PDF as downloadable response
 */

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { logger } from "@/lib/secure-logger";

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { intakeId } = await Promise.resolve(context.params);

  if (!intakeId || intakeId.length < 5) {
    return NextResponse.json({ error: "Invalid intakeId" }, { status: 400 });
  }

  let browser;

  try {
    logger.info("Starting Puppeteer PDF generation", { intakeId });

    // Determine the server URL for navigation
    // In production: use NEXT_PUBLIC_APP_URL or construct from request
    // In development: use localhost
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const serverUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.PUPPETEER_BASE_URL ||
      `${protocol}://${host}`;

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
        "--disable-web-security", // Allow localhost connections
      ],
    });

    const page = await browser.newPage();

    // Set viewport to A4-width (794px at 96dpi)
    await page.setViewport({ width: 794, height: 1123 });

    // Tell framer-motion to skip all animations (instant completion)
    // Without this, animated elements take 0.5-0.8s to reach final state
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);

    // Capture page errors and console messages for diagnostics
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
      logger.error("Puppeteer page error", { intakeId, error: err.message });
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        pageErrors.push(`console.error: ${msg.text()}`);
        logger.error("Puppeteer console error", { intakeId, text: msg.text() });
      }
    });

    // Forward cookies from the original request (for any auth that might be needed)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return {
          name: name.trim(),
          value: rest.join("=").trim(),
          domain: new URL(serverUrl).hostname,
        };
      });
      await page.setCookie(...cookies);
    }

    // Navigate to the print page
    const printUrl = `${serverUrl}/decision-memo-print/${intakeId}`;
    logger.info("Navigating to print page", { printUrl });

    await page.goto(printUrl, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });

    // Wait for the React app to signal that data has loaded and rendered
    // The print page sets data-loaded="true" on success, data-error on failure
    try {
      await page.waitForSelector("[data-loaded='true']", {
        timeout: 30000,
      });
    } catch (selectorError) {
      // Check if the page set an error attribute instead
      const pageState = await page.evaluate(() => ({
        dataLoaded: document.body.getAttribute("data-loaded"),
        dataError: document.body.getAttribute("data-error"),
        bodyText: document.body.innerText?.slice(0, 500),
      }));
      logger.error("Puppeteer waitForSelector failed", {
        intakeId,
        pageState,
        pageErrors: pageErrors.slice(0, 5),
      });
      throw new Error(
        `Page did not signal ready. State: ${pageState.dataLoaded || "null"}, Error: ${pageState.dataError || "none"}, PageErrors: ${pageErrors.join("; ").slice(0, 300)}`
      );
    }

    // Additional small wait for any remaining renders
    await new Promise((r) => setTimeout(r, 1500));

    // Generate PDF
    const refId = intakeId.slice(10, 22).toUpperCase() || intakeId.slice(0, 12).toUpperCase();

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // CRITICAL: preferCSSPageSize MUST be false (default).
      // When true, CSS @page { margin: 0 } overrides Puppeteer margins,
      // making the full page the content area — content flows into footer.
      // With false, Puppeteer margins exclusively control content boundaries.
      // See: https://github.com/puppeteer/puppeteer/issues/13738
      //      https://github.com/puppeteer/puppeteer/issues/6657
      preferCSSPageSize: false,
      margin: {
        top: "40px",   // Breathing room on overflow pages (no section padding there)
        bottom: "56px", // Footer zone — content STOPS here, footer renders within
        left: "0",
        right: "0",
      },
      displayHeaderFooter: true,
      // Chrome adds default padding to header/footer templates — override with style tag
      // See: https://github.com/puppeteer/puppeteer/issues/4132
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

    logger.info("PDF generated successfully", {
      intakeId,
      sizeKB: Math.round(pdfBuffer.length / 1024),
    });

    // Return PDF as downloadable response
    const fileName = `HNWI-Decision-Audit-${refId}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("Puppeteer PDF generation failed", {
      intakeId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "PDF generation failed",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors
      }
    }
  }
}

// Set longer timeout for this route (PDF generation can take time)
export const maxDuration = 60;
