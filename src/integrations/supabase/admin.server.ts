import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Service-role Supabase client — SERVER ONLY. Bypasses row-level security
 * entirely, so it must never be imported from client code. The `.server.ts`
 * suffix ensures TanStack Start strips this file out of the client bundle,
 * the same convention already used by yahoo.server.ts.
 *
 * Requires a SUPABASE_SERVICE_ROLE_KEY secret in the deployment environment
 * (from the Supabase project's API settings page — never the anon/
 * publishable key, which is already public in the client bundle). Without
 * it, this throws rather than silently falling back to something insecure.
 */
export function createAdminClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add the service role key " +
        "(Supabase project → Settings → API → service_role secret) as a server-only " +
        "environment variable — it must never be exposed to the client.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
