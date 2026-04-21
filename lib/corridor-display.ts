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

function normalizeToken(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return COUNTRY_ALIASES[trimmed] || trimmed;
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
      const mappedCity = PRIMARY_FINANCIAL_CITY_BY_COUNTRY[part];
      if (mappedCity) {
        return mappedCity;
      }

      return part;
    }
  }

  return "—";
}
