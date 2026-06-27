"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { Building2, CheckCircle2, Home, Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  SIYA_INTAKE_FORM_VERSION,
  type PublicIntakeReceipt,
  type SiyaIntakeKind,
} from "@/lib/siya-intake"
import { cn } from "@/lib/utils"

type UTMParams = Record<string, string>

type BuyerFormState = {
  fullName: string
  phone: string
  email: string
  whatsappOptIn: boolean
  budgetMin: string
  budgetMax: string
  budgetBand: string
  preferredLocations: string
  propertyType: string
  bhkOrUnitSize: string
  purpose: string
  mustHaves: string
  timeline: string
  financeReadiness: string
  notes: string
}

type DeveloperFormState = {
  developerName: string
  contactName: string
  phone: string
  email: string
  whatsappOptIn: boolean
  projectName: string
  location: string
  propertyType: string
  priceMin: string
  priceMax: string
  unitMix: string
  sizeRange: string
  possessionOrAvailability: string
  amenities: string
  usp: string
  mediaLinks: string
  proofDocs: string
  commissionTerms: string
  notes: string
}

type PublicIntakeFormProps = {
  kind: SiyaIntakeKind
  initialUtm?: UTMParams
}

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; receipt: PublicIntakeReceipt }
  | { status: "error"; message: string }

const buyerInitialState: BuyerFormState = {
  fullName: "",
  phone: "",
  email: "",
  whatsappOptIn: false,
  budgetMin: "",
  budgetMax: "",
  budgetBand: "",
  preferredLocations: "",
  propertyType: "",
  bhkOrUnitSize: "",
  purpose: "",
  mustHaves: "",
  timeline: "",
  financeReadiness: "",
  notes: "",
}

const developerInitialState: DeveloperFormState = {
  developerName: "",
  contactName: "",
  phone: "",
  email: "",
  whatsappOptIn: false,
  projectName: "",
  location: "",
  propertyType: "",
  priceMin: "",
  priceMax: "",
  unitMix: "",
  sizeRange: "",
  possessionOrAvailability: "",
  amenities: "",
  usp: "",
  mediaLinks: "",
  proofDocs: "",
  commissionTerms: "",
  notes: "",
}

const propertyTypeOptions = [
  "Apartment",
  "Villa",
  "Plot",
  "Farmhouse",
  "Commercial",
  "Mixed use",
  "Other",
]

const purposeOptions = [
  "Own use",
  "Investment",
  "Rental yield",
  "Family home",
  "Portfolio diversification",
  "Other",
]

const timelineOptions = [
  "Immediate",
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Exploring",
]

const financeReadinessOptions = [
  "Cash ready",
  "Pre-approved finance",
  "Bank discussion underway",
  "Dependent on sale of existing asset",
  "Exploring finance",
  "Prefer not to say",
]

const availabilityOptions = [
  "Ready now",
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "Under construction",
  "Launch pipeline",
]

const splitList = (value: string) =>
  value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)

const optionalNumber = (value: string) => {
  const cleaned = value.trim().replace(/,/g, "")
  return cleaned ? Number(cleaned) : undefined
}

function SelectField({
  label,
  name,
  value,
  options,
  required,
  onChange,
}: {
  label: string
  name: string
  value: string
  options: string[]
  required?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <select
        name={name}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  name,
  value,
  required,
  type = "text",
  placeholder,
  autoComplete,
  onChange,
}: {
  label: string
  name: string
  value: string
  required?: boolean
  type?: string
  placeholder?: string
  autoComplete?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <Input
        name={name}
        value={value}
        required={required}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 shadow-none focus-visible:ring-zinc-300"
      />
    </label>
  )
}

