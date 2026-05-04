import { resolveCastleBriefCount } from "@/lib/castle-briefs/resolve-castle-brief-count";

describe("resolveCastleBriefCount", () => {
  it("prefers canonical castle brief totals", () => {
    expect(
      resolveCastleBriefCount({
        castle_briefs: { total_count: 2146 },
        developments: { total_count: 1900 },
        total: 2016,
      }),
    ).toBe(2146);
  });

  it("accepts legacy briefs alias only when it is a real count", () => {
    expect(resolveCastleBriefCount({ briefs: "2,146" })).toBe(2146);
  });

  it("does not promote zero or placeholder-shaped empty data", () => {
    expect(
      resolveCastleBriefCount({
        castle_briefs: { total_count: 0 },
        developments: { total_count: 0 },
        count: 0,
        total_count: null,
        total: undefined,
        briefs: "",
      }),
    ).toBeNull();
  });
});
