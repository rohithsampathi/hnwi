import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  return NextResponse.json(
    {
      status: "moved",
      message: "Siya Prive developer intake is served from https://www.siyaprive.com/developers.",
    },
    { status: 404 },
  )
}

export const GET = POST
