# Release Readiness Three-View Architecture

Date: 2026-06-19
Memo reference: HC9L7M2A4Q8P6
Status: Architecture decision note and implemented display contract

## 1. Core Decision

The release-readiness product should remain a three-view system.

The architecture is correct only if each view carries a different trust role:

1. Principal View = decision surface.
2. Route View = full reviewer / adviser memo.
3. Evidence & Methodology = proof ledger and methodology receipt.

The problem is not that Route View contains the full memo. The problem is that the trust level of each view is not explicit enough, and some language currently makes ownership, evidence, methodology, and release authority feel interchangeable.

## 2. Product Trust Contract

Every view must make this trust boundary legible:

> Public law, tax, property, market, and FX claims are source-backed. Private bank, title, seller, SoW/SoF, family-authority, and adviser claims are release gates until signed or indexed in the data room. Route-pattern methodology explains why a gate matters; it does not prove legal status, bank acceptance, title, valuation, tax treatment, or family authority.

This is the governing sentence. It protects both trust and IP:

- It tells the principal what can be relied on now.
- It tells advisers what they must sign or verify.
- It prevents methodology records from masquerading as legal, bank, title, tax, valuation, or family proof.
- It prevents private-family document absence from being hidden behind polished memo language.

## 3. View Contracts

### Principal View

Audience: principal, family decision room, MFO/SFO lead.

Purpose: answer "can I decide now?"

Default content must be restricted to:

- Decision.
- Capital exposure.
- No-release rule.
- Gate status.
- Bid discipline.
- Evidence boundary.
- Next action.

Principal View should not default-render:

- Full route memo.
- Full route comparison.
- Route-pattern source records.
- Internal model scoring.
- Crisis rail dump.
- G1/G2/G3 projections.
- Long adviser worksheets.
- Long source register.
- Methodology receipt.

Acceptable Principal View wording:

- "Gated negotiation only"
- "No capital release"
- "No exchange or deposit until signed gates"
- "Gate ownership assigned; release evidence pending"
- "Public claims source-backed; private claims gated"
- "Next action: counsel / bank / title / family authority close path"

Forbidden or discouraged in Principal View:

- "Release Differently"
- "Proceed Modified"
- "Decision EV"
- "House Signal Rail"
- "Open release gates: Clear" when evidence is not signed
- Route-pattern record counts
- Source-review machinery language
- G1 / G2 / G3 labels unless explicitly translated into principal-safe family roles

Principal View may include expanders later, but the default first pass should remain short. Expanders must be titled by decision consequence, not internal system category.

### Route View

Audience: advisers, reviewer, family-office operator, and investment-committee reader.

Purpose: answer "can I audit the route logic?"

Route View should keep the full memo. That is intentional.

Route View must open with a reviewer-layer banner:

> Reviewer layer. Contains the full route memo, working assumptions, scenario logic, and release-gate reasoning. Principal View remains the client-facing decision surface. Evidence & Methodology contains the authority ledger and source boundaries.

Route View should be structured in this order:

1. Route comparison.
2. Selected route.
3. Failure modes.
4. Gate evidence.
5. Full memo.
6. Internal model outputs.
7. Methodology reference.

Route View may include:

- Full release-readiness memo.
- Route selector.
- Tax and duty audit by selected route.
- Crisis and resilience sections.
- G1/G2/G3 or generation-to-generation sections, if clearly family-office/reviewer-facing.
- Scenario trees.
- Carrying-cost projections.
- Responsibility transfer matrix.
- Record mismatch map.
- Counsel/operator question packs.
- Adviser worksheets.

Route View must not imply final release if evidence is unsigned.

Critical wording fix:

Current bad pattern:

> Open Release Gates: Clear
> All listed release gates have assigned owners

Required replacement:

> Gate ownership: assigned
> Release gates: open until signed evidence is received

or:

> Owner assignment complete; release not cleared

This distinction is non-negotiable. Owner assignment is not proof. Evidence signed or indexed is proof.

### Evidence & Methodology

Audience: trust reviewer, counsel/adviser, SFO/MFO operator, source auditor.

Purpose: answer "what supports each claim, and what kind of authority is it?"

Evidence & Methodology should remain a separate section.

It should be ordered by authority hierarchy:

1. Legal / tax authorities.
2. Market / property / carrying-cost sources.
3. Private evidence classes.
4. Methodology receipt.
5. Route-pattern records, collapsed by default.

Evidence & Methodology must not bury official authorities under pattern examples.

Route-pattern records should not be deleted. They should be visibly lower-authority than:

- GOV.UK / HMRC / Companies House.
- Official FX / market data source.
- Rightmove or property listing evidence.
- Coutts / Knight Frank / market data where used.
- Title pack.
- Counsel sign-off.
- Bank acceptance.
- Family authority minute.

Evidence & Methodology must use source categories that express authority type:

- Legal / Tax Authority.
- Market / Property Evidence.
- Banking / SoW Evidence Class.
- Family Authority Evidence Class.
- Methodology Record.
- Route-Pattern Source Record.

## 4. Data Authority Hierarchy

The UI should distinguish five authority levels:

1. Public authority source: official legal, tax, regulatory, property, market, or FX source.
2. Private signed evidence: title pack, counsel memo, bank acceptance, family minute, seller terms, SoW/SoF pack.
3. Private indexed evidence: document class exists in the data room but is not fully signed or reviewed.
4. Methodology record: used to explain why a gate matters, not to prove release.
5. Internal model output: used to support decision reasoning, never release authority.

This authority level should flow into labels, badges, source rows, and citation behavior.

