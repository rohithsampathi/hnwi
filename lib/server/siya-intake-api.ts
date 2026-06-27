import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/config/api"
import {
  buyerIntakeSchema,
  developerIntakeSchema,
  sanitizeLakshyaIntakeResponse,
  type SiyaIntakeKind,
} from "@/lib/siya-intake"

export const SIYA_INTAKE_ROUTE_CONFIG = {
  runtime: "nodejs",
  dynamic: "force-dynamic",
}

const schemas = {
  buyer: buyerIntakeSchema,
  developer: developerIntakeSchema,
} as const

const backendPaths: Record<SiyaIntakeKind, string> = {
  buyer: "/v1/kingdom/lakshya/intake/buyer",
  developer: "/v1/kingdom/lakshya/intake/developer",
}

function backendBearerToken() {
  return (
    process.env.KINGDOM_PRIVATE_API_TOKEN ||
    process.env.KINGDOM_CORE_API_TOKEN ||
    process.env.LEADER_PRIVATE_API_TOKEN ||
    process.env.KINGDOM_API_TOKEN ||
    ""
  ).trim()
}

function forwardedHeaders(request: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-hnwi-public-intake": "siya-prive",
  }
  const token = backendBearerToken()
  if (token) headers.authorization = `Bearer ${token}`
  const userAgent = request.headers.get("user-agent")
  const referer = request.headers.get("referer")
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (userAgent) headers["user-agent"] = userAgent
  if (referer) headers.referer = referer
  if (forwardedFor) {
    headers["x-forwarded-for"] = forwardedFor
    headers["x-real-ip"] = forwardedFor
  }
  return headers
}

export async function handleSiyaIntakeRequest(kind: SiyaIntakeKind, request: NextRequest) {
  const schema = schemas[kind]
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { status: "invalid_request", receiptId: "", message: "Submit the form again with valid details." },
      { status: 400 },
    )
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "validation_error",
        receiptId: "",
        message: "Please check the required fields and submit again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const backendUrl = new URL(backendPaths[kind], API_BASE_URL)
  if (!backendBearerToken()) {
    return NextResponse.json(
      {
        status: "intake_unavailable",
        receiptId: "",
        message: "We could not submit this intake right now. Please try again shortly.",
      },
      { status: 503 },
    )
  }

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "POST",
      headers: forwardedHeaders(request),
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "intake_unavailable",
          receiptId: "",
          message: "We could not submit this intake right now. Please try again shortly.",
        },
        { status: response.status >= 500 ? 502 : response.status },
      )
    }

    const backendPayload = await response.json().catch(() => ({}))
    return NextResponse.json(sanitizeLakshyaIntakeResponse(backendPayload), {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    })
  } catch {
    return NextResponse.json(
      {
        status: "intake_unavailable",
        receiptId: "",
        message: "We could not submit this intake right now. Please try again shortly.",
      },
      { status: 503 },
    )
  }
}
