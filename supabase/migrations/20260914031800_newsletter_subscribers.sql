CREATE TABLE public.newsletter_subscribers (
  email TEXT PRIMARY KEY CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  source TEXT NOT NULL DEFAULT 'website',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (source = 'website');