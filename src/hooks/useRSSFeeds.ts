
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
      console.log('🔴 DÉBUT SUPPRESSION - Feed ID:', feedId);
      
      try {
        // Vérification que le feed existe d'abord
        console.log('🔍 Vérification existence du feed...');
        const { data: feedExists, error: checkError } = await supabase
          .from('rss_feeds')
          .select('id, title, url')
          .eq('id', feedId)
          .single();

        if (checkError) {
          console.error('❌ Feed introuvable:', checkError);
          throw new Error(`Feed introuvable: ${checkError.message}`);
        }

        console.log('✅ Feed trouvé:', feedExists);

        // ÉTAPE 1: Supprimer les articles associés d'abord
        console.log('🗑️ ÉTAPE 1: Suppression des articles associés...');
        const { error: deleteArticlesError, count: deletedArticlesCount } = await supabase
          .from('articles')
          .delete({ count: 'exact' })
          .eq('feed_id', feedId);

        if (deleteArticlesError) {
          console.error('❌ Erreur suppression articles:', deleteArticlesError);
          throw new Error(`Erreur lors de la suppression des articles: ${deleteArticlesError.message}`);
        }

        console.log(`✅ ${deletedArticlesCount || 0} articles supprimés`);

        // ÉTAPE 2: Supprimer le flux RSS lui-même
        console.log('🗑️ ÉTAPE 2: Suppression du flux RSS...');
        const { error: deleteFeedError, count: deletedFeedsCount } = await supabase
          .from('rss_feeds')
          .delete({ count: 'exact' })
          .eq('id', feedId);

        if (deleteFeedError) {
          console.error('❌ Erreur suppression flux:', deleteFeedError);
          throw new Error(`Erreur lors de la suppression du flux: ${deleteFeedError.message}`);
        }

        if (deletedFeedsCount === 0) {
          console.error('❌ Aucun flux supprimé - vérifiez les permissions RLS');
          throw new Error('Aucun flux n\'a été supprimé. Vérifiez les permissions.');
        }

        console.log(`✅ ${deletedFeedsCount} flux RSS supprimé`);

        // Vérification finale que le feed a bien été supprimé
        console.log('🔍 Vérification finale...');
        const { data: verifyDeleted } = await supabase
          .from('rss_feeds')
          .select('id')
          .eq('id', feedId)
          .single();

        if (verifyDeleted) {
          console.error('❌ Le flux existe encore après suppression !');
          throw new Error('Le flux n\'a pas été supprimé correctement');
        }

        console.log('🎉 SUPPRESSION CONFIRMÉE - Le flux a bien été supprimé');
        return { 
          success: true, 
          feedTitle: feedExists.title, 
          feedId,
          deletedArticles: deletedArticlesCount || 0
        };

      } catch (error) {
        console.error('💥 ERREUR DANS LA SUPPRESSION:', error);
        throw error;
      }
    },
    onMutate: async (feedId: string) => {
      console.log('🔄 Mise à jour optimiste du cache...');
      
      await queryClient.cancelQueries({ queryKey: ['rss-feeds'] });
      
      const previousFeeds = queryClient.getQueryData(['rss-feeds']);
      
      queryClient.setQueryData(['rss-feeds'], (old: Feed[] | undefined) => {
        if (!old) return [];
        const filtered = old.filter(feed => feed.id !== feedId);
        console.log('🎯 Feed retiré du cache (optimiste)');
        return filtered;
      });
      
      return { previousFeeds };
    },
    onSuccess: (data, feedId) => {
      console.log('🎉 onSuccess - Suppression réussie !');
      
      // Force le rechargement complet des données
      queryClient.refetchQueries({ queryKey: ['rss-feeds'] });
      queryClient.removeQueries({ queryKey: ['articles', feedId] });
      
      toast.success(`Flux "${data.feedTitle}" supprimé définitivement ! (${data.deletedArticles} articles supprimés)`);
    },
    onError: (error: any, feedId: string, context: any) => {
      console.error('🚨 onError - Restauration du cache...');
      
      if (context?.previousFeeds) {
        queryClient.setQueryData(['rss-feeds'], context.previousFeeds);
      }
      
      toast.error(`Erreur: ${error.message}`);
    },
    onSettled: () => {
      console.log('🏁 Nettoyage final du cache...');
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
