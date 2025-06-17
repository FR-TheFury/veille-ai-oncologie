
-- Créer une table pour les articles individuels (non liés à un flux RSS)
CREATE TABLE public.standalone_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  keywords TEXT[],
  relevance_score FLOAT DEFAULT 0.5,
  category_id UUID REFERENCES public.categories(id),
  added_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.standalone_articles ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre la lecture publique
CREATE POLICY "Allow public read access to standalone_articles" 
  ON public.standalone_articles FOR SELECT 
  USING (true);

-- Politiques pour permettre l'insertion publique
CREATE POLICY "Allow public insert to standalone_articles" 
  ON public.standalone_articles FOR INSERT 
  WITH CHECK (true);

-- Politiques pour permettre la mise à jour publique
CREATE POLICY "Allow public update to standalone_articles" 
  ON public.standalone_articles FOR UPDATE 
  USING (true);

-- Politiques pour permettre la suppression publique
CREATE POLICY "Allow public delete to standalone_articles" 
  ON public.standalone_articles FOR DELETE 
  USING (true);

-- Créer un index pour optimiser les recherches
CREATE INDEX idx_standalone_articles_category_id ON public.standalone_articles(category_id);
CREATE INDEX idx_standalone_articles_published_at ON public.standalone_articles(published_at);
CREATE INDEX idx_standalone_articles_added_by_user_id ON public.standalone_articles(added_by_user_id);
