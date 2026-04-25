import { parseDevCitations } from "@/lib/parse-dev-citations";
import { parseMessageContent } from "@/lib/utils";

describe("Ask Rohith citation handling", () => {
  it("normalizes raw DEVID references into clickable citation tags", () => {
    const { formattedText, citations } = parseDevCitations(
      "Mumbai buyer evidence DEVID: 69140374d4bca89602553549 and [DEVID - 687715d2897f634a3d251b01].",
    );

    expect(citations.map((citation) => citation.id)).toEqual([
      "69140374d4bca89602553549",
      "687715d2897f634a3d251b01",
    ]);
    expect(formattedText).toContain('data-id="69140374d4bca89602553549"');
    expect(formattedText).toContain('data-id="687715d2897f634a3d251b01"');
    expect(formattedText).not.toContain("DEVID: 69140374d4bca89602553549");
  });

  it("extracts nested backend response text instead of dumping raw response JSON", () => {
    const content = JSON.stringify({
      response: {
        narration: {
          text: "Actual buyer answer [DEVID: 69140374d4bca89602553549]",
        },
        citations: [{ type: "development", dev_id: "69140374d4bca89602553549" }],
      },
    });

    expect(parseMessageContent(content)).toBe("Actual buyer answer [DEVID: 69140374d4bca89602553549]");
  });
});
