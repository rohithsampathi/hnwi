import { ImageResponse } from "next/og"
import { getSharedDevelopment } from "./shared-development-data"

export const runtime = "edge"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

function trimCopy(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) {
    return cleaned
  }
  return `${cleaned.slice(0, max - 1).trimEnd()}…`
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const development = await getSharedDevelopment(id)

  const title = trimCopy(development?.title || "HNWI World Brief", 110)
  const description = trimCopy(
    development?.description || development?.card_summary || development?.hbyte_summary || "HNWI World brief from HNWI Chronicles.",
    180,
  )
  const category = trimCopy(development?.industry || "HNWI World", 40)
  const product = trimCopy(development?.product || "HNWI Chronicles", 52)
  const date = development?.date
    ? new Date(development.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "HNWI World"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0b0d 0%, #141416 45%, #1d1b17 100%)",
          color: "#f5f1e8",
          padding: "54px 62px",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#d4b06a",
              }}
            >
              HNWI World
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#d6d0c5" }}>{product}</div>
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(212,176,106,0.45)",
              padding: "10px 16px",
              fontSize: 18,
              color: "#e4d8be",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div style={{ display: "flex", fontSize: 62, lineHeight: 1.08, fontWeight: 600 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, color: "#d6d0c5" }}>{description}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(212,176,106,0.3)",
            paddingTop: 22,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 18, color: "#d4b06a", letterSpacing: 2, textTransform: "uppercase" }}>
              HNWI Chronicles
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#cfc6b6" }}>House-grade decision brief</div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#cfc6b6" }}>{date}</div>
        </div>
      </div>
    ),
    size,
  )
}
