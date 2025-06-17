
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      toast.success('Email de récupération envoyé ! Vérifiez votre boîte mail.');
    }

    setIsLoading(false);
    return { error };
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      toast.success('Mot de passe mis à jour avec succès !');
    }

    setIsLoading(false);
    return { error };
  };

  return {
    requestPasswordReset,
    updatePassword,
    isLoading
  };
};
