CREATE TABLE IF NOT EXISTS public.pine_script_purchases (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product text NOT NULL DEFAULT 'advanced-smc-predictor',
  status text NOT NULL DEFAULT 'active',
  amount_inr numeric NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0,
  last_downloaded_at timestamptz,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pine_script_purchases TO authenticated;
GRANT ALL ON public.pine_script_purchases TO service_role;

ALTER TABLE public.pine_script_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own pine purchases" ON public.pine_script_purchases;
CREATE POLICY "Users view own pine purchases" ON public.pine_script_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own pine purchases" ON public.pine_script_purchases;
CREATE POLICY "Users create own pine purchases" ON public.pine_script_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own pine purchases" ON public.pine_script_purchases;
CREATE POLICY "Users update own pine purchases" ON public.pine_script_purchases
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);