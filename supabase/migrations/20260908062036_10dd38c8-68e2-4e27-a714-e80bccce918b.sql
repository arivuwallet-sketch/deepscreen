REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
DROP POLICY IF EXISTS "Users manage their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users view their own subscription" ON public.subscriptions;
CREATE POLICY "Users view their own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);