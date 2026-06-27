import type { Metadata } from "next"

import { PublicSiyaIntakeForm } from "@/components/siya-intake/public-intake-form"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
  title: "Buyer Intake | Siya Prive",
  description: "Submit a private property requirement for Siya Prive team review.",
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "source",
]

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function collectUtm(searchParams: Record<string, string | string[] | undefined> | undefined) {
  return Object.fromEntries(
    UTM_KEYS
      .map((key) => [key, firstValue(searchParams?.[key])?.trim()] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  )
}

export default async function BuyersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams

  return <PublicSiyaIntakeForm kind="buyer" initialUtm={collectUtm(resolvedSearchParams)} />
}
