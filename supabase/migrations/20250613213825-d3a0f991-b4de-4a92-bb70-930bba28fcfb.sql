
-- Créer un enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'lecteur');

-- Créer la table des profils utilisateur
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des rôles utilisateur
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'lecteur',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour créer automatiquement un profil et attribuer un rôle lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Insérer le profil
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Compter le nombre d'utilisateurs existants
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Le premier utilisateur devient admin, les autres deviennent lecteurs
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'lecteur');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour l'auto-création du profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Politiques RLS pour profiles
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Mettre à jour les politiques des flux RSS pour les restreindre aux admins
DROP POLICY IF EXISTS "Allow public insert to rss_feeds" ON public.rss_feeds;
DROP POLICY IF EXISTS "Allow public update to rss_feeds" ON public.rss_feeds;
DROP POLICY IF EXISTS "Allow public delete to rss_feeds" ON public.rss_feeds;

CREATE POLICY "Only admins can insert rss_feeds" 
  ON public.rss_feeds FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update rss_feeds" 
  ON public.rss_feeds FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete rss_feeds" 
  ON public.rss_feeds FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Mettre à jour les politiques des articles pour les restreindre aux admins pour les modifications
DROP POLICY IF EXISTS "Allow public insert to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public update to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public delete to articles" ON public.articles;

CREATE POLICY "Only admins can insert articles" 
  ON public.articles FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update articles" 
  ON public.articles FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete articles" 
  ON public.articles FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Mettre à jour les politiques des catégories
DROP POLICY IF EXISTS "Allow public insert to categories" ON public.categories;

CREATE POLICY "Only admins can insert categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update categories" 
  ON public.categories FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete categories" 
  ON public.categories FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));