## 5. Gate Status Model

Gate state must be precise. Use these statuses:

- Signed: evidence signed by the relevant authority.
- Indexed: evidence stored in the data room and available for review.
- Received pending review: evidence has arrived but is not accepted.
- Required: evidence is missing or not yet provided.
- Waived: formally waived, with owner and reason recorded.

Avoid broad statuses:

- Documented.
- Clear.
- Aligned.
- Evidence gated.
- Assigned.

If an owner is assigned but evidence is not signed, show:

> Ownership assigned; release evidence required.

If all owners are assigned but nothing is signed, show:

> Release gates remain open.

## 6. Terminology Repairs

Apply this vocabulary across rendered views:

| Current / Risky | Replacement |
| --- | --- |
| Release Differently | Gated negotiation only |
| Proceed Modified | Proceed under signed gates |
| House Signal Rail | Route Control Summary |
| Decision EV | Internal model output - not release authority |
| Route Source Records | Methodology records - not legal proof |
| Open Gates: Clear | Release gates: open until signed |
| All gates have assigned owners | Gate ownership assigned; release evidence pending |
| Documented | Signed / indexed / received pending review / required |
| G1/G2/G3 in Principal View | principal / named family user / named family-fairness owner / next-generation record |

## 7. Citation And Source Panel Contract

Citations should continue to use the central citation panel. Do not create a custom source panel for this surface.

The citation panel must display the original source record, not a generated replacement brief.

Citation behavior:

- Principal View: minimal citations only where needed for public legal / market claims.
- Route View: inline citation numbers allowed throughout full memo and route logic.
- Evidence & Methodology: citations are first-class and grouped by authority level.

Public-facing citation text should be just bracketed citation numbers such as `[7]`, not `Source [7]`, unless the label is needed for accessibility.

## 8. Current Implementation Surfaces

Frontend routing and rendering live primarily in:

- `components/decision-memo/audit/DecisionMemoAuditClientPage.tsx`
- `components/decision-memo/share/PrincipalReleaseReadinessSharePage.tsx`
- `components/decision-memo/v2/RouteIntelligenceV2Report.tsx`
- `lib/decision-memo/build-release-readiness-share-surface.ts`
- `lib/decision-memo/route-intelligence-v2.ts`

Current view mapping:

- `/release-readiness/review/:id` -> Principal View.
- `/release-readiness/review/:id?view=route` -> Route View.
- `/release-readiness/review/:id?view=evidence` -> Evidence & Methodology.

The next implementation should not collapse these views again.

## 9. Proposed Implementation Phases

### Phase 1: Label And Trust Boundary Repair

Scope:

- Add trust-boundary banner to all three views.
- Add reviewer-layer banner to Route View.
- Replace risky terms listed in the terminology table.
- Replace "Open gates clear" semantics with evidence-pending semantics.

Expected impact:

- High trust gain.
- Low structural risk.
- No data-model migration required if derived from existing payloads.

### Phase 2: Principal View Restriction

Scope:

- Replace default Principal View body with a restricted decision packet.
- Remove default-rendered `FullReportSections` from Principal View.
- Keep only decision, exposure, no-release rule, gate state, bid discipline, evidence boundary, and next action.
- Move or link deeper content to Route View.

Expected impact:

- Principal View becomes sendable.
- Route View remains the full memo.

### Phase 3: Evidence Authority Hierarchy

Scope:

- Reorder Evidence & Methodology by authority hierarchy.
- Keep route-pattern records but collapse them below official and private evidence.
- Add authority-level badges to evidence records.
- Distinguish public authority, private signed/indexed evidence, methodology record, and internal model output.

Expected impact:

- Evidence view becomes a trust ledger instead of a mixed source dump.

### Phase 4: Citation Panel Contract Hardening

Scope:

- Ensure all inline citations route through the existing central citation panel.
- Ensure remote source records open the original source record.
- Remove generated source-brief fallback for valid source records.
- Keep generated fallback only for invalid or unavailable sources, and mark it unavailable rather than inventing a substitute.

Expected impact:

- Prevents credibility loss from made-up or refreshed citation content.

### Phase 5: Regression And Acceptance Checks

Required checks:

- Principal URL renders restricted decision packet only.
- Route URL renders full memo and reviewer-layer banner.
- Evidence URL renders authority ledger and methodology receipt.
- No page shows `Something broke`, `Audit Not Found`, or `Temporarily Unavailable`.
- No principal-visible `Decision EV`, `House Signal Rail`, `Open Gates: Clear`, or `Proceed Modified`.
- Route-pattern records are visible only in Evidence & Methodology or reviewer layers, not as principal proof.
- Gate ownership and release clearance are never conflated.
- Mobile width has no horizontal overflow.
- Citation click opens central citation panel, not a custom generated source brief.

## 10. Non-Goals

Do not do these in this implementation:

- Do not delete the full memo.
- Do not remove Route View depth.
- Do not remove Evidence & Methodology.
- Do not hide source records entirely.
- Do not replace actual public sources with route-pattern records.
- Do not make the Principal View a long scroll memo.
- Do not change the memo payload IDs or public URLs.
- Do not introduce client-side intake or generation.

## 11. Final Architecture Statement

The product becomes principal-grade when the three surfaces answer three different questions:

1. Principal View: can I decide fast?
2. Route View: can my adviser or operator audit the logic deeply?
3. Evidence & Methodology: can I see what is proof, what is private-gated, what is methodology, and what is model output?

The current three-view architecture is the right foundation. The next work should repair wording, hierarchy, and gate-status precision without flattening the three views or removing the full memo from Route View.
