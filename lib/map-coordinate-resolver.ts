type Coordinate = {
  latitude: number
  longitude: number
  label: string
  precision: "locality" | "region" | "country"
}

type CoordinateAlias = Coordinate & {
  aliases: string[]
}

export type OpportunityCoordinateInput = {
  title?: string | null
  location?: string | null
  country?: string | null
  city?: string | null
  state?: string | null
  region?: string | null
  address?: string | null
  category?: string | null
  industry?: string | null
  product?: string | null
  analysis?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
}

export type ResolvedMapCoordinate = Coordinate & {
  source: "resolved" | "backend"
}

const COORDINATE_ALIASES: CoordinateAlias[] = [
  { label: "Sadashivpet", latitude: 17.6164, longitude: 78.0766, precision: "locality", aliases: ["sadashivpet", "sadasivpet"] },
  { label: "Hyderabad", latitude: 17.3850, longitude: 78.4867, precision: "locality", aliases: ["hyderabad", "hyd", "telangana"] },
  { label: "Gurugram", latitude: 28.4595, longitude: 77.0266, precision: "locality", aliases: ["gurugram", "gurgaon"] },
  { label: "Dwarka Expressway", latitude: 28.4944, longitude: 77.0350, precision: "locality", aliases: ["dwarka expressway", "dwarka expressway gurugram", "dwarka expressway gurgaon"] },
  { label: "Delhi NCR", latitude: 28.4595, longitude: 77.0266, precision: "region", aliases: ["delhi ncr", "ncr", "national capital region"] },
  { label: "New Delhi", latitude: 28.6139, longitude: 77.2090, precision: "locality", aliases: ["new delhi", "delhi", "sunder nagar"] },
  { label: "Mumbai", latitude: 19.0760, longitude: 72.8777, precision: "locality", aliases: ["mumbai", "bombay", "maharashtra"] },
  { label: "Bengaluru", latitude: 12.9716, longitude: 77.5946, precision: "locality", aliases: ["bengaluru", "bangalore", "blr", "karnataka"] },
  { label: "Chennai", latitude: 13.0827, longitude: 80.2707, precision: "locality", aliases: ["chennai", "madras", "tamil nadu"] },
  { label: "Pune", latitude: 18.5204, longitude: 73.8567, precision: "locality", aliases: ["pune"] },
  { label: "Kolkata", latitude: 22.5726, longitude: 88.3639, precision: "locality", aliases: ["kolkata", "calcutta", "west bengal"] },
  { label: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, precision: "locality", aliases: ["ahmedabad", "gujarat"] },
  { label: "Noida", latitude: 28.5355, longitude: 77.3910, precision: "locality", aliases: ["noida", "greater noida"] },
  { label: "Goa", latitude: 15.4909, longitude: 73.8278, precision: "region", aliases: ["goa", "panaji"] },
  { label: "Jaipur", latitude: 26.9124, longitude: 75.7873, precision: "locality", aliases: ["jaipur", "rajasthan"] },
  { label: "Kochi", latitude: 9.9312, longitude: 76.2673, precision: "locality", aliases: ["kochi", "cochin", "kerala"] },
  { label: "Yavatmal", latitude: 20.3899, longitude: 78.1307, precision: "locality", aliases: ["yavatmal"] },

  { label: "Dubai", latitude: 25.2048, longitude: 55.2708, precision: "locality", aliases: ["dubai", "dxb", "united arab emirates", "uae"] },
  { label: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773, precision: "locality", aliases: ["abu dhabi"] },
  { label: "Riyadh", latitude: 24.7136, longitude: 46.6753, precision: "locality", aliases: ["riyadh", "saudi arabia"] },
  { label: "Doha", latitude: 25.2854, longitude: 51.5310, precision: "locality", aliases: ["doha", "qatar"] },

  { label: "Singapore", latitude: 1.3521, longitude: 103.8198, precision: "country", aliases: ["singapore"] },
  { label: "Hong Kong", latitude: 22.3193, longitude: 114.1694, precision: "locality", aliases: ["hong kong"] },
  { label: "Tokyo", latitude: 35.6762, longitude: 139.6503, precision: "locality", aliases: ["tokyo", "japan"] },
  { label: "Shanghai", latitude: 31.2304, longitude: 121.4737, precision: "locality", aliases: ["shanghai", "china"] },
  { label: "Beijing", latitude: 39.9042, longitude: 116.4074, precision: "locality", aliases: ["beijing"] },
  { label: "Seoul", latitude: 37.5665, longitude: 126.9780, precision: "locality", aliases: ["seoul", "south korea"] },
  { label: "Taipei", latitude: 25.0330, longitude: 121.5654, precision: "locality", aliases: ["taipei", "taiwan"] },
  { label: "Bangkok", latitude: 13.7563, longitude: 100.5018, precision: "locality", aliases: ["bangkok", "thailand"] },
  { label: "Kuala Lumpur", latitude: 3.1390, longitude: 101.6869, precision: "locality", aliases: ["kuala lumpur", "malaysia"] },
  { label: "Jakarta", latitude: -6.2088, longitude: 106.8456, precision: "locality", aliases: ["jakarta", "indonesia"] },
  { label: "Bali", latitude: -8.3405, longitude: 115.0920, precision: "region", aliases: ["bali"] },
  { label: "Sydney", latitude: -33.8688, longitude: 151.2093, precision: "locality", aliases: ["sydney", "australia"] },
  { label: "Melbourne", latitude: -37.8136, longitude: 144.9631, precision: "locality", aliases: ["melbourne"] },
  { label: "Auckland", latitude: -36.8485, longitude: 174.7633, precision: "locality", aliases: ["auckland", "new zealand"] },

  { label: "New York", latitude: 40.7128, longitude: -74.0060, precision: "locality", aliases: ["new york", "new york city", "nyc", "manhattan"] },
  { label: "Palm Beach", latitude: 26.7056, longitude: -80.0364, precision: "locality", aliases: ["palm beach"] },
  { label: "Miami", latitude: 25.7617, longitude: -80.1918, precision: "locality", aliases: ["miami", "south florida"] },
  { label: "Los Angeles", latitude: 34.0522, longitude: -118.2437, precision: "locality", aliases: ["los angeles", "la"] },
  { label: "Beverly Hills", latitude: 34.0736, longitude: -118.4004, precision: "locality", aliases: ["beverly hills"] },
  { label: "San Francisco", latitude: 37.7749, longitude: -122.4194, precision: "locality", aliases: ["san francisco"] },
  { label: "Palo Alto", latitude: 37.4419, longitude: -122.1430, precision: "locality", aliases: ["palo alto", "silicon valley"] },
  { label: "Austin", latitude: 30.2672, longitude: -97.7431, precision: "locality", aliases: ["austin"] },
  { label: "Dallas", latitude: 32.7767, longitude: -96.7970, precision: "locality", aliases: ["dallas"] },
  { label: "Houston", latitude: 29.7604, longitude: -95.3698, precision: "locality", aliases: ["houston", "texas"] },
  { label: "Chicago", latitude: 41.8781, longitude: -87.6298, precision: "locality", aliases: ["chicago", "illinois"] },
  { label: "Boston", latitude: 42.3601, longitude: -71.0589, precision: "locality", aliases: ["boston", "massachusetts"] },
  { label: "Seattle", latitude: 47.6062, longitude: -122.3321, precision: "locality", aliases: ["seattle", "washington"] },
  { label: "Greenwich", latitude: 41.0262, longitude: -73.6282, precision: "locality", aliases: ["greenwich", "connecticut"] },
  { label: "Wilmington", latitude: 39.7391, longitude: -75.5398, precision: "locality", aliases: ["wilmington", "delaware"] },
  { label: "Newark", latitude: 40.7357, longitude: -74.1724, precision: "locality", aliases: ["newark", "new jersey"] },
  { label: "Las Vegas", latitude: 36.1699, longitude: -115.1398, precision: "locality", aliases: ["las vegas", "nevada"] },
  { label: "Denver", latitude: 39.7392, longitude: -104.9903, precision: "locality", aliases: ["denver", "colorado"] },
  { label: "Atlanta", latitude: 33.7490, longitude: -84.3880, precision: "locality", aliases: ["atlanta", "georgia"] },
  { label: "Philadelphia", latitude: 39.9526, longitude: -75.1652, precision: "locality", aliases: ["philadelphia", "pennsylvania"] },
  { label: "Washington DC", latitude: 38.9072, longitude: -77.0369, precision: "locality", aliases: ["washington dc", "washington d c", "district of columbia"] },

  { label: "London", latitude: 51.5074, longitude: -0.1278, precision: "locality", aliases: ["london", "mayfair", "kensington", "united kingdom", "uk"] },
  { label: "Lisbon", latitude: 38.7223, longitude: -9.1393, precision: "locality", aliases: ["lisbon", "portugal"] },
  { label: "Porto", latitude: 41.1579, longitude: -8.6291, precision: "locality", aliases: ["porto"] },
  { label: "Zamora", latitude: 41.5035, longitude: -5.7446, precision: "locality", aliases: ["zamora"] },
  { label: "Madrid", latitude: 40.4168, longitude: -3.7038, precision: "locality", aliases: ["madrid", "spain"] },
  { label: "Barcelona", latitude: 41.3874, longitude: 2.1686, precision: "locality", aliases: ["barcelona"] },
  { label: "Paris", latitude: 48.8566, longitude: 2.3522, precision: "locality", aliases: ["paris", "france"] },
  { label: "Monaco", latitude: 43.7384, longitude: 7.4246, precision: "country", aliases: ["monaco"] },
  { label: "Milan", latitude: 45.4642, longitude: 9.1900, precision: "locality", aliases: ["milan"] },
  { label: "Rome", latitude: 41.9028, longitude: 12.4964, precision: "locality", aliases: ["rome", "italy"] },
  { label: "Zurich", latitude: 47.3769, longitude: 8.5417, precision: "locality", aliases: ["zurich", "switzerland"] },
  { label: "Geneva", latitude: 46.2044, longitude: 6.1432, precision: "locality", aliases: ["geneva"] },
  { label: "Amsterdam", latitude: 52.3676, longitude: 4.9041, precision: "locality", aliases: ["amsterdam", "netherlands"] },
  { label: "Berlin", latitude: 52.5200, longitude: 13.4050, precision: "locality", aliases: ["berlin"] },
  { label: "Frankfurt", latitude: 50.1109, longitude: 8.6821, precision: "locality", aliases: ["frankfurt", "germany"] },
  { label: "Munich", latitude: 48.1351, longitude: 11.5820, precision: "locality", aliases: ["munich"] },
  { label: "Dublin", latitude: 53.3498, longitude: -6.2603, precision: "locality", aliases: ["dublin", "ireland"] },
  { label: "Athens", latitude: 37.9838, longitude: 23.7275, precision: "locality", aliases: ["athens", "greece"] },
  { label: "Vienna", latitude: 48.2082, longitude: 16.3738, precision: "locality", aliases: ["vienna"] },
  { label: "Luxembourg", latitude: 49.6117, longitude: 6.1300, precision: "country", aliases: ["luxembourg"] },
  { label: "Valletta", latitude: 35.8989, longitude: 14.5146, precision: "locality", aliases: ["valletta", "malta"] },
  { label: "Nicosia", latitude: 35.1856, longitude: 33.3823, precision: "locality", aliases: ["nicosia", "cyprus"] },

  { label: "Toronto", latitude: 43.6532, longitude: -79.3832, precision: "locality", aliases: ["toronto", "canada"] },
  { label: "Vancouver", latitude: 49.2827, longitude: -123.1207, precision: "locality", aliases: ["vancouver"] },
  { label: "Mexico City", latitude: 19.4326, longitude: -99.1332, precision: "locality", aliases: ["mexico city", "mexico"] },
  { label: "Panama City", latitude: 8.9824, longitude: -79.5199, precision: "locality", aliases: ["panama city", "panama"] },
  { label: "Nassau", latitude: 25.0480, longitude: -77.3554, precision: "locality", aliases: ["nassau", "bahamas"] },
  { label: "George Town", latitude: 19.2866, longitude: -81.3744, precision: "locality", aliases: ["george town", "cayman islands"] },
  { label: "Sao Paulo", latitude: -23.5505, longitude: -46.6333, precision: "locality", aliases: ["sao paulo", "são paulo", "brazil"] },
  { label: "Port Louis", latitude: -20.1609, longitude: 57.5012, precision: "locality", aliases: ["port louis", "mauritius"] },
  { label: "Cape Town", latitude: -33.9249, longitude: 18.4241, precision: "locality", aliases: ["cape town"] },
  { label: "Johannesburg", latitude: -26.2041, longitude: 28.0473, precision: "locality", aliases: ["johannesburg", "south africa"] },
]

