-- Newsletter submissions are now accepted only through the server-side
-- rate-limited function. The browser's publishable key must not be able to
-- write arbitrary rows directly.
REVOKE INSERT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon, authenticated;
GRANT INSERT (email, source) ON public.newsletter_subscribers TO service_role;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
