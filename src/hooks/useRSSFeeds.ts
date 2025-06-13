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
      
      // Récupérer les informations du feed avant suppression
      const { data: feedInfo, error: feedError } = await supabase
        .from('rss_feeds')
        .select('title')
        .eq('id', feedId)
        .single();

      if (feedError) {
        console.error('❌ Feed introuvable:', feedError);
        throw new Error('Feed introuvable');
      }

      console.log('✅ Feed trouvé:', feedInfo.title);

      // Supprimer le flux RSS (les articles seront supprimés automatiquement par CASCADE)
      console.log('🗑️ Suppression du flux RSS...');
      const { error: deleteFeedError } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', feedId);

      if (deleteFeedError) {
        console.error('❌ Erreur suppression flux:', deleteFeedError);
        throw new Error(`Erreur lors de la suppression: ${deleteFeedError.message}`);
      }

      console.log('✅ Flux RSS supprimé avec succès');
      
      return { 
        success: true, 
        feedTitle: feedInfo.title,
        feedId
      };
    },
    onMutate: async (feedId: string) => {
      console.log('🔄 Mise à jour optimiste du cache...');
      
      await queryClient.cancelQueries({ queryKey: ['rss-feeds'] });
      
      const previousFeeds = queryClient.getQueryData(['rss-feeds']);
      
      queryClient.setQueryData(['rss-feeds'], (old: Feed[] | undefined) => {
        if (!old) return [];
        return old.filter(feed => feed.id !== feedId);
      });
      
      return { previousFeeds };
    },
    onSuccess: (data, feedId) => {
      console.log('🎉 Suppression réussie !');
      
      // Invalider les caches pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.removeQueries({ queryKey: ['articles', feedId] });
      
      toast.success(`Flux "${data.feedTitle}" supprimé définitivement !`);
    },
    onError: (error: any, feedId: string, context: any) => {
      console.error('🚨 Erreur lors de la suppression:', error);
      
      // Restaurer le cache en cas d'erreur
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
