# HC9L7M2A4Q8P6 Release Readiness UI Baseline

Date: 2026-06-29

Scope: London Mayfair release-readiness review at `app.hnwichronicles.com`.

Live route:

- Principal View: `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6`
- Route View: `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6?view=route`
- Evidence View: `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6?view=evidence`

## Backup Point

The current UI code was backed up before any version-upgrade work.

- Backup branch: `codex/backup-release-readiness-ui-current-20260629`
- Backup commit: `692ebe4dd13102b2dc0e3859dc88c3eb2f5dc330`
- Working branch at capture: `main`
- Working tree at backup creation: clean

Restore command if needed:

```bash
git switch codex/backup-release-readiness-ui-current-20260629
```

## Capture Evidence

Screenshots and DOM inventories were captured from production with the project Puppeteer dependency.

Local generated evidence folder:

```text
/Users/skyg/Desktop/Code/hnwi-chronicles/.codex_tmp/release-readiness-ui-audit/HC9L7M2A4Q8P6-2026-06-29/
```

Screenshot files:

- `screenshots/01-principal-viewport.png`
- `screenshots/01-principal.png`
- `screenshots/02-route-viewport.png`
- `screenshots/02-route.png`
- `screenshots/03-evidence-viewport.png`
- `screenshots/03-evidence.png`

DOM inventories:

- `dom/01-principal.json`
- `dom/02-route.json`
- `dom/03-evidence.json`
- `dom/summary.json`

Production responses at capture:

| View | HTTP | Final URL | Load capture time | Tables | Headings | Sections | Articles | Card/panel-like elements |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Principal | 200 | `/release-readiness/review/HC9L7M2A4Q8P6` | 10125 ms | 12 | 22 | 14 | 11 | 153 |
| Route | 200 | `/release-readiness/review/HC9L7M2A4Q8P6?view=route` | 9816 ms | 1 | 54 | 11 | 0 | 403 |
| Evidence | 200 | `/release-readiness/review/HC9L7M2A4Q8P6?view=evidence` | 7646 ms | 0 | 120 | 12 | 145 | 460 |

## Current Render Pipeline

Server route:

- `app/(authenticated)/release-readiness/review/[intakeId]/page.tsx`
- Resolves public memo ID via `resolvePublicDecisionMemoId`.
- Fetches backend public snapshot through `fetchReleaseReadinessPublicSnapshot`.
- Renders `PrincipalReleaseReadinessSharePage`.
- Route config currently sets `revalidate = 86400`, `runtime = 'nodejs'`, and `maxDuration = 30`.

Backend read model client:

- `lib/decision-memo/fetch-release-readiness-public-snapshot.ts`
- Calls `KINGDOM_CORE_BASE_URL/api/decision-memo/release-readiness/public/{intakeId}`.
- Uses `cache: 'no-store'` with a 15 second timeout.
- Enforces `hnwi_release_readiness_public_snapshot_v1`.
- Requires source-map readback, source evidence rows, Product Aquarium acceptance, five routes, and complete route intelligence.

Main client page:

- `components/decision-memo/share/PrincipalReleaseReadinessSharePage.tsx`
- View modes are `principal`, `route`, and `evidence`.
- Query param routing is local to the client: default Principal View, `?view=route`, `?view=evidence`, and `?view=methodology` aliasing to Evidence View.
- Citations are seeded from payload citations, method drivers, and public sources.
- The citation panel uses preloaded source evidence from the backend payload.

Route View renderer:

- `components/decision-memo/v2/RouteIntelligenceV2Report.tsx`
- Renders a route selector from `routeIntelligenceV2.routeOptions` or `pressureVariants`.
- Holds selected route in local state.
- Accepts a `fullMemo` render prop from `PrincipalReleaseReadinessSharePage`.
- The `fullMemo` render prop builds a route-scoped memo with `buildPublicRouteScopedMemoSurface`.

Route-scoped linear memo builder:

- `lib/decision-memo/build-release-readiness-public-linear-memo.ts`
- Builds `memoData`, `backendData`, and `fullArtifact` for the selected route from the compact public snapshot.
- This is the bridge between the compact public read model and the full memo renderer.

Full memo component used inside Route View:

- `components/decision-memo/memo/DecisionMemoLinearReport.tsx`
- Rendered with `hideEvidenceAppendix`.
- Still visually reads as a full memo section inside Route View.

## Current UI By View

### Principal View

Visible first screen:

- HNWI Chronicles header.
- Three view tabs.
- Large title: `London Mayfair House Acquisition Release Readiness Memo`.
- Reference, corridor, release stance, selected route card.
- Four metric cards: all-in exposure, duty drag, annual carry, capital rule.
- Principal decision minute begins immediately below.

Current strengths:

- First screen is clear and principal-facing.
- The release stance and capital rule are prominent.
- The selected route is visible without opening Route View.

Current friction:

- The view becomes table-heavy after the hero.
- DOM capture counted 12 tables and 153 card/panel-like elements.
- The principal decision minute and subsequent sections feel closer to a document dump than a guided decision screen.

Keep:

- Principal-facing language.
- Reference, corridor, release stance, selected route, all-in exposure, duty drag, annual carry, and capital rule.
- Citation authority and source-backed boundary.

Upgrade direction:

- Keep the first-screen identity.
- Convert the lower table runs into fewer visual decision modules: gate status, capital path, decision tree, and owner/action rail.
- Preserve backend fields and citation IDs.

