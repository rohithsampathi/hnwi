import { z } from "zod"

export const SIYA_INTAKE_FORM_VERSION = "siya_public_intake_v1"

const blankToUndefined = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  if (typeof value === "string" && value.trim() === "") return undefined
  return value
}

const optionalText = z.preprocess(
  blankToUndefined,
  z.string().trim().max(3000).optional(),
)

const requiredText = (label: string, max = 600) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`).max(max)

const optionalNumber = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative().optional(),
)

const textList = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  return []
}, z.array(z.string().trim().min(1)).default([]))

const utmSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key.trim(), String(entry ?? "").trim()])
      .filter(([key, entry]) => key && entry),
  )
}, z.record(z.string()).default({}))

const emailSchema = requiredText("Email", 254).email("Enter a valid email address")
const phoneSchema = requiredText("Phone", 40).min(7, "Enter a valid phone number")

export const buyerIntakeSchema = z.object({
  fullName: requiredText("Full name", 180),
  phone: phoneSchema,
  email: emailSchema,
  whatsappOptIn: z.boolean().default(false),
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  budgetBand: requiredText("Budget band", 120),
  preferredLocations: textList.refine((entries) => entries.length > 0, "Add at least one preferred location"),
  propertyType: requiredText("Property type", 120),
  bhkOrUnitSize: optionalText,
  purpose: requiredText("Purpose", 160),
  mustHaves: textList,
  timeline: requiredText("Timeline", 160),
  financeReadiness: optionalText,
  notes: optionalText,
  source: requiredText("Source", 160),
  utm: utmSchema,
  formVersion: z.literal(SIYA_INTAKE_FORM_VERSION),
}).superRefine((value, ctx) => {
  if (value.budgetMin !== undefined && value.budgetMax !== undefined && value.budgetMin > value.budgetMax) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetMax"],
      message: "Maximum budget must be greater than minimum budget",
    })
  }
})

export const developerIntakeSchema = z.object({
  developerName: requiredText("Developer name", 220),
  contactName: requiredText("Contact name", 180),
  phone: phoneSchema,
  email: emailSchema,
  whatsappOptIn: z.boolean().default(false),
  projectName: requiredText("Project name", 220),
  location: requiredText("Location", 220),
  propertyType: requiredText("Property type", 120),
  priceMin: optionalNumber,
  priceMax: optionalNumber,
  unitMix: textList,
  sizeRange: optionalText,
  possessionOrAvailability: requiredText("Possession or availability", 180),
  amenities: textList,
  usp: optionalText,
  mediaLinks: textList,
  proofDocs: textList,
  commissionTerms: optionalText,
  notes: optionalText,
  source: requiredText("Source", 160),
  utm: utmSchema,
  formVersion: z.literal(SIYA_INTAKE_FORM_VERSION),
}).superRefine((value, ctx) => {
  if (value.priceMin !== undefined && value.priceMax !== undefined && value.priceMin > value.priceMax) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceMax"],
      message: "Maximum price must be greater than minimum price",
    })
  }
})

export type BuyerIntakePayload = z.infer<typeof buyerIntakeSchema>
export type DeveloperIntakePayload = z.infer<typeof developerIntakeSchema>
export type SiyaIntakeKind = "buyer" | "developer"

export type PublicIntakeReceipt = {
  receiptId: string
  status: string
  message: string
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function sanitizeLakshyaIntakeResponse(value: unknown): PublicIntakeReceipt {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const receiptId =
    cleanText(record.receiptId) ||
    cleanText(record.receipt_id) ||
    cleanText(record.intakeRunId) ||
    cleanText(record.intake_run_id) ||
    cleanText(record.runId) ||
    cleanText(record.id)
  const rawStatus = cleanText(record.status).toLowerCase()
  const status = ["received", "submitted", "queued", "accepted", "ok"].includes(rawStatus)
    ? rawStatus
    : "received"

  return {
    receiptId,
    status,
    message: "Thank you. Our team will review this intake and follow up if it is a fit.",
  }
}
