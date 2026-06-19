import { formatAnalysis } from "@/lib/format-text";

describe("formatAnalysis", () => {
  it("keeps Castle brief title-case sections visible in citation panels", () => {
    const analysis = formatAnalysis(`Fresh trading in Mumbai Trophy Apartment is turning local price memory into something the room can underwrite.
Committee Read: Keep the decision threshold explicit.
Why This Matters
Winners:
Buyers reading Mumbai Apartment off fresh prints: The room can price the lane before the next visible trade.
Losers:
Buyers waiting for surface confirmation: The clean pricing window narrows.
Potential Moves:
Fix the live trade basis before the lane feels obvious.
Key Moves & Market Shifts
Mumbai Apartment is setting the next price marker, not just posting another headline trade.
Long Term Wealth Impact
G2/G3: The compounding lesson is the house habit of writing the buy, hold, pass, or negotiate call.
Sentiment Tracker
HNWI Sentiment: Constructive on the evidence, not the aura.`);

    expect(analysis.summary).toContain("Fresh trading in Mumbai Trophy Apartment");
    expect(analysis.sections.map((section) => section.title)).toEqual([
      "Why This Matters",
      "Key Moves & Market Shifts",
      "Long Term Wealth Impact",
      "Sentiment Tracker",
    ]);
    expect(analysis.winners?.content[0]?.text).toContain("Buyers reading Mumbai Apartment");
    expect(analysis.losers?.content[0]?.text).toContain("Buyers waiting for surface confirmation");
    expect(analysis.potentialMoves?.content[0]?.text).toContain("Fix the live trade basis");
  });

  it("keeps v31 citation packet sections visible in citation panels", () => {
    const analysis = formatAnalysis(`HByte Summary
This is the lead decision read.
Source Summary
This is the supporting source read.
Decision Posture
Verdict: Watch Only.
Quality Read
Quality score: 9.35.
Source Fidelity
Fidelity score: 0.72.
Pattern Memory
Historic pattern memory: 3.`);

    expect(analysis.summary).toContain("This is the lead decision read.");
    expect(analysis.sections.map((section) => section.title)).toEqual([
      "Source Summary",
      "Decision Posture",
      "Quality Read",
      "Source Fidelity",
      "Pattern Memory",
    ]);
  });
});