function TextAreaField({
  label,
  name,
  value,
  required,
  placeholder,
  rows = 4,
  onChange,
}: {
  label: string
  name: string
  value: string
  required?: boolean
  placeholder?: string
  rows?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <Textarea
        name={name}
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border-zinc-200 bg-white text-sm text-zinc-900 focus-visible:ring-zinc-300"
      />
    </label>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PublicSiyaIntakeForm({ kind, initialUtm = {} }: PublicIntakeFormProps) {
  const [buyerForm, setBuyerForm] = useState<BuyerFormState>(buyerInitialState)
  const [developerForm, setDeveloperForm] = useState<DeveloperFormState>(developerInitialState)
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" })

  const isBuyer = kind === "buyer"
  const content = useMemo(() => {
    if (isBuyer) {
      return {
        icon: Home,
        label: "Buyer Intake",
        heading: "Tell us what you are looking to buy",
        description:
          "This intake creates a private requirement signal for the Siya Prive team. Matches are reviewed internally before any follow-up.",
        endpoint: "/api/siya/intake/buyer",
        source: "siya_prive_public_buyer_intake",
        alternateHref: "/developers",
        alternateLabel: "Submit a developer or listing intake",
      }
    }
    return {
      icon: Building2,
      label: "Developer Intake",
      heading: "Submit a project or listing for review",
      description:
        "This intake creates a submitted inventory signal. Buyer demand and proposed matches stay private until the team reviews them.",
      endpoint: "/api/siya/intake/developer",
      source: "siya_prive_public_developer_intake",
      alternateHref: "/buyers",
      alternateLabel: "Submit a buyer requirement",
    }
  }, [isBuyer])

  const Icon = content.icon
  const isSubmitting = submission.status === "submitting"

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmission({ status: "submitting" })

    const payload = isBuyer
      ? {
          ...buyerForm,
          budgetMin: optionalNumber(buyerForm.budgetMin),
          budgetMax: optionalNumber(buyerForm.budgetMax),
          preferredLocations: splitList(buyerForm.preferredLocations),
          mustHaves: splitList(buyerForm.mustHaves),
          source: content.source,
          utm: initialUtm,
          formVersion: SIYA_INTAKE_FORM_VERSION,
        }
      : {
          ...developerForm,
          priceMin: optionalNumber(developerForm.priceMin),
          priceMax: optionalNumber(developerForm.priceMax),
          unitMix: splitList(developerForm.unitMix),
          amenities: splitList(developerForm.amenities),
          mediaLinks: splitList(developerForm.mediaLinks),
          proofDocs: splitList(developerForm.proofDocs),
          source: content.source,
          utm: initialUtm,
          formVersion: SIYA_INTAKE_FORM_VERSION,
        }

    try {
      const response = await fetch(content.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setSubmission({
          status: "error",
          message: typeof data.message === "string"
            ? data.message
            : "Please check the required fields and submit again.",
        })
        return
      }
      setSubmission({
        status: "success",
        receipt: {
          receiptId: typeof data.receiptId === "string" ? data.receiptId : "",
          status: typeof data.status === "string" ? data.status : "received",
          message:
            typeof data.message === "string"
              ? data.message
              : "Thank you. Our team will review this intake and follow up if it is a fit.",
        },
      })
    } catch {
      setSubmission({
        status: "error",
        message: "We could not submit this intake right now. Please try again shortly.",
      })
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-zinc-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Siya Prive
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {content.heading}
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              {content.description}
            </p>
            <div className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm text-zinc-600">
              <p>Public submissions only create private review signals.</p>
              <p>No buyer demand, developer inventory, or proposed match is exposed on this page.</p>
              <a
                href={content.alternateHref}
                className="inline-flex text-sm font-semibold text-zinc-950 underline-offset-4 hover:underline"
              >
                {content.alternateLabel}
              </a>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="space-y-4" noValidate={false}>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {content.label}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Required fields are used only for team review and internal qualification.
                </p>
              </div>
              <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-500">
                {SIYA_INTAKE_FORM_VERSION}
              </span>
            </div>
          </div>

          {isBuyer ? (
            <>
              <Section title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Full name"
                    name="fullName"
                    value={buyerForm.fullName}
                    required
                    autoComplete="name"
                    onChange={(fullName) => setBuyerForm((current) => ({ ...current, fullName }))}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={buyerForm.phone}
                    required
                    autoComplete="tel"
                    onChange={(phone) => setBuyerForm((current) => ({ ...current, phone }))}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={buyerForm.email}
                    required
                    type="email"
                    autoComplete="email"
                    onChange={(email) => setBuyerForm((current) => ({ ...current, email }))}
                  />
                  <label className="flex min-h-11 items-center gap-3 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={buyerForm.whatsappOptIn}
                      onChange={(event) =>
                        setBuyerForm((current) => ({ ...current, whatsappOptIn: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    WhatsApp opt-in for team follow-up
                  </label>
                </div>
              </Section>

              <Section title="Requirement">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Budget min"
                    name="budgetMin"
                    value={buyerForm.budgetMin}
                    type="number"
                    placeholder="Optional"
                    onChange={(budgetMin) => setBuyerForm((current) => ({ ...current, budgetMin }))}
                  />
                  <TextField
                    label="Budget max"
                    name="budgetMax"
                    value={buyerForm.budgetMax}
                    type="number"
                    placeholder="Optional"
                    onChange={(budgetMax) => setBuyerForm((current) => ({ ...current, budgetMax }))}
                  />
                  <TextField
                    label="Budget band"
                    name="budgetBand"
                    value={buyerForm.budgetBand}
                    required
                    placeholder="Example: 5-10 Cr, $2M-$5M"
                    onChange={(budgetBand) => setBuyerForm((current) => ({ ...current, budgetBand }))}
                  />
                  <SelectField
                    label="Property type"
                    name="propertyType"
                    value={buyerForm.propertyType}
                    required
                    options={propertyTypeOptions}
                    onChange={(propertyType) => setBuyerForm((current) => ({ ...current, propertyType }))}
                  />
                  <TextField
                    label="BHK or unit size"
                    name="bhkOrUnitSize"
                    value={buyerForm.bhkOrUnitSize}
                    placeholder="Example: 4 BHK, 4,000 sq ft"
                    onChange={(bhkOrUnitSize) => setBuyerForm((current) => ({ ...current, bhkOrUnitSize }))}
                  />
                  <SelectField
                    label="Purpose"
                    name="purpose"
                    value={buyerForm.purpose}
                    required
                    options={purposeOptions}
                    onChange={(purpose) => setBuyerForm((current) => ({ ...current, purpose }))}
                  />
                  <SelectField
                    label="Timeline"
                    name="timeline"
                    value={buyerForm.timeline}
                    required
                    options={timelineOptions}
                    onChange={(timeline) => setBuyerForm((current) => ({ ...current, timeline }))}
                  />
                  <SelectField
                    label="Finance readiness"
                    name="financeReadiness"
                    value={buyerForm.financeReadiness}
                    options={financeReadinessOptions}
                    onChange={(financeReadiness) =>
                      setBuyerForm((current) => ({ ...current, financeReadiness }))
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4">
                  <TextAreaField
                    label="Preferred locations"
                    name="preferredLocations"
                    value={buyerForm.preferredLocations}
                    required
                    placeholder="One per line or comma separated"
                    onChange={(preferredLocations) =>
                      setBuyerForm((current) => ({ ...current, preferredLocations }))
                    }
                  />
                  <TextAreaField
                    label="Must haves"
                    name="mustHaves"
                    value={buyerForm.mustHaves}
                    placeholder="Views, school access, privacy, yield, floor preference"
                    onChange={(mustHaves) => setBuyerForm((current) => ({ ...current, mustHaves }))}
                  />
                  <TextAreaField
                    label="Notes"
                    name="notes"
                    value={buyerForm.notes}
                    placeholder="Any context the review team should know"
                    onChange={(notes) => setBuyerForm((current) => ({ ...current, notes }))}
                  />
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section title="Developer and contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Developer name"
                    name="developerName"
                    value={developerForm.developerName}
                    required
                    onChange={(developerName) => setDeveloperForm((current) => ({ ...current, developerName }))}
                  />
                  <TextField
                    label="Contact name"
                    name="contactName"
                    value={developerForm.contactName}
                    required
                    autoComplete="name"
                    onChange={(contactName) => setDeveloperForm((current) => ({ ...current, contactName }))}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={developerForm.phone}
                    required
                    autoComplete="tel"
                    onChange={(phone) => setDeveloperForm((current) => ({ ...current, phone }))}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={developerForm.email}
                    required
                    type="email"
                    autoComplete="email"
                    onChange={(email) => setDeveloperForm((current) => ({ ...current, email }))}
                  />
                  <label className="flex min-h-11 items-center gap-3 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={developerForm.whatsappOptIn}
                      onChange={(event) =>
                        setDeveloperForm((current) => ({ ...current, whatsappOptIn: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    WhatsApp opt-in for team follow-up
                  </label>
                </div>
              </Section>

              <Section title="Project or listing">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Project name"
                    name="projectName"
                    value={developerForm.projectName}
                    required
                    onChange={(projectName) => setDeveloperForm((current) => ({ ...current, projectName }))}
                  />
                  <TextField
                    label="Location"
                    name="location"
                    value={developerForm.location}
                    required
                    onChange={(location) => setDeveloperForm((current) => ({ ...current, location }))}
                  />
                  <SelectField
                    label="Property type"
                    name="propertyType"
                    value={developerForm.propertyType}
                    required
                    options={propertyTypeOptions}
                    onChange={(propertyType) => setDeveloperForm((current) => ({ ...current, propertyType }))}
                  />
                  <SelectField
                    label="Possession or availability"
                    name="possessionOrAvailability"
                    value={developerForm.possessionOrAvailability}
                    required
                    options={availabilityOptions}
                    onChange={(possessionOrAvailability) =>
                      setDeveloperForm((current) => ({ ...current, possessionOrAvailability }))
                    }
                  />
                  <TextField
                    label="Price min"
                    name="priceMin"
                    value={developerForm.priceMin}
                    type="number"
                    placeholder="Optional"
                    onChange={(priceMin) => setDeveloperForm((current) => ({ ...current, priceMin }))}
                  />
                  <TextField
                    label="Price max"
                    name="priceMax"
                    value={developerForm.priceMax}
                    type="number"
                    placeholder="Optional"
                    onChange={(priceMax) => setDeveloperForm((current) => ({ ...current, priceMax }))}
                  />
                  <TextField
                    label="Size range"
                    name="sizeRange"
                    value={developerForm.sizeRange}
                    placeholder="Example: 2,500-7,000 sq ft"
                    onChange={(sizeRange) => setDeveloperForm((current) => ({ ...current, sizeRange }))}
                  />
                  <TextField
                    label="Commission terms"
                    name="commissionTerms"
                    value={developerForm.commissionTerms}
                    placeholder="Optional"
                    onChange={(commissionTerms) =>
                      setDeveloperForm((current) => ({ ...current, commissionTerms }))
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4">
                  <TextAreaField
                    label="Unit mix"
                    name="unitMix"
                    value={developerForm.unitMix}
                    placeholder="One per line or comma separated"
                    onChange={(unitMix) => setDeveloperForm((current) => ({ ...current, unitMix }))}
                  />
                  <TextAreaField
                    label="Amenities"
                    name="amenities"
                    value={developerForm.amenities}
                    placeholder="Clubhouse, concierge, private lift, marina access"
                    onChange={(amenities) => setDeveloperForm((current) => ({ ...current, amenities }))}
                  />
                  <TextAreaField
                    label="USP"
                    name="usp"
                    value={developerForm.usp}
                    placeholder="What makes this inventory worth review?"
                    onChange={(usp) => setDeveloperForm((current) => ({ ...current, usp }))}
                  />
                  <TextAreaField
                    label="Media links"
                    name="mediaLinks"
                    value={developerForm.mediaLinks}
                    placeholder="Brochure, drive links, landing pages"
                    onChange={(mediaLinks) => setDeveloperForm((current) => ({ ...current, mediaLinks }))}
                  />
                  <TextAreaField
                    label="Proof docs"
                    name="proofDocs"
                    value={developerForm.proofDocs}
                    placeholder="Approvals, title, RERA, inventory proof links"
                    onChange={(proofDocs) => setDeveloperForm((current) => ({ ...current, proofDocs }))}
                  />
                  <TextAreaField
                    label="Notes"
                    name="notes"
                    value={developerForm.notes}
                    placeholder="Any review context, constraints, or priority windows"
                    onChange={(notes) => setDeveloperForm((current) => ({ ...current, notes }))}
                  />
                </div>
              </Section>
            </>
          )}

          <div
            className={cn(
              "rounded-lg border p-4 text-sm",
              submission.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : submission.status === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-950"
                  : "border-zinc-200 bg-white text-zinc-600",
            )}
          >
            {submission.status === "success" ? (
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold">Receipt ID: {submission.receipt.receiptId || "pending"}</p>
                  <p>Status: {submission.receipt.status}</p>
                  <p>{submission.receipt.message}</p>
                </div>
              </div>
            ) : submission.status === "error" ? (
              <p>{submission.message}</p>
            ) : (
              <p>
                Submission creates a private Siya Prive review packet. Automated WhatsApp messages are not sent from this form.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-lg bg-zinc-950 text-white hover:bg-zinc-800"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {isSubmitting ? "Submitting" : "Submit for team review"}
          </Button>
        </form>
      </div>
    </main>
  )
}
