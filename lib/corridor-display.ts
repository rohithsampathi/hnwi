const PRIMARY_FINANCIAL_CITY_BY_COUNTRY: Record<string, string> = {
  "United States": "New York",
  "USA": "New York",
  "US": "New York",
  "United Arab Emirates": "Dubai",
  "UAE": "Dubai",
  "ARE": "Dubai",
  "United Kingdom": "London",
  "UK": "London",
  "GBR": "London",
  "Great Britain": "London",
  "India": "Mumbai",
  "Portugal": "Lisbon",
  "Switzerland": "Zurich",
  "Singapore": "Singapore",
  "France": "Paris",
  "Germany": "Frankfurt",
  "Italy": "Milan",
  "Netherlands": "Amsterdam",
  "Spain": "Madrid",
  "Japan": "Tokyo",
  "Australia": "Sydney",
  "Canada": "Toronto",
  "China": "Shanghai",
  "South Korea": "Seoul",
  "Brazil": "Sao Paulo",
  "Thailand": "Bangkok",
  "Malaysia": "Kuala Lumpur",
  "Greece": "Athens",
  "Malta": "Valletta",
  "Cyprus": "Nicosia",
  "Ireland": "Dublin",
  "South Africa": "Johannesburg",
  "Mauritius": "Port Louis",
  "New Zealand": "Auckland",
  "Mexico": "Mexico City",
  "Bahamas": "Nassau",
  "Cayman Islands": "George Town",
  "Panama": "Panama City",
};

const COUNTRY_ALIASES: Record<string, string> = {
  USA: "United States",
  US: "United States",
  UAE: "United Arab Emirates",
  ARE: "United Arab Emirates",
  UK: "United Kingdom",
  GBR: "United Kingdom",
};

const CORRIDOR_NODE_ALIASES: Record<string, string> = {
  "New York City": "New York",
  NYC: "New York",
  "San Francisco Bay Area": "San Francisco",
  "SF": "San Francisco",
  "SFO": "San Francisco",
  DXB: "Dubai",
  "Dubai UAE": "Dubai",
  "Dubai, UAE": "Dubai",
  "Sundar Nagar": "Sunder Nagar",
  "Sunder": "Sunder Nagar",
  "Delhi Sunder Nagar": "Sunder Nagar",
};

const CORRIDOR_DISPLAY_CODES: Record<string, string> = {
  // India
  Hyderabad: "HYD",
  Mumbai: "BOM",
  Delhi: "DEL",
  "New Delhi": "DEL",
  "Sunder Nagar": "DEL",
  Sadashivpet: "SDP",
  Bangalore: "BLR",
  Chennai: "MAA",
  Kolkata: "CCU",
  Pune: "PNQ",
  Ahmedabad: "AMD",
  Yavatmal: "YML",

  // Europe
  Lisbon: "LIS",
  Porto: "OPO",
  London: "LON",
  Zurich: "ZRH",
  Geneva: "GVA",
  Paris: "PAR",
  Berlin: "BER",
  Frankfurt: "FRA",
  Munich: "MUC",
  Milan: "MIL",
  Rome: "ROM",
  Amsterdam: "AMS",
  Madrid: "MAD",
  Barcelona: "BCN",
  Dublin: "DUB",
  Athens: "ATH",
  Vienna: "VIE",
  Monaco: "MCM",
  Luxembourg: "LUX",
  Valletta: "MLA",
  Nicosia: "NIC",

  // Middle East
  Dubai: "DXB",
  "Abu Dhabi": "AUH",
  Riyadh: "RUH",
  Doha: "DOH",
  Bahrain: "BAH",

  // Asia-Pacific
  Singapore: "SG",
  "Hong Kong": "HKG",
  Tokyo: "TYO",
  Sydney: "SYD",
  Melbourne: "MEL",
  Auckland: "AKL",
  Bangkok: "BKK",
  "Kuala Lumpur": "KUL",
  Shanghai: "SHA",
  Beijing: "PEK",
  Seoul: "SEL",
  Taipei: "TPE",

  // Americas
  "New York": "NYC",
  Miami: "MIA",
  "San Francisco": "SF",
  "Los Angeles": "LAX",
  Dallas: "DAL",
  Houston: "HOU",
  Texas: "TX",
  California: "CA",
  Toronto: "YYZ",
  Vancouver: "YVR",
  "Panama City": "PTY",
  Nassau: "NAS",
  "George Town": "GCM",
  "Sao Paulo": "GRU",

  // Africa
  "Port Louis": "MRU",
  "Cape Town": "CPT",
  Johannesburg: "JNB",
};

