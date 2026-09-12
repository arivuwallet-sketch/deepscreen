CREATE TABLE public.news_feed_cache (
  query_key TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.news_feed_cache TO service_role;
ALTER TABLE public.news_feed_cache ENABLE ROW LEVEL SECURITY;
CREATE INDEX news_feed_cache_fetched_at_idx ON public.news_feed_cache (fetched_at);