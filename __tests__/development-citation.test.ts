import {
  buildCitationSourceDevelopment,
  pickCitationAnalysisText,
  pickCitationDescription,
} from "@/lib/development-citation";

describe("development citation payload mapping", () => {
  it("leads v31 source records with HByte while preserving source sections", () => {
    const payload = {
      hbyte_summary: "The room should read this as route readiness, not a property headline.",
      summary: "This is the shorter source summary for the same record.",
      castle_original_brief: "Why This Matters\nThis gives the buyer a decision consequence.\nKey Moves & Market Shifts\nThe route should stay gated.",
      final_verdict: {
        verdict: "RESTRUCTURE",
        decision_posture: "WATCH_ONLY_UNTIL_UNDERWRITTEN",
        confidence: 0.72,
      },
      castle_quality_score: 9.35,
      castle_source_fidelity_score: 0.72,
      castle_historic_pattern_memory_count: 3,
    };
    const development = buildCitationSourceDevelopment(payload, "source-id");

    expect(development?.summaryLabel).toBe("HByte");
    expect(development?.summarySourceField).toBe("hbyte_summary");
    expect(development?.summary).toContain("HByte Summary\nThe room should read this as route readiness");
    expect(development?.summary).toContain("Why This Matters");
    expect(development?.summary).not.toContain("Source Summary");
    expect(development?.summary).not.toContain("Decision Posture");
    expect(development?.summary).not.toContain("Quality Read");
    expect(development?.summary).not.toContain("Source Fidelity");
    expect(development?.summary).not.toContain("Pattern Memory");
    expect(development?.summaryLabel).not.toContain("Castle");
  });

  it("does not fall back to public summary or full_text for v31 source records", () => {
    const payload = {
      hbyte_summary: "This is the central HByte.",
      summary: "Why This Matters\nThis public summary should not become the citation body.",
      full_text: "This legacy full_text field should not be used for v31 click content.",
      castle_quality_score: 9.1,
    };
    const development = buildCitationSourceDevelopment(payload, "source-id");

    expect(development?.summaryLabel).toBe("HByte");
    expect(development?.summary).toBe("HByte Summary\nThis is the central HByte.");
    expect(development?.summary).not.toContain("public summary");
    expect(development?.summary).not.toContain("legacy full_text");
  });

  it("fails closed when a v31 source record has no HByte or real v31 brief body", () => {
    const payload = {
      title: "Thin v31 source",
      summary: "Generic public summary.",
      description: "Generic public description.",
      castle_quality_score: 8.4,
    };

    expect(buildCitationSourceDevelopment(payload, "source-id")).toBeNull();
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
