export type GranthikaPageContract = {
  key: string
  page: string
  frontendApi: string
  backendApi: string
  sourceAuthority: string
  requiredKeys: string[]
  owner: string
  noFrontendFallback: true
}

export const GRANTHIKA_PAGE_CONTRACTS = [
  {
    key: "command_centre_opportunities",
    page: "/dashboard",
    frontendApi: "/api/command-centre/opportunities",
    backendApi: "/api/command-centre/opportunities",
    sourceAuthority: "Granthika backend command centre read model",
    requiredKeys: ["success", "kingdom_native", "opportunities", "count", "metadata"],
    owner: "DM21",
    noFrontendFallback: true,
  },
  {
    key: "crisis_intelligence",
    page: "/map",
    frontendApi: "/api/crisis-intelligence",
    backendApi: "/api/crisis-intelligence",
    sourceAuthority: "Granthika Nyra crisis intelligence projection",
    requiredKeys: ["success", "kingdom_native", "zones", "alert", "colors", "locations"],
    owner: "Nyra/Vajra/DM21",
    noFrontendFallback: true,
  },
  {
    key: "audelle",
    page: "/ask-audelle",
    frontendApi: "/api/audelle/*",
    backendApi: "/api/audelle/*",
    sourceAuthority: "Granthika Audelle memory and backend reasoning",
    requiredKeys: ["kingdom_native"],
    owner: "Audelle/DM21",
    noFrontendFallback: true,
  },
  {
    key: "hnwi_world",
    page: "/hnwi-world",
    frontendApi: "/api/developments/public",
    backendApi: "/api/developments/public",
    sourceAuthority: "Granthika Castle Briefs v31 public read model",
    requiredKeys: ["success", "kingdom_native", "developments"],
    owner: "Granthika/DM21",
    noFrontendFallback: true,
  },
  {
    key: "prive_exchange",
    page: "/prive-exchange",
    frontendApi: "/api/opportunities",
    backendApi: "/api/opportunities",
    sourceAuthority: "Granthika Privé Exchange opportunities read model",
    requiredKeys: ["success", "kingdom_native", "opportunities", "count"],
    owner: "Artha/DM21",
    noFrontendFallback: true,
  },
  {
    key: "crown_vault",
    page: "/crown-vault",
    frontendApi: "/api/crown-vault/assets/detailed",
    backendApi: "/api/crown-vault/assets/detailed",
    sourceAuthority: "Granthika hot Crown Vault projection",
    requiredKeys: ["success", "kingdom_native", "assets", "count"],
    owner: "Katherine/DM21",
    noFrontendFallback: true,
  },
  {
    key: "social_hub",
    page: "/social-hub",
    frontendApi: "/api/developments/social-events",
    backendApi: "/api/developments/social-events",
    sourceAuthority: "Granthika social events read model",
    requiredKeys: ["events"],
    owner: "Setu/DM21",
    noFrontendFallback: true,
  },
  {
    key: "profile",
    page: "/profile",
    frontendApi: "/api/profile",
    backendApi: "/api/profile",
    sourceAuthority: "Backend canonical user profile plus Granthika owner-scoped projections",
    requiredKeys: ["kingdom_native"],
    owner: "DM21",
    noFrontendFallback: true,
  },
  {
    key: "executor_directory",
    page: "/trusted-network",
    frontendApi: "/api/trusted-network/experts",
    backendApi: "/api/trusted-network/experts",
    sourceAuthority: "Granthika trusted network people projection",
    requiredKeys: ["success", "kingdom_native", "experts", "total_count"],
    owner: "DM21",
    noFrontendFallback: true,
  },
  {
    key: "war_room",
    page: "/war-room",
    frontendApi: "/api/decision-memo/war-room",
    backendApi: "/api/decision-memo/war-room",
    sourceAuthority: "Granthika native Decision Memo state",
    requiredKeys: ["kingdom_native"],
    owner: "DM64/DM21",
    noFrontendFallback: true,
  },
] as const satisfies readonly GranthikaPageContract[]

export function getGranthikaPageContract(key: string): GranthikaPageContract | undefined {
  return GRANTHIKA_PAGE_CONTRACTS.find((contract) => contract.key === key)
}
