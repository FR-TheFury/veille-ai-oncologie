
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

// Nouvelle interface pour tous les articles (RSS + individuels)
export interface CombinedArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  author: string;
  published_at: string;
  relevance_score: number;
  keywords: string[];
  created_at: string;
  feed_id?: string; // Présent pour les articles RSS
  added_by_user_id?: string; // Présent pour les articles individuels
  source_type: 'rss' | 'standalone';
  categories?: {
    name: string;
    color: string;
  };
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

// Nouvelle fonction pour récupérer tous les articles (RSS + individuels)
export function useAllArticles(feedId?: string) {
  return useQuery({
    queryKey: ['all-articles', feedId],
    queryFn: async () => {
      // Récupérer les articles RSS
      let rssQuery = supabase
        .from('articles')
        .select(`
          *,
          rss_feeds!inner(
            categories(name, color)
          )
        `)
        .order('published_at', { ascending: false });

      if (feedId) {
        rssQuery = rssQuery.eq('feed_id', feedId);
      }

      const { data: rssArticles, error: rssError } = await rssQuery;
      if (rssError) throw rssError;

      // Récupérer les articles individuels seulement si aucun feed spécifique n'est demandé
      let standaloneArticles: any[] = [];
      if (!feedId) {
        const { data: standaloneData, error: standaloneError } = await supabase
          .from('standalone_articles')
          .select(`
            *,
            categories(name, color)
          `)
          .order('published_at', { ascending: false });

        if (standaloneError) throw standaloneError;
        standaloneArticles = standaloneData || [];
      }

      // Combiner et formatter les articles
      const combinedArticles: CombinedArticle[] = [
        ...rssArticles.map(article => ({
          ...article,
          source_type: 'rss' as const,
          categories: article.rss_feeds?.categories
        })),
        ...standaloneArticles.map(article => ({
          ...article,
          feed_id: undefined,
          source_type: 'standalone' as const
        }))
      ];

      // Trier par date de publication
      return combinedArticles.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at);
        const dateB = new Date(b.published_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
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
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
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
      
      // Annuler toutes les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['rss-feeds'] });
      await queryClient.cancelQueries({ queryKey: ['all-articles'] });
      await queryClient.cancelQueries({ queryKey: ['articles', feedId] });
      
      // Sauvegarder les données actuelles pour rollback
      const previousFeeds = queryClient.getQueryData(['rss-feeds']);
      const previousAllArticles = queryClient.getQueryData(['all-articles']);
      
      // Mise à jour optimiste des feeds
      queryClient.setQueryData(['rss-feeds'], (old: Feed[] | undefined) => {
        if (!old) return [];
        return old.filter(feed => feed.id !== feedId);
      });
      
      // Mise à jour optimiste des articles
      queryClient.setQueryData(['all-articles'], (old: CombinedArticle[] | undefined) => {
        if (!old) return [];
        return old.filter(article => article.feed_id !== feedId);
      });
      
      return { previousFeeds, previousAllArticles };
    },
    onSuccess: (data, feedId) => {
      console.log('🎉 Suppression réussie !');
      
      // Invalider et refetch toutes les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
      queryClient.removeQueries({ queryKey: ['articles', feedId] });
      
      toast.success(`Flux "${data.feedTitle}" supprimé définitivement !`);
    },
    onError: (error: any, feedId: string, context: any) => {
      console.error('🚨 Erreur lors de la suppression:', error);
      
      // Restaurer le cache en cas d'erreur
      if (context?.previousFeeds) {
        queryClient.setQueryData(['rss-feeds'], context.previousFeeds);
      }
      if (context?.previousAllArticles) {
        queryClient.setQueryData(['all-articles'], context.previousAllArticles);
      }
      
      toast.error(`Erreur: ${error.message}`);
    },
    onSettled: () => {
      console.log('🏁 Nettoyage final du cache...');
      // Forcer le rechargement de toutes les données
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
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
