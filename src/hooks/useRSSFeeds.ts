import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Feed {
  id: string;
  title: string;
  url: string;
  description: string;
  category_id: string;
  last_fetched_at: string;
  status: string;
  error_message: string;
  article_count: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export interface Article {
  id: string;
  feed_id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  author: string;
  published_at: string;
  relevance_score: number;
  keywords: string[];
  key_points?: string[];
  created_at: string;
}

export function useRSSFeeds() {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feed[];
    },
  });
}

export function useArticles(feedId?: string) {
  return useQuery({
    queryKey: ['articles', feedId],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (feedId) {
        query = query.eq('feed_id', feedId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!feedId,
  });
}

export function useAddRSSFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      const { data, error } = await supabase.functions.invoke('add-rss-feed', {
        body: { url }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      toast.success(data.message || 'Flux RSS ajouté avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du flux RSS');
    },
  });
}

export function useDeleteRSSFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedId: string) => {
      console.log('🔴 DÉBUT SUPPRESSION DIRECTE - Feed ID:', feedId);
      
      try {
        // Étape 1: Vérifier que le feed existe
        console.log('🔍 Vérification existence du feed...');
        const { data: feedExists, error: checkError } = await supabase
          .from('rss_feeds')
          .select('id, title')
          .eq('id', feedId)
          .single();

        if (checkError) {
          console.error('❌ Erreur lors de la vérification du feed:', checkError);
          throw new Error(`Feed introuvable: ${checkError.message}`);
        }

        console.log('✅ Feed trouvé:', feedExists);

        // Étape 2: Supprimer tous les articles du flux d'abord (relation)
        console.log('🗑️ Suppression des articles...');
        const { error: articlesError } = await supabase
          .from('articles')
          .delete()
          .eq('feed_id', feedId);

        if (articlesError) {
          console.error('❌ Erreur lors de la suppression des articles:', articlesError);
          throw new Error(`Erreur suppression articles: ${articlesError.message}`);
        }
        console.log('✅ Articles supprimés avec succès');

        // Étape 3: Supprimer le flux RSS
        console.log('🗑️ Suppression du flux RSS...');
        const { error: feedError } = await supabase
          .from('rss_feeds')
          .delete()
          .eq('id', feedId);

        if (feedError) {
          console.error('❌ Erreur lors de la suppression du flux:', feedError);
          throw new Error(`Erreur suppression flux: ${feedError.message}`);
        }
        console.log('✅ Flux RSS supprimé avec succès');

        console.log('🎉 SUPPRESSION RÉUSSIE');
        return { success: true, feedTitle: feedExists.title, feedId };

      } catch (error) {
        console.error('💥 ERREUR DANS LA SUPPRESSION:', error);
        throw error;
      }
    },
    onMutate: async (feedId: string) => {
      console.log('🔄 DÉBUT onMutate - Mise à jour optimiste...');
      
      await queryClient.cancelQueries({ queryKey: ['rss-feeds'] });
      
      const previousFeeds = queryClient.getQueryData(['rss-feeds']);
      
      queryClient.setQueryData(['rss-feeds'], (old: Feed[] | undefined) => {
        if (!old) return [];
        const filtered = old.filter(feed => feed.id !== feedId);
        console.log('🎯 Feed retiré du cache optimiste, nouvelle liste:', filtered.length, 'feeds');
        return filtered;
      });
      
      console.log('✅ Mise à jour optimiste terminée');
      return { previousFeeds };
    },
    onSuccess: (data, feedId) => {
      console.log('🎉 onSuccess - Suppression réussie !');
      
      // Force le rechargement des données
      queryClient.refetchQueries({ queryKey: ['rss-feeds'] });
      queryClient.removeQueries({ queryKey: ['articles', feedId] });
      
      console.log('✅ Cache mis à jour');
      toast.success(`Flux RSS "${data.feedTitle}" supprimé avec succès !`);
    },
    onError: (error: any, feedId: string, context: any) => {
      console.error('🚨 onError - Suppression échouée, restauration...');
      
      if (context?.previousFeeds) {
        queryClient.setQueryData(['rss-feeds'], context.previousFeeds);
      }
      
      console.error('🚨 ERREUR FINALE:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
    onSettled: () => {
      console.log('🏁 onSettled - Nettoyage final...');
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    }
  });
}

export function useFetchArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedId: string) => {
      const { data, error } = await supabase.functions.invoke('fetch-articles', {
        body: { feedId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      toast.success(data.message || 'Articles mis à jour !');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des articles');
    },
  });
}
