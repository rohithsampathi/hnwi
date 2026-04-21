import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config/api";
import { logger } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const response = await fetch(new URL("/api/dm02/security/exposure/evaluate", API_BASE_URL).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      logger.error("DM21 exposure evaluation backend error", { status: response.status });
      return NextResponse.json({ error: "Backend exposure evaluation unavailable" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      surface: "dm21_frontend",
      frontend_owner: "DM21",
      backend_owner: data.owner || "DM02 / Taksha",
    });
  } catch (error) {
    logger.error("DM21 exposure evaluation route failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to evaluate exposure" }, { status: 500 });
  }
}
