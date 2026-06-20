import { resolveOpportunityAnalysisText } from "@/lib/opportunity-display-fields";

describe("useOpportunities backend field mapping", () => {
  it("uses backend-native command-centre text when rows do not include analysis", () => {
    const text = resolveOpportunityAnalysisText({
      full_text: "Why This Matters\nDirect underwriting text from the backend.",
      castle_brief_enriched: "Castle enriched brief.",
      source_summary: "Source summary.",
      source_summary_structured: {
        summary_sentence: "Structured summary sentence.",
        money_anchors: [{ raw: "$71 million" }],
        evidence_basis: "live_direct_html",
      },
      description: "Short card description.",
    });

    expect(text).toContain("Why This Matters");
    expect(text).toContain("Direct underwriting text from the backend.");
    expect(text).not.toBe("Short card description.");
  });

  it("falls through to structured source summaries before short descriptions", () => {
    const text = resolveOpportunityAnalysisText({
      source_summary_structured: {
        summary_sentence: "Structured backend source summary.",
        money_anchors: [{ raw: "$42M" }],
      },
      description: "Short card description.",
    });

    expect(text).toContain("Structured backend source summary.");
    expect(text).toContain("Money anchors: $42M");
    expect(text).not.toBe("Short card description.");
  });
});
