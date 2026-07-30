import { describe, expect, it } from "vitest";

import { sql } from "../../fixtures/supabase-local";

describe("seguridad de acceso Supabase", () => {
  it("no concede CRUD privado ni ejecución pública de RPC", () => {
    expect(sql("select has_schema_privilege('anon','private','USAGE');")).toBe("f");
    expect(sql("select has_table_privilege('anon','private.game_sessions','SELECT');")).toBe("f");
    expect(sql("select has_function_privilege('anon','api.start_game(text,bytea,integer)','EXECUTE');")).toBe("f");
    expect(sql("select has_function_privilege('service_role','private.run_retention()','EXECUTE');")).toBe("f");
    expect(sql("select count(*) from pg_policies where schemaname='private' and (roles::text like '%anon%' or roles::text like '%authenticated%');")).toBe("0");
  });
});
