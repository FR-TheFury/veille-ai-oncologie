
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
