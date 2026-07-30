import { describe, expect, it } from "vitest";

import { sql } from "../../fixtures/supabase-local";

describe("migraciones Supabase locales", () => {
  it("expone el esquema privado cerrado, catálogo aprobado y Cron", () => {
    expect(Number(sql("select count(*) from private.questions where status = 'published';"))).toBe(10);
    expect(Number(sql("select count(*) from private.question_options;"))).toBe(20);
    expect(Number(sql("select count(*) from pg_class where relnamespace = 'private'::regnamespace and relrowsecurity;"))).toBe(6);
    expect(sql("select schedule from cron.job where jobname = 'antidoto-retention-six-hours';")).toBe("0 */6 * * *");
    expect(Number(sql("select count(*) from pg_proc where pronamespace = 'api'::regnamespace and proname in ('start_game','get_game_state','submit_answer','advance_game','finish_game','get_game_result','get_leaderboard');"))).toBe(7);
  });
});
