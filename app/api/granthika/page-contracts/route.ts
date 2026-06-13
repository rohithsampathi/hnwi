import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_BASE_URL } from "@/config/api"
import { GRANTHIKA_PAGE_CONTRACTS } from "@/lib/granthika-page-contracts"
import { logger } from "@/lib/secure-logger"

export const dynamic = "force-dynamic"

function cookieHeaderFromStore(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")
}

export async function GET(request: NextRequest) {
  const backendUrl = new URL("/api/granthika/page-contracts", API_BASE_URL)
  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value)
  })

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cookie": cookieHeaderFromStore(cookieStore),
    }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      logger.error("Granthika page contracts backend error", { status: response.status })
      return NextResponse.json(
        {
          ok: false,
          status: "backend_contract_unavailable",
          surface: "dm21_frontend_granthika_page_contracts",
          frontend_owner: "DM21",
          backend_owner: "Granthika / DM02",
          message: "Backend Granthika contract endpoint is required before page native status can be asserted.",
          local_contracts: GRANTHIKA_PAGE_CONTRACTS,
        },
        { status: 503 },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      ...data,
      ok: data.ok ?? true,
      surface: "dm21_frontend_granthika_page_contracts",
      frontend_owner: "DM21",
      backend_owner: data.backend_owner || data.owner || "Granthika / DM02",
    })
  } catch (error) {
    logger.error("Granthika page contracts route failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      {
        ok: false,
        status: "backend_contract_unavailable",
        surface: "dm21_frontend_granthika_page_contracts",
        frontend_owner: "DM21",
        backend_owner: "Granthika / DM02",
        message: "Backend Granthika contract endpoint is required before page native status can be asserted.",
        local_contracts: GRANTHIKA_PAGE_CONTRACTS,
      },
      { status: 503 },
    )
  }
}
