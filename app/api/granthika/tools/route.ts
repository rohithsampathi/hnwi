import { NextResponse } from "next/server"
import {
  GRANTHIKA_BASE_STATION_PATH,
  GRANTHIKA_NATIVE_TOOLS,
  getGranthikaBrokerUrl,
} from "@/lib/granthika-native-tools"
import { logger } from "@/lib/secure-logger"

export const dynamic = "force-dynamic"

async function readBrokerReady() {
  const brokerUrl = getGranthikaBrokerUrl()
  const readyUrl = new URL("/ready", brokerUrl)
  const headers: HeadersInit = {}
  const token = process.env.GRANTHIKA_BROKER_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(readyUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    })
    if (!response.ok) {
      return {
        ok: false,
        status: "broker_unavailable",
        http_status: response.status,
      }
    }
    const data = await response.json()
    return {
      ok: Boolean(data.ok),
      status: data.ok ? "ready" : "not_ready",
      run_id: data.run_id || process.env.GRANTHIKA_RUN_ID || "",
      next_gate: data.next_gate || "",
      query_index_present: Boolean(data.query_index_present),
      query_index_counts: data.query_index_counts || null,
    }
  } catch (error) {
    logger.error("Granthika broker readiness probe failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      status: "broker_unavailable",
    }
  }
}

export async function GET() {
  const brokerUrl = getGranthikaBrokerUrl()
  const broker = await readBrokerReady()

  return NextResponse.json({
    ok: true,
    surface: "dm21_frontend_granthika_tools",
    owner: "DM21",
    source_authority: "Granthika base-station repo and broker readiness probe",
    base_station: {
      repo_path: GRANTHIKA_BASE_STATION_PATH,
      broker_url: brokerUrl,
      run_id: process.env.GRANTHIKA_RUN_ID || broker.run_id || "",
    },
    broker,
    tools: GRANTHIKA_NATIVE_TOOLS,
    security_gate: {
      external_exposure_default: "deny",
      frontend_claims_backend_truth: false,
      compliance_certification_asserted: false,
      note: "This route exposes tool readiness metadata only; sensitive packets still require DM21 exposure evaluation.",
    },
  })
}
