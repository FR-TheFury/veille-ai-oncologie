
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'manager' | 'lecteur';
  created_at: string;
  totp_enabled?: boolean;
}

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAllUsers = async (): Promise<UserProfile[]> => {
    setIsLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Erreur lors du chargement des utilisateurs');
      setIsLoading(false);
      return [];
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      toast.error('Erreur lors du chargement des rôles');
      setIsLoading(false);
      return [];
    }

    const usersWithRoles = profiles.map(profile => ({
      ...profile,
      role: roles.find(role => role.user_id === profile.id)?.role || 'lecteur'
    }));

    setIsLoading(false);
    return usersWithRoles;
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'lecteur') => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } else {
      toast.success('Rôle mis à jour avec succès');
      
      // Log l'action
      await logAdminAction('update_user_role', userId, { new_role: newRole });
    }

    setIsLoading(false);
    return { error };
  };

  const updateUserProfile = async (userId: string, updates: { first_name?: string; last_name?: string; email?: string }) => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } else {
      toast.success('Profil mis à jour avec succès');
      
      // Log l'action
      await logAdminAction('update_user_profile', userId, updates);
    }

    setIsLoading(false);
    return { error };
  };

  const logAdminAction = async (action: string, targetUserId?: string, details?: any) => {
    const currentUser = await supabase.auth.getUser();
    
    if (currentUser.data.user) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: currentUser.data.user.id,
          target_user_id: targetUserId,
          action,
          details
        });
    }
  };

  const getAdminLogs = async () => {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        admin_profile:profiles!admin_user_id(first_name, last_name, email),
        target_profile:profiles!target_user_id(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching admin logs:', error);
      return [];
    }

    return data || [];
  };

  return {
    getAllUsers,
    updateUserRole,
    updateUserProfile,
    getAdminLogs,
    isLoading
  };
};