const CORRIDOR_DISPLAY_CODE_VALUES = new Set(Object.values(CORRIDOR_DISPLAY_CODES));

function lookupCaseInsensitive<T>(record: Record<string, T>, raw: string): T | undefined {
  if (Object.prototype.hasOwnProperty.call(record, raw)) {
    return record[raw];
  }

  const lower = raw.toLowerCase();
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === lower);
  return key ? record[key] : undefined;
}

function normalizeToken(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return lookupCaseInsensitive(COUNTRY_ALIASES, trimmed) || trimmed;
}

function candidateParts(raw?: string | null): string[] {
  const normalized = normalizeToken(raw);
  if (!normalized) return [];

  return normalized
    .split(/[,/|→>-]+/)
    .map((part) => normalizeToken(part))
    .filter((part): part is string => Boolean(part));
}

export function resolveCorridorNodeName(...rawValues: Array<string | undefined | null>): string {
  for (const raw of rawValues) {
    const parts = candidateParts(raw);

    for (const part of parts) {
      const nodeAlias = lookupCaseInsensitive(CORRIDOR_NODE_ALIASES, part);
      if (nodeAlias) {
        return nodeAlias;
      }

      const mappedCity = lookupCaseInsensitive(PRIMARY_FINANCIAL_CITY_BY_COUNTRY, part);
      if (mappedCity) {
        return mappedCity;
      }

      const embeddedNode = findEmbeddedCorridorNode(part);
      if (embeddedNode) {
        return embeddedNode;
      }

      return part;
    }
  }

  return "—";
}

function findEmbeddedCorridorNode(raw: string): string | undefined {
  const embeddedKeys = [
    ...Object.keys(CORRIDOR_NODE_ALIASES),
    ...Object.keys(CORRIDOR_DISPLAY_CODES),
    ...Object.keys(PRIMARY_FINANCIAL_CITY_BY_COUNTRY),
  ].sort((a, b) => b.length - a.length);
  const lower = raw.toLowerCase();

  for (const key of embeddedKeys) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(key.toLowerCase())}([^a-z0-9]|$)`);
    if (!pattern.test(lower)) continue;

    const nodeAlias = lookupCaseInsensitive(CORRIDOR_NODE_ALIASES, key);
    if (nodeAlias) return nodeAlias;

    const countryCity = lookupCaseInsensitive(PRIMARY_FINANCIAL_CITY_BY_COUNTRY, key);
    if (countryCity) return countryCity;

    return key;
  }

  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fallbackDisplayCode(raw: string): string {
  const cleaned = raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "UNK";

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length > 1) {
    return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
  }

  return cleaned.slice(0, 3).toUpperCase();
}

function codeForCandidate(candidate?: string | null): string | undefined {
  const normalized = normalizeToken(candidate);
  if (!normalized) return undefined;

  const upper = normalized.toUpperCase();
  if (CORRIDOR_DISPLAY_CODE_VALUES.has(upper)) {
    return upper;
  }

  const nodeAlias = lookupCaseInsensitive(CORRIDOR_NODE_ALIASES, normalized);
  if (nodeAlias) {
    return codeForCandidate(nodeAlias);
  }

  const countryCity = lookupCaseInsensitive(PRIMARY_FINANCIAL_CITY_BY_COUNTRY, normalized);
  if (countryCity) {
    return codeForCandidate(countryCity);
  }

  return lookupCaseInsensitive(CORRIDOR_DISPLAY_CODES, normalized);
}

export function getCorridorDisplayCode(raw?: string | null): string {
  const normalized = normalizeToken(raw);
  if (!normalized) return "UNK";

  const directCode = codeForCandidate(normalized);
  if (directCode) return directCode;

  for (const part of candidateParts(normalized)) {
    const partCode = codeForCandidate(part);
    if (partCode) return partCode;
  }

  const embeddedKeys = [
    ...Object.keys(CORRIDOR_NODE_ALIASES),
    ...Object.keys(CORRIDOR_DISPLAY_CODES),
    ...Object.keys(PRIMARY_FINANCIAL_CITY_BY_COUNTRY),
  ].sort((a, b) => b.length - a.length);
  const lower = normalized.toLowerCase();

  for (const key of embeddedKeys) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(key.toLowerCase())}([^a-z0-9]|$)`);
    if (pattern.test(lower)) {
      const embeddedCode = codeForCandidate(key);
      if (embeddedCode) return embeddedCode;
    }
  }

  return fallbackDisplayCode(normalized);
}

export function formatCorridorRouteTag(source?: string | null, destination?: string | null): string {
  return `${getCorridorDisplayCode(source)} → ${getCorridorDisplayCode(destination)}`;
}
