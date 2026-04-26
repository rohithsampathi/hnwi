import { pickCitationAnalysisText, pickCitationDescription } from "@/lib/development-citation";

describe("development citation payload mapping", () => {
  it("prefers full Castle brief analysis over HByte summary", () => {
    const payload = {
      summary: "Short HByte summary only.",
      castle_brief_enriched: "Full Castle brief.\nWhy This Matters\nKey Moves & Market Shifts",
      description: "Short source description.",
    };

    expect(pickCitationAnalysisText(payload)).toBe(payload.castle_brief_enriched);
    expect(pickCitationDescription(payload, payload.castle_brief_enriched)).toBe(payload.description);
  });

  it("keeps current public endpoint behavior where summary already contains the full brief", () => {
    const payload = {
      description: "HByte source summary.",
      summary: "Full Castle brief.\nWhy This Matters\nLong Term Wealth Impact",
    };

    expect(pickCitationAnalysisText(payload)).toBe(payload.summary);
    expect(pickCitationDescription(payload, payload.summary)).toBe(payload.description);
  });
});
