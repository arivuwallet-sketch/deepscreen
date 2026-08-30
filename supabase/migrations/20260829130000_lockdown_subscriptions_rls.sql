-- Subscriptions previously let any authenticated user INSERT/UPDATE their
-- own row directly (see the old "Users manage their own subscription"
-- policy). That meant a user could grant themselves any tier/expiry with a
-- single client-side Supabase call, with zero payment step required — the
-- pricing page's "Get Plan" button did exactly that from the browser.
--
-- Lock this down: client code can only ever READ its own subscription now.
-- All writes must go through the service-role key on the server (see
-- src/lib/billing/billing.functions.ts), which is the only place that
-- should ever mark a subscription active.

DROP POLICY IF EXISTS "Users manage their own subscription" ON public.subscriptions;

REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

CREATE POLICY "Users view their own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
