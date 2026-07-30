import { describe, expect, it } from "vitest";

import { sql } from "../../fixtures/supabase-local";

describe("publicación editorial", () => {
  it("mantiene diez preguntas completas y bloquea cambios publicados", () => {
    expect(Number(sql("select count(*) from private.questions where status='published';"))).toBe(10);
    expect(Number(sql("select count(*) from private.questions q where q.status='published' and (select count(*) from private.question_options o where o.question_id=q.id) between 2 and 4;"))).toBe(10);
    expect(() => sql("update private.questions set prompt='alteración no autorizada' where status='published';")).toThrow();
    expect(sql("select count(*) from private.questions where prompt='alteración no autorizada';")).toBe("0");
  });
});
