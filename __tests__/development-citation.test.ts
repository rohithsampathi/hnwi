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

  it("replaces a truncated HByte opener with the full HByte summary when available", () => {
    const payload = {
      hbyte_summary:
        "Beckwith found the listing online, visited in person, \"fell in love with it,\" and plans to transform it into a holiday resort with luxury villas, apartments, restaurants, and a spa.",
      summary:
        "HByte Summary\nBeckwith found the listing online, visited in person, \"fell in love with it,\" and plans to transform it into a holiday resort with luxury villas, apartments, restauran..\n\nWhy This Matters\nWinners\nCommittees grounding the trade in fresh evidence.",
    };

    expect(pickCitationAnalysisText(payload)).toBe(
      "HByte Summary\nBeckwith found the listing online, visited in person, \"fell in love with it,\" and plans to transform it into a holiday resort with luxury villas, apartments, restaurants, and a spa.\n\nWhy This Matters\nWinners\nCommittees grounding the trade in fresh evidence."
    );
  });

  it("uses a matching full description to repair a truncated HByte opener", () => {
    const payload = {
      description:
        "Beckwith found the listing online, visited in person, \"fell in love with it,\" and plans to transform it into a holiday resort with luxury villas, apartments, restaurants, and a spa.",
      summary:
        "HByte Summary\nBeckwith found the listing online, visited in person, \"fell in love with it,\" and plans to transform it into a holiday resort with luxury villas, apartments, restauran..\n\nWhy This Matters\nWinners\nCommittees grounding the trade in fresh evidence.",
    };

    expect(pickCitationAnalysisText(payload)).toContain("restaurants, and a spa.");
    expect(pickCitationAnalysisText(payload)).toContain("Why This Matters");
  });

  it("does not reuse HByte as the short source description", () => {
    const payload = {
      hbyte_summary: "The useful question is whether this changes the next bid.",
      summary: "The useful question is whether this changes the next bid.",
    };

    expect(pickCitationDescription(payload, pickCitationAnalysisText(payload))).toBe("");
  });
});
