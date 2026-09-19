ALTER TABLE public.payment_orders
  DROP CONSTRAINT IF EXISTS payment_orders_status_check;

ALTER TABLE public.payment_orders
  ADD CONSTRAINT payment_orders_status_check
    CHECK (status IN ('created', 'pending', 'paid', 'underpaid', 'failed', 'expired'));

CREATE OR REPLACE FUNCTION public.activate_payment_order(p_link_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_row public.payment_orders%ROWTYPE;
  subscription_row public.subscriptions%ROWTYPE;
  plan_days INTEGER;
  now_ts TIMESTAMPTZ := now();
  base_ts TIMESTAMPTZ;
BEGIN
  IF p_link_id IS NULL OR length(p_link_id) > 64 THEN
    RETURN FALSE;
  END IF;

  SELECT *
    INTO payment_row
    FROM public.payment_orders
   WHERE link_id = p_link_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF payment_row.status = 'paid' AND payment_row.activated_at IS NOT NULL THEN
    RETURN TRUE;
  END IF;

  IF payment_row.status NOT IN ('created', 'pending') THEN
    RETURN FALSE;
  END IF;

  CASE payment_row.tier
    WHEN 'weekly' THEN plan_days := 7;
    WHEN 'monthly' THEN plan_days := 30;
    WHEN 'annual' THEN plan_days := 365;
    ELSE RETURN FALSE;
  END CASE;

  SELECT *
    INTO subscription_row
    FROM public.subscriptions
   WHERE user_id = payment_row.user_id
   FOR UPDATE;

  IF FOUND
     AND subscription_row.status = 'active'
     AND subscription_row.expires_at > now_ts
  THEN
    base_ts := subscription_row.expires_at;
  ELSE
    base_ts := now_ts;
  END IF;

  INSERT INTO public.subscriptions (
    user_id, tier, status, started_at, expires_at, updated_at
  )
  VALUES (
    payment_row.user_id,
    payment_row.tier,
    'active',
    now_ts,
    base_ts + make_interval(days => plan_days),
    now_ts
  )
  ON CONFLICT (user_id) DO UPDATE
    SET tier = EXCLUDED.tier,
        status = 'active',
        started_at = EXCLUDED.started_at,
        expires_at = EXCLUDED.expires_at,
        updated_at = EXCLUDED.updated_at;

  UPDATE public.payment_orders
     SET status = 'paid',
         activated_at = now_ts
   WHERE id = payment_row.id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_payment_order(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_payment_order(TEXT) TO service_role;
