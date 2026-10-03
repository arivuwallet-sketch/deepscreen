// Run with @electric-sql/pglite installed: node --test tests/payment-activation-sql.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const migration = read('drizzle/migrations/0001_fix_payment_activation_user_id_ambiguity.sql');
assert.equal(migration, read('supabase/migrations/20261003110000_fix_payment_activation_user_id_ambiguity.sql'));
for (const path of [
  'drizzle/migrations/0000_anchor_subscription_expiry_to_purchase_time.sql',
  'supabase/migrations/20260930170000_subscription_expiry_enforcement.sql',
]) {
  test(`repairs PostgreSQL ambiguity without changing the deployed logic: ${path}`, async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth;
        CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT coalesce(current_setting('test.role', true), 'service_role') $$;
        CREATE TABLE subscriptions (user_id uuid PRIMARY KEY, tier text, status text, started_at timestamptz, expires_at timestamptz, updated_at timestamptz);
        CREATE TABLE payment_orders (id integer PRIMARY KEY, link_id text UNIQUE, user_id uuid, tier text, status text, paid_at timestamptz, entitlement_expires_at timestamptz);
        INSERT INTO payment_orders VALUES (1, 'paid-test', '00000000-0000-0000-0000-000000000001', 'weekly', 'created', null, null);
      `);
      await db.exec(read(path).slice(read(path).indexOf('CREATE OR REPLACE FUNCTION public.activate_paid_order')));
      await assert.rejects(db.query("SELECT * FROM activate_paid_order('paid-test')"), /column reference "user_id" is ambiguous/);
      const original = (await db.query("SELECT pg_get_functiondef('activate_paid_order(text)'::regprocedure) AS body")).rows[0].body;
      await db.exec(migration);
      await db.exec(migration); // The repair is safe to reapply.
      const repaired = (await db.query("SELECT pg_get_functiondef('activate_paid_order(text)'::regprocedure) AS body")).rows[0].body;
      assert.equal(repaired, original.replace('ON CONFLICT (user_id)', 'ON CONFLICT ON CONSTRAINT subscriptions_pkey'));
      const activated = (await db.query("SELECT * FROM activate_paid_order('paid-test')")).rows[0];
      assert.equal(activated.outcome, 'activated');
      assert.equal(activated.tier, 'weekly');
      const duplicate = (await db.query("SELECT * FROM activate_paid_order('paid-test')")).rows[0];
      assert.equal(duplicate.outcome, 'already_paid');
      assert.deepEqual(duplicate.expires_at, activated.expires_at);
      await db.exec("INSERT INTO payment_orders VALUES (2, 'renewal', '00000000-0000-0000-0000-000000000001', 'monthly', 'created', null, null)");
      assert.equal((await db.query("SELECT * FROM activate_paid_order('renewal')")).rows[0].outcome, 'activated');
      assert.equal((await db.query('SELECT * FROM subscriptions')).rows.length, 1);
      await assert.rejects(db.query("SELECT * FROM activate_paid_order('missing')"), /payment order not found/);
      await db.exec("SET test.role = 'authenticated'");
      await assert.rejects(db.query("SELECT * FROM activate_paid_order('paid-test')"), /requires service_role/);
    } finally {
      await db.close();
    }
  });
}
