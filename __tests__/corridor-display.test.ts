import {
  formatCorridorRouteTag,
  getCorridorDisplayCode,
  resolveCorridorNodeName,
} from "@/lib/corridor-display";

describe("corridor display terminology", () => {
  it("uses canonical route-label codes for current War Room corridors", () => {
    expect(getCorridorDisplayCode("San Francisco")).toBe("SF");
    expect(getCorridorDisplayCode("San Francisco, California")).toBe("SF");
    expect(getCorridorDisplayCode("Dubai")).toBe("DXB");
    expect(getCorridorDisplayCode("Dubai, UAE")).toBe("DXB");
    expect(getCorridorDisplayCode("United Arab Emirates")).toBe("DXB");
    expect(getCorridorDisplayCode("Singapore")).toBe("SG");
    expect(getCorridorDisplayCode("Sadashivpet")).toBe("SDP");
    expect(getCorridorDisplayCode("Sadashivpet, Hyderabad, Telangana")).toBe("SDP");
    expect(getCorridorDisplayCode("Sunder Nagar")).toBe("DEL");
    expect(getCorridorDisplayCode("Sundar Nagar, Delhi")).toBe("DEL");
    expect(getCorridorDisplayCode("New York, United States")).toBe("NYC");
  });

  it("formats route tags without first-three-letter fallback artifacts", () => {
    expect(formatCorridorRouteTag("San Francisco, California", "Dubai, UAE")).toBe("SF \u2192 DXB");
    expect(formatCorridorRouteTag("Texas", "Sadashivpet")).toBe("TX \u2192 SDP");
    expect(formatCorridorRouteTag("New York, United States", "Sunder Nagar, Delhi")).toBe("NYC \u2192 DEL");
  });

  it("normalizes corridor node names before plotting and popup titles", () => {
    expect(resolveCorridorNodeName("San Francisco, California")).toBe("San Francisco");
    expect(resolveCorridorNodeName("Dubai, UAE")).toBe("Dubai");
    expect(resolveCorridorNodeName("Sundar Nagar, Delhi")).toBe("Sunder Nagar");
    expect(resolveCorridorNodeName("Sunder Nagar bungalow, Delhi")).toBe("Sunder Nagar");
  });
});
