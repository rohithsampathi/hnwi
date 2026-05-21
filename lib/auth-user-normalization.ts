type UserLike = Record<string, any> | null | undefined

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const KINGDOM_SYNTHETIC_ID_RE = /^kingdom-user-/i

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function idCandidates(user: UserLike): string[] {
  if (!user || typeof user !== "object") {
    return []
  }

  return [
    user.user_id,
    user.userId,
    user.auth_user_id,
    user.backend_user_id,
    user.uuid,
    user.profile?.user_id,
    user.profile?.userId,
    user.profile?.uuid,
    user.sub,
    user._id,
    user.id,
  ].map(cleanString).filter(Boolean)
}

export function isCanonicalUserId(value: unknown): value is string {
  return UUID_RE.test(cleanString(value))
}

export function isSyntheticKingdomUserId(value: unknown): boolean {
  return KINGDOM_SYNTHETIC_ID_RE.test(cleanString(value))
}

export function resolveCanonicalUserId(...sources: UserLike[]): string {
  const candidates = sources.flatMap(idCandidates)
  return (
    candidates.find(isCanonicalUserId) ||
    candidates.find((value) => !isSyntheticKingdomUserId(value)) ||
    ""
  )
}

export function resolveStoredUserId(...sources: UserLike[]): string {
  const canonicalId = resolveCanonicalUserId(...sources)
  if (canonicalId) {
    return canonicalId
  }

  return sources.flatMap(idCandidates).find(Boolean) || ""
}

export function isPlaceholderDisplayName(value: unknown): boolean {
  const normalized = cleanString(value).toLowerCase()
  return (
    !normalized ||
    normalized === "invalid" ||
    normalized === "codex invalid" ||
    (normalized.includes("codex") && normalized.includes("invalid"))
  )
}

export function isPlaceholderEmail(value: unknown): boolean {
  const normalized = cleanString(value).toLowerCase()
  return (
    !normalized ||
    normalized === "codex.invalid@example.com" ||
    normalized.startsWith("codex.invalid@") ||
    (normalized.includes("codex") && normalized.includes("invalid"))
  )
}

function deriveDisplayName(user: UserLike): string {
  if (!user || typeof user !== "object") {
    return ""
  }

  const directName = cleanString(user.name || user.full_name || user.fullName)
  if (!isPlaceholderDisplayName(directName)) {
    return directName
  }

  const firstName = cleanString(user.firstName || user.first_name)
  const lastName = cleanString(user.lastName || user.last_name)
  const composed = `${firstName} ${lastName}`.trim()
  if (!isPlaceholderDisplayName(composed)) {
    return composed
  }

  return ""
}

export function normalizeAuthUser<T extends Record<string, any>>(
  incoming: T | null | undefined,
  existing?: UserLike,
): T {
  const incomingUser = (incoming || {}) as T
  const normalizedUser = {
    ...(existing && typeof existing === "object" ? existing : {}),
    ...incomingUser,
  } as T
  const normalizedRecord = normalizedUser as Record<string, any>

  const existingProfile =
    existing?.profile && typeof existing.profile === "object" ? existing.profile : {}
  const incomingProfile =
    incomingUser.profile && typeof incomingUser.profile === "object" ? incomingUser.profile : {}
  if (Object.keys(existingProfile).length || Object.keys(incomingProfile).length) {
    normalizedRecord.profile = {
      ...existingProfile,
      ...incomingProfile,
    }
  }

  const normalizedId = resolveStoredUserId(incomingUser, existing)
  const syntheticId =
    isSyntheticKingdomUserId(incomingUser.id) ? cleanString(incomingUser.id) :
    isSyntheticKingdomUserId(incomingUser._id) ? cleanString(incomingUser._id) :
    isSyntheticKingdomUserId(existing?.id) ? cleanString(existing?.id) :
    ""

  if (normalizedId) {
    normalizedRecord.id = normalizedId
    normalizedRecord.user_id = normalizedId
    normalizedRecord.userId = normalizedId
  }

  if (syntheticId && syntheticId !== normalizedId) {
    normalizedRecord.kingdom_id = syntheticId
  }

  const incomingName = deriveDisplayName(incomingUser)
  const existingName = deriveDisplayName(existing)
  const resolvedName = incomingName || existingName
  if (resolvedName) {
    normalizedRecord.name = resolvedName
  } else if (isPlaceholderDisplayName(normalizedRecord.name)) {
    delete normalizedRecord.name
  }

  const incomingEmailCandidates = [
    incomingUser.email,
    incomingUser.profile?.email,
  ].map(cleanString).filter((value) => value && !isPlaceholderEmail(value))

  const existingEmailCandidates = [
    existing?.email,
    existing?.profile?.email,
  ].map(cleanString).filter((value) => value && !isPlaceholderEmail(value))

  const normalizedEmailCandidates = [
    normalizedRecord.email,
    normalizedRecord.profile?.email,
  ].map(cleanString).filter((value) => value && !isPlaceholderEmail(value))

  const resolvedEmail =
    incomingEmailCandidates[0] ||
    normalizedEmailCandidates[0] ||
    existingEmailCandidates[0]

  if (resolvedEmail) {
    normalizedRecord.email = resolvedEmail
  } else if (isPlaceholderEmail(normalizedRecord.email)) {
    delete normalizedRecord.email
  }

  return normalizedUser
}
