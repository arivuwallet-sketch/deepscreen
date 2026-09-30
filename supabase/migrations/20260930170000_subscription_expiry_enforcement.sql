-- Enforce paid-plan expiry at the database boundary and make Cashfree order
-- activation idempotent. A single payment order must never extend access twice,
-- even when the browser confirmation and Cashfree webhook arrive concurrently.

ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS entitlement_expires_at timestamptz;

-- Existing paid rows predate paid_at. Their order creation time is the best
-- durable timestamp available for the original payment activation.
UPDATE public.payment_orders
SET paid_at = created_at
WHERE status = 'paid' AND paid_at IS NULL;

-- Repair subscriptions created by the current Cashfree payment-order flow.
-- The old server path could grant the same order twice in a race, so the
-- subscription expiry could be one or more plan periods too far in the future.
-- We rebuild entitlement from each distinct paid order exactly once.
--
-- Safety: skip rows whose subscription predates the first recorded Cashfree
-- order by more than five minutes. Those can be legacy/manual subscriptions
-- that payment_orders cannot fully reconstruct.
DO $$
DECLARE
  u record;
  o record;
  v_sub_created timestamptz;
  v_expiry timestamptz;
  v_start timestamptz;
  v_last_tier text;
BEGIN
  FOR u IN
    SELECT user_id, min(created_at) AS first_order_at
    FROM public.payment_orders
    WHERE status = 'paid'
      AND tier IN ('weekly', 'monthly', 'annual')
    GROUP BY user_id
  LOOP
    SELECT created_at
    INTO v_sub_created
    FROM public.subscriptions
    WHERE user_id = u.user_id;

    IF v_sub_created IS NULL OR v_sub_created < u.first_order_at - interval '5 minutes' THEN
      CONTINUE;
    END IF;

    v_expiry := NULL;
    v_last_tier := NULL;

    FOR o IN
      SELECT id, tier, created_at
      FROM public.payment_orders
      WHERE user_id = u.user_id
        AND status = 'paid'
        AND tier IN ('weekly', 'monthly', 'annual')
      ORDER BY created_at, id
    LOOP
      v_start := GREATEST(COALESCE(v_expiry, o.created_at), o.created_at);
      v_expiry := v_start + CASE o.tier
        WHEN 'weekly' THEN interval '7 days'
        WHEN 'monthly' THEN interval '30 days'
        WHEN 'annual' THEN interval '365 days'
      END;
      v_last_tier := o.tier;

      UPDATE public.payment_orders
      SET
        paid_at = COALESCE(paid_at, created_at),
        entitlement_expires_at = v_expiry
      WHERE id = o.id;
    END LOOP;

    IF v_expiry IS NOT NULL THEN
      UPDATE public.subscriptions
      SET
        tier = v_last_tier,
        expires_at = v_expiry,
        status = CASE WHEN v_expiry > now() THEN 'active' ELSE 'cancelled' END,
        updated_at = now()
      WHERE user_id = u.user_id;
    END IF;
  END LOOP;
END
$$;

-- Expired rows are not readable as active entitlements. This uses database
-- time, so changing a browser clock cannot keep Pro access unlocked.
DROP POLICY IF EXISTS "Users manage their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users view active own subscription" ON public.subscriptions;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
CREATE POLICY "Users view active own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    AND status = 'active'
    AND expires_at > now()
  );

-- One transaction owns both the payment-order state change and the subscription
-- update. SELECT ... FOR UPDATE serializes concurrent webhook/browser attempts.
CREATE OR REPLACE FUNCTION public.activate_paid_order(p_link_id text)
RETURNS TABLE (
  outcome text,
  user_id uuid,
  tier text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.payment_orders%ROWTYPE;
  v_existing public.subscriptions%ROWTYPE;
  v_days integer;
  v_now timestamptz := now();
  v_base timestamptz;
  v_expires timestamptz;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'activate_paid_order requires service_role';
  END IF;

  SELECT *
  INTO v_order
  FROM public.payment_orders
  WHERE link_id = p_link_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment order not found';
  END IF;

  IF v_order.tier = 'weekly' THEN
    v_days := 7;
  ELSIF v_order.tier = 'monthly' THEN
    v_days := 30;
  ELSIF v_order.tier = 'annual' THEN
    v_days := 365;
  ELSE
    RAISE EXCEPTION 'invalid subscription tier';
  END IF;

  -- A paid order has already contributed its duration. Return the recorded
  -- entitlement without extending anything again.
  IF v_order.status = 'paid' THEN
    RETURN QUERY
      SELECT
        'already_paid'::text,
        v_order.user_id,
        v_order.tier,
        COALESCE(
          v_order.entitlement_expires_at,
          (SELECT s.expires_at FROM public.subscriptions s WHERE s.user_id = v_order.user_id)
        );
    RETURN;
  END IF;

  SELECT *
  INTO v_existing
  FROM public.subscriptions s
  WHERE s.user_id = v_order.user_id
  FOR UPDATE;

  IF FOUND AND v_existing.status = 'active' AND v_existing.expires_at > v_now THEN
    v_base := v_existing.expires_at;
  ELSE
    v_base := v_now;
  END IF;

  v_expires := v_base + make_interval(days => v_days);

  INSERT INTO public.subscriptions (
    user_id,
    tier,
    status,
    started_at,
    expires_at,
    updated_at
  ) VALUES (
    v_order.user_id,
    v_order.tier,
    'active',
    v_now,
    v_expires,
    v_now
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    tier = EXCLUDED.tier,
    status = 'active',
    started_at = EXCLUDED.started_at,
    expires_at = EXCLUDED.expires_at,
    updated_at = EXCLUDED.updated_at;

  UPDATE public.payment_orders
  SET
    status = 'paid',
    paid_at = COALESCE(paid_at, v_now),
    entitlement_expires_at = v_expires
  WHERE id = v_order.id;

  RETURN QUERY
    SELECT 'activated'::text, v_order.user_id, v_order.tier, v_expires;
END
$$;

REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM anon;
REVOKE ALL ON FUNCTION public.activate_paid_order(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_order(text) TO service_role;
