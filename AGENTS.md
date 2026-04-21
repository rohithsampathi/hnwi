# AGENTS.md - HNWI Chronicles Frontend Law

## Canonical Role

`/Users/skyg/Desktop/Code/hnwi-chronicles` is the canonical HNWI Chronicles frontend. DM21 owns this repo.

## Routing Law

- DM21 owns frontend trust/security presentation, product surfaces, Next.js routes, UI copy, and frontend API bridges.
- DM02/Taksha owns backend architecture and enforcement in `/Users/skyg/Desktop/Code/mu`.
- Frontend DM21 must consume backend posture through approved backend APIs; it must not invent backend compliance truth.
- Do not route backend implementation work to this repo except for typed frontend contracts and proxy routes.

## Trust And Compliance Copy Law

- Do not claim SOC 2 Type 2, GDPR compliance, ISO certification, HIPAA compliance, PCI compliance, or equivalent compliance/certification unless backend posture and formal evidence support it.
- Use evidence-safe language such as `SOC 2-style controls`, `GDPR-style privacy gates`, `certification not asserted without auditor evidence`, and `privacy rights path available` until formal evidence exists.
- Security badges and privacy pages must describe the current control posture, not future certification goals.

## Backend Bridge

- DM21 frontend security posture route: `/api/dm21/security`.
- DM21 frontend exposure evaluator route: `/api/dm21/security/exposure`.
- Both routes proxy to DM02 backend surfaces under `/api/dm02/security/*` in `/Users/skyg/Desktop/Code/mu`.
