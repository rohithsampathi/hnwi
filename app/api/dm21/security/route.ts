import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config/api";
import { logger } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";

function backendHeaders(cookieHeader: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Cookie": cookieHeader,
  };
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const search = request.nextUrl.searchParams;
    const dm02Url = new URL("/api/dm02/security/posture", API_BASE_URL);
    const postureRequest = search.get("request");
    if (postureRequest) {
      dm02Url.searchParams.set("request", postureRequest);
    }

    const response = await fetch(dm02Url.toString(), {
      method: "GET",
      headers: backendHeaders(cookieHeader),
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      logger.error("DM21 security posture backend error", { status: response.status });
      return NextResponse.json({ error: "Backend security posture unavailable" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      surface: "dm21_frontend",
      frontend_owner: "DM21",
      backend_owner: data.owner || "DM02 / Taksha",
    });
  } catch (error) {
    logger.error("DM21 security posture route failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to fetch security posture" }, { status: 500 });
  }
}
