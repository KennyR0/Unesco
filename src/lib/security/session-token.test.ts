import { describe, expect, it, vi } from "vitest";

import { createSessionToken, hashSessionToken, isSessionToken } from "./session-token";

describe("credencial anónima", () => {
  it("genera 32 bytes CSPRNG como Base64URL de 43 caracteres", () => {
    const token = createSessionToken();
    expect(token).toHaveLength(43);
    expect(isSessionToken(token)).toBe(true);
    expect(token).not.toContain("+");
    expect(token).not.toContain("/");
  });

  it("produce hash SHA-256 hexadecimal minúsculo y no registra el secreto", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const token = createSessionToken();
    const hash = hashSessionToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining(token));
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining(hash));
    spy.mockRestore();
  });
});
