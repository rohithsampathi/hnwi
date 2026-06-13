export type GranthikaNativeTool = {
  key: string
  owner: string
  kind: "broker_endpoint" | "automation_script" | "certification_script"
  command?: string
  method?: "GET" | "POST"
  path?: string
  purpose: string
  writesLocalRuntime: boolean
  requiresToken: boolean
}

export const GRANTHIKA_BASE_STATION_PATH = "/Users/skyg/Desktop/Code/granthika"
export const DEFAULT_GRANTHIKA_BROKER_URL = "http://127.0.0.1:8765"

export const GRANTHIKA_NATIVE_TOOLS = [
  {
    key: "broker_ready",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "GET",
    path: "/ready",
    purpose: "Strict broker readiness over DuckDB, Kuzu, G2 graph, and fast query index.",
    writesLocalRuntime: false,
    requiresToken: true,
  },
  {
    key: "broker_status",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "GET",
    path: "/status",
    purpose: "Native substrate status and next gate inspection.",
    writesLocalRuntime: false,
    requiresToken: true,
  },
  {
    key: "broker_query",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "POST",
    path: "/query",
    purpose: "First Granthika packet from the native substrate.",
    writesLocalRuntime: false,
    requiresToken: true,
  },
  {
    key: "content_context",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "POST",
    path: "/content-context",
    purpose: "Content context packet with Granthika query, buyer audience, queue, and relationship temperature previews.",
    writesLocalRuntime: false,
    requiresToken: true,
  },
  {
    key: "buyer_audience",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "POST",
    path: "/buyer-audience",
    purpose: "Clean buyer audience consolidation from the base-station control root.",
    writesLocalRuntime: true,
    requiresToken: true,
  },
  {
    key: "queue_arbiter",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "POST",
    path: "/queue-arbiter",
    purpose: "Today next-15 queue arbitration from Granthika runtime inputs.",
    writesLocalRuntime: true,
    requiresToken: true,
  },
  {
    key: "relationship_temperature",
    owner: "Granthika",
    kind: "broker_endpoint",
    method: "POST",
    path: "/relationship-temperature",
    purpose: "Relationship temperature, warm connection candidates, and pressure-test next actions.",
    writesLocalRuntime: true,
    requiresToken: true,
  },
  {
    key: "refresh_query_runtime",
    owner: "Granthika",
    kind: "automation_script",
    command: ".venv/bin/python scripts/refresh_query_runtime.py --run-id ${GRANTHIKA_RUN_ID}",
    purpose: "Rebuild, swap, certify, and manifest the native query runtime.",
    writesLocalRuntime: true,
    requiresToken: false,
  },
  {
    key: "certify_query_runtime",
    owner: "Granthika",
    kind: "certification_script",
    command: ".venv/bin/python scripts/certify_query_runtime.py --run-id ${GRANTHIKA_RUN_ID} --max-ms 750",
    purpose: "Certify local query speed and traceability.",
    writesLocalRuntime: true,
    requiresToken: false,
  },
  {
    key: "certify_granthika_broker",
    owner: "Granthika",
    kind: "certification_script",
    command: ".venv/bin/python scripts/certify_granthika_broker.py --run-id ${GRANTHIKA_RUN_ID}",
    purpose: "Certify the direct and HTTP broker packet path.",
    writesLocalRuntime: true,
    requiresToken: false,
  },
  {
    key: "run_flex_lifecycle",
    owner: "Granthika",
    kind: "automation_script",
    command: ".venv/bin/python scripts/run_flex_lifecycle.py --http-base-url ${GRANTHIKA_BROKER_URL} --max-ms 750",
    purpose: "Journal writebacks, refresh hot/cold pointers, sync restore rails, and prepare cleanup review.",
    writesLocalRuntime: true,
    requiresToken: false,
  },
  {
    key: "install_systemd_timers",
    owner: "Granthika",
    kind: "automation_script",
    command: ".venv/bin/python scripts/install_systemd_timers.py --enable --start",
    purpose: "Install broker, query refresh, lifecycle, relationship, and vault sync timers.",
    writesLocalRuntime: false,
    requiresToken: false,
  },
] as const satisfies readonly GranthikaNativeTool[]

export function getGranthikaBrokerUrl(): string {
  const configured = process.env.GRANTHIKA_BROKER_URL?.trim().replace(/\/$/, "")
  return configured || DEFAULT_GRANTHIKA_BROKER_URL
}
