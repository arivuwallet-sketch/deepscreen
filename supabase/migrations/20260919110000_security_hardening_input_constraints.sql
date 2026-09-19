-- Database-level input constraints: RLS controls who may access rows;
-- these checks control what values can ever be stored.

ALTER TABLE public.watchlist
  DROP CONSTRAINT IF EXISTS watchlist_exchange_check,
  DROP CONSTRAINT IF EXISTS watchlist_symbol_length_check,
  DROP CONSTRAINT IF EXISTS watchlist_name_length_check,
  DROP CONSTRAINT IF EXISTS watchlist_buy_price_check;

ALTER TABLE public.watchlist
  ADD CONSTRAINT watchlist_exchange_check
    CHECK (exchange IN ('NSE', 'BSE', 'NYSE', 'NASDAQ', 'LSE')),
  ADD CONSTRAINT watchlist_symbol_length_check
    CHECK (char_length(symbol) BETWEEN 1 AND 32),
  ADD CONSTRAINT watchlist_name_length_check
    CHECK (char_length(name) <= 160),
  ADD CONSTRAINT watchlist_buy_price_check
    CHECK (buy_price IS NULL OR (buy_price >= 0 AND buy_price < 1000000000000));

ALTER TABLE public.alert_preferences
  DROP CONSTRAINT IF EXISTS alert_preferences_email_length_check,
  DROP CONSTRAINT IF EXISTS alert_preferences_email_check,
  DROP CONSTRAINT IF EXISTS alert_preferences_send_hour_check;

ALTER TABLE public.alert_preferences
  ADD CONSTRAINT alert_preferences_email_length_check
    CHECK (char_length(email) <= 254),
  ADD CONSTRAINT alert_preferences_email_check
    CHECK (email = '' OR email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  ADD CONSTRAINT alert_preferences_send_hour_check
    CHECK (send_hour_utc BETWEEN 0 AND 23);

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_expiry_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_expiry_check
    CHECK (expires_at > started_at);
