import { describe, expect, it } from "vitest";

import { resolveArcadeGatewayMode } from "./arcade-gateway";

describe("resolveArcadeGatewayMode", () => {
  it("defaults to memory when unset or blank", () => {
    expect(resolveArcadeGatewayMode({})).toBe("memory");
    expect(resolveArcadeGatewayMode({ ARCADE_GATEWAY: "" })).toBe("memory");
    expect(resolveArcadeGatewayMode({ ARCADE_GATEWAY: "  " })).toBe("memory");
  });

  it("accepts memory and supabase", () => {
    expect(resolveArcadeGatewayMode({ ARCADE_GATEWAY: "memory" })).toBe(
      "memory",
    );
    expect(resolveArcadeGatewayMode({ ARCADE_GATEWAY: "supabase" })).toBe(
      "supabase",
    );
  });

  it("rejects unknown values", () => {
    expect(() =>
      resolveArcadeGatewayMode({ ARCADE_GATEWAY: "redis" }),
    ).toThrow();
  });
});
