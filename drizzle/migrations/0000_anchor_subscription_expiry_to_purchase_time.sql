ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS entitlement_expires_at timestamptz;

UPDATE public.payment_orders
SET paid_at = created_at
WHERE status = 'paid' AND paid_at IS NULL;

UPDATE public.payment_orders
SET entitlement_expires_at = paid_at + CASE tier
  WHEN 'weekly' THEN interval '7 days'
  WHEN 'monthly' THEN interval '30 days'
  WHEN 'annual' THEN interval '365 days'
END
WHERE status = 'paid'
  AND paid_at IS NOT NULL
  AND tier IN ('weekly', 'monthly', 'annual');

WITH latest_paid AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    tier,
    paid_at,
    entitlement_expires_at
  FROM public.payment_orders
  WHERE status = 'paid'
    AND paid_at IS NOT NULL
    AND entitlement_expires_at IS NOT NULL
    AND tier IN ('weekly', 'monthly', 'annual')
  ORDER BY user_id, paid_at DESC, id DESC
)
UPDATE public.subscriptions AS s
SET tier = p.tier,
    started_at = p.paid_at,
    expires_at = p.entitlement_expires_at,
    status = CASE WHEN p.entitlement_expires_at > now() THEN 'active' ELSE 'cancelled' END,
    updated_at = now()
FROM latest_paid AS p
WHERE s.user_id = p.user_id;

DROP POLICY IF EXISTS "Users manage their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users view active own subscription" ON public.subscriptions;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
CREATE POLICY "Users view active own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND status = 'active' AND expires_at > now());

CREATE OR REPLACE FUNCTION public.activate_paid_order(p_link_id text)
RETURNS TABLE (outcome text, user_id uuid, tier text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.payment_orders%ROWTYPE;
  v_days integer;
  v_paid_at timestamptz := now();
  v_expires timestamptz;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'activate_paid_order requires service_role';
  END IF;

  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE link_id = p_link_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment order not found';
  END IF;

  v_days := CASE v_order.tier
    WHEN 'weekly' THEN 7
    WHEN 'monthly' THEN 30
    WHEN 'annual' THEN 365
    ELSE NULL
  END;
  IF v_days IS NULL THEN
    RAISE EXCEPTION 'invalid subscription tier';
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN QUERY SELECT
      'already_paid'::text,
      v_order.user_id,
      v_order.tier,
      v_order.entitlement_expires_at;
    RETURN;
  END IF;

  v_expires := v_paid_at + make_interval(days => v_days);

  INSERT INTO public.subscriptions (user_id, tier, status, started_at, expires_at, updated_at)
  VALUES (v_order.user_id, v_order.tier, 'active', v_paid_at, v_expires, v_paid_at)
  ON CONFLICT (user_id) DO UPDATE
  SET tier = EXCLUDED.tier,
      status = 'active',
      started_at = EXCLUDED.started_at,
      expires_at = EXCLUDED.expires_at,
      updated_at = EXCLUDED.updated_at;

  UPDATE public.payment_orders
  SET status = 'paid',
      paid_at = v_paid_at,
      entitlement_expires_at = v_expires
  WHERE id = v_order.id;

  RETURN QUERY SELECT 'activated'::text, v_order.user_id, v_order.tier, v_expires;
END
$$;

REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM anon;
REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_order(text) TO service_role;