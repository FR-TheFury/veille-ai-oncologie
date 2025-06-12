
-- Créer la table des catégories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des flux RSS
CREATE TABLE public.rss_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  error_message TEXT,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  relevance_score FLOAT DEFAULT 0,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feed_id, url)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre la lecture publique (pour cette application de veille)
CREATE POLICY "Allow public read access to categories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to rss_feeds" 
  ON public.rss_feeds FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to articles" 
  ON public.articles FOR SELECT 
  USING (true);

-- Politiques pour permettre les insertions/modifications (vous pourrez les ajuster selon vos besoins)
CREATE POLICY "Allow public insert to categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public insert to rss_feeds" 
  ON public.rss_feeds FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public insert to articles" 
  ON public.articles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to rss_feeds" 
  ON public.rss_feeds FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public update to articles" 
  ON public.articles FOR UPDATE 
  USING (true);

-- Insérer les catégories par défaut
INSERT INTO public.categories (name, description, color) VALUES 
  ('Revues scientifiques', 'Publications académiques et revues spécialisées', '#10B981'),
  ('Prépublications', 'Articles en prépublication (arXiv, bioRxiv, medRxiv)', '#8B5CF6'),
  ('Bases de données', 'PubMed, IEEE Xplore et autres bases de données', '#3B82F6'),
  ('Actualités', 'Actualités et magazines technologiques', '#F59E0B'),
  ('Instituts', 'Publications d''instituts de recherche', '#06B6D4'),
  ('Conférences', 'Publications de conférences et organisations', '#6366F1');

-- Créer un index pour optimiser les recherches
CREATE INDEX idx_articles_feed_id ON public.articles(feed_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at);
CREATE INDEX idx_rss_feeds_category_id ON public.rss_feeds(category_id);
