CREATE POLICY "Service role manages news cache"
ON public.news_feed_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);