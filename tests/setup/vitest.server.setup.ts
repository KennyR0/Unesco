import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("TZ", "UTC");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
