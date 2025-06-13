
-- Ajouter une politique DELETE pour la table rss_feeds
CREATE POLICY "Allow public delete to rss_feeds" 
  ON public.rss_feeds FOR DELETE 
  USING (true);

-- Ajouter une politique DELETE pour la table articles
CREATE POLICY "Allow public delete to articles" 
  ON public.articles FOR DELETE 
  USING (true);
