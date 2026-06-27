import { NextRequest } from "next/server"
import { handleSiyaIntakeRequest } from "@/lib/server/siya-intake-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  return handleSiyaIntakeRequest("developer", request)
}

