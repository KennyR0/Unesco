import { describe, expect, it } from "vitest";

import { newTokenHash, resetGameData, sql, startGame } from "../../fixtures/supabase-local";

describe("retención y Cron", () => {
  it("registra job de seis horas e invalida abandonadas desde expires_at", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5, "Retention Player");
    sql(`update private.game_sessions set expires_at=now()-interval '1 hour' where session_token_hash=decode('${tokenHash}','hex');`);
    sql("select private.run_retention();");
    expect(sql(`select status from private.game_sessions where session_token_hash=decode('${tokenHash}','hex');`)).toBe("invalidated");
    expect(sql("select schedule from cron.job where jobname='antidoto-retention-six-hours';")).toBe("0 */6 * * *");
    sql("select private.run_retention();");
    expect(sql(`select count(*) from private.game_sessions where session_token_hash=decode('${tokenHash}','hex');`)).toBe("1");
  });
});