### Route View

Visible first screen:

- HNWI Chronicles header and view tabs.
- Route headline: `Proposed Move Release Readiness Memo`.
- Route selector with five route options.
- Active route: `Direct non-UK resident individual purchase`.
- Under the selector, the page immediately starts `Full Linear Route Memo - Route 1`.

Current strengths:

- Route selector is useful and should remain.
- The dotted route path helps compare five route states.
- Route metrics such as duty and capital are scannable in the selector.

Current friction:

- Route View currently prioritizes the full linear memo below the selector.
- `RouteIntelligenceV2Report` suppresses the later visual route sections whenever `fullMemo` is present.
- DOM capture counted 403 card/panel-like elements and 54 headings.
- The route page reads as a dense memo inside a route shell, not a route intelligence screen.
- User-visible issue: general full report and selected route full report feel duplicated in one view.

Important code behavior:

- `PrincipalReleaseReadinessSharePage` passes `fullMemo` at lines around `1722-1747`.
- `RouteIntelligenceV2Report` sets `showFullMemoAnchor = Boolean(fullMemo && selectedRoute && !isOutcomeOnlyTrack)`.
- When `showFullMemoAnchor` is true, it renders the full memo at the top and skips the visual route panels.
- The skipped visual panels include route graph, scenario graph, stress signals, tax/duty, jurisdiction, banking, continuity, crisis, evidence, responsibility, counsel, and roadmap sections.

Keep:

- Five-route selector.
- Selected-route identity.
- Route-specific metrics.
- Scenario economics, tax/legal read, banking rail, G1/G2/G3 consequence, crisis response, anti-fragility, responsibility transfer, and counsel questions.
- Citation linking.

Upgrade direction:

- Route View should show one route report for the selected route only.
- Do not show a general full memo plus a selected route full memo in the same view.
- Prefer a visual selected-route report: route selector, route summary, capital/duty graph, scenario graph, gate stack, owner/action rail, evidence checkpoints, and final route decision.
- If the full linear memo remains available, move it behind an explicit secondary detail affordance, not first paint.

### Evidence View

Visible first screen:

- Evidence boundary banner.
- View tabs.
- Title: `Evidence authority for the release decision`.
- Principal proof answer card.
- Three top metrics: evidence rows, legal/tax rows, private evidence classes.
- Release authority stack begins below.

Current strengths:

- Evidence boundary language is clear and conservative.
- First screen distinguishes source-backed, private evidence, and method-only authority.
- The view avoids tables on the top screen.

Current friction:

- DOM capture counted 120 headings, 145 articles, and 460 card/panel-like elements.
- The evidence register becomes too long for a principal-facing review surface.
- Many records are equally weighted visually, which makes it hard to know what matters first.

Keep:

- Evidence boundary banner.
- Counts for evidence rows, legal/tax rows, and private evidence classes.
- Authority separation between public source, private release evidence, and method-only records.
- Citation/source panel behavior.

Upgrade direction:

- Keep the first-screen evidence authority summary.
- Collapse the long record register into grouped accordions or a source map.
- Add visual prioritization: release-critical, counsel-critical, bank-critical, family-authority-critical, methodology-only.
- Keep full evidence accessible, but not as hundreds of equal cards on first read.

## Upgrade Rules

1. Do not change backend contracts.
2. Do not weaken `fetchReleaseReadinessPublicSnapshot` validation.
3. Do not invent memo data in the frontend.
4. Preserve citation IDs and `EliteCitationPanel` behavior.
5. Preserve the three public view URLs and query params.
6. Route View must render exactly one selected-route report surface.
7. Prefer graphs and visual decision modules over repeated tables.
8. If a long full memo is still needed, make it an explicit secondary detail mode.
9. No duplicate general full report plus selected-route full report in one view.
10. Preserve the backup branch until the upgraded UI is verified live.

## Candidate Files For Version Upgrade

Primary files:

- `components/decision-memo/share/PrincipalReleaseReadinessSharePage.tsx`
- `components/decision-memo/v2/RouteIntelligenceV2Report.tsx`
- `lib/decision-memo/build-release-readiness-public-linear-memo.ts`

Read-only contract files unless absolutely required:

- `app/(authenticated)/release-readiness/review/[intakeId]/page.tsx`
- `lib/decision-memo/fetch-release-readiness-public-snapshot.ts`
- `lib/decision-memo/build-release-readiness-share-surface.ts`
- `lib/decision-memo/route-intelligence-v2.ts`

Verification targets after upgrade:

```bash
npm run typecheck
npm test -- --runInBand __tests__/release-readiness-public-linear-memo.test.ts
```

Live verification targets:

- `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6`
- `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6?view=route`
- `https://app.hnwichronicles.com/release-readiness/review/HC9L7M2A4Q8P6?view=evidence`

## Baseline Conclusion

The current production UI is functional and source-backed. The problem is not data absence or backend contract drift. The problem is presentation density and duplicated route-report hierarchy:

- Principal View: good first screen, table-heavy after hero.
- Route View: good selector, but the full linear memo dominates and suppresses richer visual route panels.
- Evidence View: good evidence boundary, but the long register is too card-dense.

The version upgrade should keep the central backend read model, keep the public URLs, and replace repeated memo/table surfaces with a smaller set of visual decision modules.
