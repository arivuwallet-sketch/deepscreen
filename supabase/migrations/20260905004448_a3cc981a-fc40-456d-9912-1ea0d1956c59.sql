CREATE TABLE public.screener_ratios (
  exchange TEXT NOT NULL CHECK (exchange IN ('NSE', 'BSE')),
  symbol TEXT NOT NULL,
  resolved_slug TEXT,
  ratios JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (exchange, symbol)
);
GRANT SELECT ON public.screener_ratios TO anon, authenticated;
GRANT ALL ON public.screener_ratios TO service_role;
ALTER TABLE public.screener_ratios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cached market ratios" ON public.screener_ratios FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX screener_ratios_fetched_at_idx ON public.screener_ratios (fetched_at);