import { normalizeCrisisData } from "@/components/decision-memo/memo/CrisisResilienceSection";

describe("normalizeCrisisData", () => {
  it("promotes populated crisis scenarios when raw live event telemetry is zero", () => {
    const normalized = normalizeCrisisData({
      event_count: 0,
      market_regime_count: 0,
      source_count: 0,
      scenarios: [
        { title: "Knowledge World witness density is thin", severity: "HIGH", sources: ["Pattern Intelligence"] },
        { title: "Client return thesis outruns corridor underwriting", severity: "HIGH", sources: ["Pattern Intelligence"] },
        { title: "Structure and banking rails must lock before SPA execution", severity: "HIGH", sources: ["Pattern Intelligence"] },
        { title: "Yield reset must use validated corridor baseline", severity: "HIGH", sources: ["Pattern Intelligence"] },
        { title: "Appreciation must use validated corridor baseline", severity: "HIGH", sources: ["Pattern Intelligence"] },
      ],
      overall_resilience: {
        score: 72,
        rating: "WATCH",
      },
    });

    expect(normalized?.signalCount).toBe(5);
    expect(normalized?.eventCount).toBe(5);
    expect(normalized?.marketRegimeCount).toBeUndefined();
    expect(normalized?.sourceCount).toBe(1);
    expect(normalized?.sourceFamilies).toEqual(["Pattern Intelligence"]);
  });

  it("keeps positive raw live event telemetry when it is present", () => {
    const normalized = normalizeCrisisData({
      event_count: 3,
      scenarios: [{ title: "Fallback scenario" }],
    });

    expect(normalized?.eventCount).toBe(3);
    expect(normalized?.signalCount).toBe(3);
  });
});
