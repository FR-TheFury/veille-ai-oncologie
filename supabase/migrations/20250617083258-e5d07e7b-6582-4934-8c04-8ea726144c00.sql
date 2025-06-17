
-- Ajouter le rôle 'manager' à l'enum existant
ALTER TYPE public.app_role ADD VALUE 'manager';

-- Ajouter les colonnes pour la 2FA dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN totp_secret TEXT,
ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN backup_codes TEXT[];

-- Créer une table pour les logs d'administration
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour que seuls les admins puissent voir les logs
CREATE POLICY "Admins can view admin logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Politique pour que seuls les admins puissent créer des logs
CREATE POLICY "Admins can create admin logs" 
  ON public.admin_logs 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
