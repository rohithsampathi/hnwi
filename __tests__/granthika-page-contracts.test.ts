import { GRANTHIKA_PAGE_CONTRACTS } from "@/lib/granthika-page-contracts"
import { GRANTHIKA_BASE_STATION_PATH, GRANTHIKA_NATIVE_TOOLS } from "@/lib/granthika-native-tools"
import fs from "fs"
import path from "path"

const requiredKeys = [
  "command_centre_opportunities",
  "crisis_intelligence",
  "audelle",
  "hnwi_world",
  "prive_exchange",
  "crown_vault",
  "social_hub",
  "profile",
  "executor_directory",
  "war_room",
]

describe("Granthika page contracts", () => {
  it("declares every core page as backend-owned and fallback-free", () => {
    const byKey = new Map(GRANTHIKA_PAGE_CONTRACTS.map((contract) => [contract.key, contract]))

    for (const key of requiredKeys) {
      const contract = byKey.get(key)
      expect(contract).toBeDefined()
      expect(contract?.noFrontendFallback).toBe(true)
      expect(contract?.frontendApi.startsWith("/api/")).toBe(true)
      expect(contract?.backendApi.startsWith("/api/")).toBe(true)
      expect(contract?.sourceAuthority.toLowerCase()).toContain("granthika")
      expect(contract?.requiredKeys.length).toBeGreaterThan(0)
    }
  })

  it("keeps page contracts uniquely keyed", () => {
    const keys = GRANTHIKA_PAGE_CONTRACTS.map((contract) => contract.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("exposes the required frontend contract route without asserting native fallback success", () => {
    const routePath = path.join(process.cwd(), "app/api/granthika/page-contracts/route.ts")
    const route = fs.readFileSync(routePath, "utf8")

    expect(route).toContain("/api/granthika/page-contracts")
    expect(route).toContain("backend_contract_unavailable")
    expect(route).toContain("local_contracts")
    expect(route).not.toContain('status: "native"')
  })

  it("keeps Granthika base-station tools typed and discoverable", () => {
    expect(GRANTHIKA_BASE_STATION_PATH).toBe("/Users/skyg/Desktop/Code/granthika")
    expect(GRANTHIKA_NATIVE_TOOLS.length).toBeGreaterThanOrEqual(10)

    const byKey = new Map(GRANTHIKA_NATIVE_TOOLS.map((tool) => [tool.key, tool]))
    expect(byKey.get("broker_query")?.path).toBe("/query")
    expect(byKey.get("content_context")?.path).toBe("/content-context")
    expect(byKey.get("refresh_query_runtime")?.command).toContain("scripts/refresh_query_runtime.py")
    expect(byKey.get("run_flex_lifecycle")?.command).toContain("scripts/run_flex_lifecycle.py")
  })
})
