import { afterEach } from "vitest";
import { vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  if (typeof document !== "undefined") document.body.replaceChildren();
});
