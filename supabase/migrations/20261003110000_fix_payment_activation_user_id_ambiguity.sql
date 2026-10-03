-- Fix the RETURNS TABLE user_id variable colliding with the UPSERT target.
-- Patch the installed body so this repair does not change entitlement rules,
-- payment timestamps, permissions, or previously recorded payments.
DO $migration$
DECLARE
  v_definition text;
BEGIN
  v_definition := pg_get_functiondef('public.activate_paid_order(text)'::regprocedure);
  IF position('ON CONFLICT (user_id)' IN v_definition) > 0 THEN
    EXECUTE replace(
      v_definition,
      'ON CONFLICT (user_id)',
      'ON CONFLICT ON CONSTRAINT subscriptions_pkey'
    );
  ELSIF position('ON CONFLICT ON CONSTRAINT subscriptions_pkey' IN v_definition) = 0 THEN
    RAISE EXCEPTION 'Unexpected activate_paid_order definition; inspect before applying repair';
  END IF;
END
$migration$;
