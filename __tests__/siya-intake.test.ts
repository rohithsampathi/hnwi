jest.mock("@/config/api", () => ({
  API_BASE_URL: "https://kingdom-core.montaigne.co",
}))

import { handleSiyaIntakeRequest } from "@/lib/server/siya-intake-api"
import {
  SIYA_INTAKE_FORM_VERSION,
  buyerIntakeSchema,
  developerIntakeSchema,
  sanitizeLakshyaIntakeResponse,
} from "@/lib/siya-intake"

const validBuyerPayload = {
  fullName: "Buyer Name",
  phone: "+919999999999",
  email: "buyer@example.com",
  whatsappOptIn: true,
  budgetMin: 50000000,
  budgetMax: 100000000,
  budgetBand: "5-10 Cr",
  preferredLocations: ["Mumbai", "Dubai"],
  propertyType: "Apartment",
  bhkOrUnitSize: "4 BHK",
  purpose: "Family home",
  mustHaves: ["Privacy", "Good school access"],
  timeline: "0-3 months",
  financeReadiness: "Cash ready",
  notes: "Private review only.",
  source: "siya_prive_public_buyer_intake",
  utm: { utm_source: "principal-note" },
  formVersion: SIYA_INTAKE_FORM_VERSION,
}

const validDeveloperPayload = {
  developerName: "Developer Group",
  contactName: "Listing Contact",
  phone: "+919888888888",
  email: "developer@example.com",
  whatsappOptIn: false,
  projectName: "Private Residences",
  location: "Mumbai",
  propertyType: "Villa",
  priceMin: 70000000,
  priceMax: 120000000,
  unitMix: ["4 BHK", "Penthouse"],
  sizeRange: "3,000-6,000 sq ft",
  possessionOrAvailability: "Ready now",
  amenities: ["Concierge", "Private lift"],
  usp: "Limited inventory.",
  mediaLinks: ["https://example.com/brochure"],
  proofDocs: ["RERA approved"],
  commissionTerms: "Team review only.",
  notes: "Submitted inventory signal.",
  source: "siya_prive_public_developer_intake",
  utm: {},
  formVersion: SIYA_INTAKE_FORM_VERSION,
}

function requestWithBody(body: unknown) {
  return {
    json: async () => body,
    headers: {
      get: () => null,
    },
  } as any
}

const originalFetch = global.fetch
const originalKingdomPrivateToken = process.env.KINGDOM_PRIVATE_API_TOKEN

describe("Siya Prive public intake contract", () => {
  beforeEach(() => {
    process.env.KINGDOM_PRIVATE_API_TOKEN = "test-private-token"
  })

  afterEach(() => {
    jest.restoreAllMocks()
    if (originalKingdomPrivateToken === undefined) {
      delete process.env.KINGDOM_PRIVATE_API_TOKEN
    } else {
      process.env.KINGDOM_PRIVATE_API_TOKEN = originalKingdomPrivateToken
    }
    if (originalFetch) {
      global.fetch = originalFetch
    } else {
      delete (global as typeof globalThis & { fetch?: typeof fetch }).fetch
    }
  })

  it("accepts the public buyer payload and rejects inverted budgets", () => {
    expect(buyerIntakeSchema.safeParse(validBuyerPayload).success).toBe(true)

    const parsed = buyerIntakeSchema.safeParse({
      ...validBuyerPayload,
      budgetMin: 100000000,
      budgetMax: 50000000,
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.budgetMax?.[0]).toContain("Maximum budget")
    }
  })

  it("accepts the public developer payload and rejects inverted prices", () => {
    expect(developerIntakeSchema.safeParse(validDeveloperPayload).success).toBe(true)

    const parsed = developerIntakeSchema.safeParse({
      ...validDeveloperPayload,
      priceMin: 120000000,
      priceMax: 70000000,
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.priceMax?.[0]).toContain("Maximum price")
    }
  })

  it("sanitizes backend match data out of public receipts", () => {
    const receipt = sanitizeLakshyaIntakeResponse({
      receiptId: "lakshya_rcpt_123",
      status: "accepted",
      proposed_matches: [{ listingId: "private-listing" }],
      matched_buyers: [{ email: "buyer@example.com" }],
    })

    expect(receipt).toEqual({
      receiptId: "lakshya_rcpt_123",
      status: "accepted",
      message: "Thank you. Our team will review this intake and follow up if it is a fit.",
    })
    expect(receipt).not.toHaveProperty("proposed_matches")
    expect(receipt).not.toHaveProperty("matched_buyers")
  })

  it("forwards buyer intake to the Lakshya backend and returns only the public receipt", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        receipt_id: "buyer_receipt_1",
        status: "queued",
        proposed_matches: [{ projectName: "Do not expose" }],
      }),
    } as Response)
    global.fetch = fetchMock

    const response = await handleSiyaIntakeRequest("buyer", requestWithBody(validBuyerPayload))
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(
      "https://kingdom-core.montaigne.co/v1/kingdom/lakshya/intake/buyer",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(validBuyerPayload),
        headers: expect.objectContaining({
          authorization: "Bearer test-private-token",
        }),
      }),
    )
    expect(body).toEqual({
      receiptId: "buyer_receipt_1",
      status: "queued",
      message: "Thank you. Our team will review this intake and follow up if it is a fit.",
    })
  })
})
