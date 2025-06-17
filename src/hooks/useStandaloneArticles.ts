
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StandaloneArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  author?: string;
  published_at?: string;
  keywords?: string[];
  relevance_score?: number;
  category_id?: string;
  added_by_user_id?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export interface AddStandaloneArticleData {
  title: string;
  summary?: string;
  content?: string;
  url: string;
  author?: string;
  published_at?: string;
  category_id?: string;
  keywords?: string[];
}

export function useStandaloneArticles() {
  return useQuery({
    queryKey: ['standalone-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standalone_articles')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StandaloneArticle[];
    },
  });
}

export function useAddStandaloneArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleData: AddStandaloneArticleData) => {
      const currentUser = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('standalone_articles')
        .insert({
          ...articleData,
          added_by_user_id: currentUser.data.user?.id,
          relevance_score: 0.7 // Score par défaut pour les articles ajoutés manuellement
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standalone-articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article ajouté avec succès !');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Cet article existe déjà (URL dupliquée)');
      } else {
        toast.error(`Erreur lors de l'ajout de l'article: ${error.message}`);
      }
    },
  });
}

export function useDeleteStandaloneArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('standalone_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standalone-articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article supprimé avec succès !');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });
}
