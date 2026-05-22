import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedDevelopmentClient from "./shared-development-client"
import { getRequestBaseUrl, getSharedDevelopment } from "./shared-development-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const development = await getSharedDevelopment(id)

  if (!development) {
    return {
      title: "Brief Not Found | HNWI Chronicles",
      description: "This HNWI World brief is no longer available.",
    }
  }

  const siteUrl = await getRequestBaseUrl()
  const title = `${development.title} | HNWI World`
  const description =
    development.description ||
    development.card_summary ||
    development.hbyte_summary ||
    "HNWI World brief from HNWI Chronicles."

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/share/development/${encodeURIComponent(id)}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/share/development/${encodeURIComponent(id)}`,
      siteName: "HNWI Chronicles",
      images: [
        {
          url: `${siteUrl}/share/development/${encodeURIComponent(id)}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/share/development/${encodeURIComponent(id)}/twitter-image`],
    },
  }
}

export default async function SharedDevelopmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const development = await getSharedDevelopment(id)

  if (!development) {
    notFound()
  }

  return <SharedDevelopmentClient development={development} developmentId={id} />
}
