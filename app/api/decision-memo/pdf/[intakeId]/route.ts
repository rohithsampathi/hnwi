/**
 * NATIVE PDF GENERATION API ROUTE
 * Endpoint: GET /api/decision-memo/pdf/[intakeId]
 *
 * Uses @react-pdf/renderer to generate PDFs server-side in Node.js.
 * No Puppeteer, no headless Chrome, no CSS page-break hacks.
 *
 * Flow:
 *   1. Fetches memo data from Python backend
 *   2. Passes PdfMemoData to PatternAuditDocument (24-page React-PDF component)
 *   3. Renders to buffer via @react-pdf/renderer's renderToBuffer()
 *   4. Returns PDF as downloadable response
 */

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { API_BASE_URL } from "@/config/api";
import { logger } from "@/lib/secure-logger";
import { safeError } from "@/lib/security/api-response";
import { PatternAuditDocument } from "@/lib/pdf/PatternAuditDocument";
import type { PdfMemoData } from "@/lib/pdf/pdf-types";

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

  try {
    logger.info("Starting native PDF generation", { intakeId });

    // 1. Fetch memo data from Python backend
    const backendUrl = `${API_BASE_URL}/api/decision-memo/${intakeId}`;

    const authHeader = request.headers.get("Authorization");
    const cookieHeader = request.headers.get("cookie");
    const backendHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) backendHeaders["Authorization"] = authHeader;
    if (cookieHeader) backendHeaders["Cookie"] = cookieHeader;

    const dataResponse = await fetch(backendUrl, {
      method: "GET",
      headers: backendHeaders,
      signal: AbortSignal.timeout(120000),
    });

    if (dataResponse.status === 401) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!dataResponse.ok) {
      logger.error("Backend error fetching memo data for PDF", {
        intakeId,
        status: dataResponse.status,
      });
      return NextResponse.json(
        { error: `Backend returned ${dataResponse.status}` },
        { status: dataResponse.status }
      );
    }

    const rawData = await dataResponse.json();

    // 2. Normalize into PdfMemoData shape
    const memoData: PdfMemoData = {
      success: rawData.success ?? true,
      intake_id: rawData.intake_id || intakeId,
      generated_at: rawData.generated_at || new Date().toISOString(),
      preview_data: rawData.preview_data || {},
      memo_data: rawData.memo_data || { kgv3_intelligence_used: {} },
      full_memo_url: rawData.full_memo_url,
      mitigationTimeline: rawData.mitigationTimeline,
      risk_assessment: rawData.risk_assessment,
      all_mistakes: rawData.all_mistakes,
      identified_risks: rawData.identified_risks,
      thesis: rawData.thesis,
      full_artifact: rawData.full_artifact,
    };

    logger.info("Memo data fetched, rendering PDF", {
      intakeId,
      hasPreviewData: !!memoData.preview_data,
      hasMemoData: !!memoData.memo_data,
    });

    // 3. Render to buffer using @react-pdf/renderer
    const nodeBuffer = await renderToBuffer(
      React.createElement(PatternAuditDocument, { memoData })
    );

    // Convert Node Buffer to Uint8Array for Web Response compatibility
    const pdfBytes = new Uint8Array(nodeBuffer);

    logger.info("Native PDF generated successfully", {
      intakeId,
      sizeKB: Math.round(pdfBytes.length / 1024),
    });

    // 4. Return PDF as downloadable response
    const refId =
      intakeId.slice(10, 22).toUpperCase() ||
      intakeId.slice(0, 12).toUpperCase();
    const fileName = `HNWI-Decision-Audit-${refId}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("Native PDF generation failed", {
      intakeId,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return safeError(error);
  }
}

export const maxDuration = 120;