const MATCHERS = COORDINATE_ALIASES
  .flatMap((entry) => entry.aliases.map((alias) => ({ alias: normalizeLocationText(alias), entry })))
  .filter(({ alias }) => alias.length > 0)
  .sort((a, b) => b.alias.length - a.alias.length)

const ROUTE_DELIMITER = /\s*(?:→|->|›|>| to )\s*/i

function normalizeLocationText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
}

function isValidBackendCoordinate(latitude: unknown, longitude: unknown): latitude is number {
  const lat = Number(latitude)
  const lng = Number(longitude)

  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
}

function resolveFromText(value: string | null | undefined): Coordinate | null {
  if (!value) return null

  const normalized = normalizeLocationText(value)
  if (!normalized || normalized === "global" || normalized === "worldwide") {
    return null
  }

  const padded = ` ${normalized} `
  const match = MATCHERS.find(({ alias }) => padded.includes(` ${alias} `))
  return match ? match.entry : null
}

function resolveRouteDestination(value: string | null | undefined): Coordinate | null {
  if (!value || !ROUTE_DELIMITER.test(value)) return null

  const parts = value.split(ROUTE_DELIMITER).map((part) => part.trim()).filter(Boolean)
  if (parts.length < 2) return null

  return resolveFromText(parts[parts.length - 1])
}

export function resolveOpportunityCoordinates(input: OpportunityCoordinateInput): ResolvedMapCoordinate | null {
  const primaryFields = [
    input.location,
    input.city,
    input.address,
    input.region,
    input.state,
  ]

  for (const field of primaryFields) {
    const resolved = resolveRouteDestination(field) || resolveFromText(field)
    if (resolved) return { ...resolved, source: "resolved" }
  }

  const titleResolved = resolveRouteDestination(input.title) || resolveFromText(input.title)
  if (titleResolved) return { ...titleResolved, source: "resolved" }

  const productResolved = resolveFromText(input.product) || resolveFromText(input.industry) || resolveFromText(input.category)
  if (productResolved) return { ...productResolved, source: "resolved" }

  if (isValidBackendCoordinate(input.latitude, input.longitude)) {
    return {
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      label: input.location || input.country || input.title || "Opportunity",
      precision: "locality",
      source: "backend",
    }
  }

  const countryResolved = resolveFromText(input.country)
  if (countryResolved) return { ...countryResolved, source: "resolved" }

  const analysisResolved = resolveFromText(input.analysis)
  if (analysisResolved) return { ...analysisResolved, source: "resolved" }

  return null
}
