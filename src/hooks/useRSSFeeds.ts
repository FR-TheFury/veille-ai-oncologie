
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

        // Étape 2: Compter les articles associés
        console.log('🔢 Comptage des articles associés...');
        const { count: articleCount, error: countError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('feed_id', feedId);

        if (countError) {
          console.error('❌ Erreur lors du comptage:', countError);
        } else {
          console.log(`📊 Articles à supprimer: ${articleCount || 0}`);
        }

        // Étape 3: Supprimer tous les articles du flux
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

        // Étape 4: Supprimer le flux RSS
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

        // Étape 5: Vérifier que la suppression a bien eu lieu
        console.log('🔍 Vérification finale...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('rss_feeds')
          .select('id')
          .eq('id', feedId);

        if (verifyError) {
          console.error('❌ Erreur lors de la vérification:', verifyError);
        } else {
          console.log('🔍 Résultat vérification:', verifyData?.length === 0 ? 'Feed bien supprimé' : 'Feed encore présent !');
        }

        console.log('🎉 SUPPRESSION TERMINÉE AVEC SUCCÈS');
        return { success: true, feedTitle: feedExists.title, feedId };

      } catch (error) {
        console.error('💥 ERREUR DANS LA SUPPRESSION:', error);
        throw error;
      }
    },
    onMutate: async (feedId: string) => {
      console.log('🔄 DÉBUT onMutate - Mise à jour optimiste...');
      
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['rss-feeds'] });
      
      // Sauvegarder l'état précédent
      const previousFeeds = queryClient.getQueryData(['rss-feeds']);
      
      // Mise à jour optimiste : retirer le feed de la liste
      queryClient.setQueryData(['rss-feeds'], (old: Feed[] | undefined) => {
        if (!old) return [];
        const filtered = old.filter(feed => feed.id !== feedId);
        console.log('🎯 Feed retiré du cache, nouvelle liste:', filtered.length, 'feeds');
        return filtered;
      });
      
      console.log('✅ Mise à jour optimiste terminée');
      return { previousFeeds };
    },
    onSuccess: (data, feedId) => {
      console.log('🎉 onSuccess - Suppression réussie, mise à jour du cache...');
      
      // Forcer le rechargement des données depuis le serveur
      queryClient.refetchQueries({ queryKey: ['rss-feeds'] });
      queryClient.refetchQueries({ queryKey: ['articles'] });
      
      // Supprimer les articles liés du cache
      queryClient.removeQueries({ queryKey: ['articles', feedId] });
      
      console.log('✅ Cache mis à jour et queries invalidées');
      toast.success(`Flux RSS "${data.feedTitle}" supprimé avec succès !`);
    },
    onError: (error: any, feedId: string, context: any) => {
      console.error('🚨 onError - Restauration du cache...');
      
      // Restaurer l'état précédent en cas d'erreur
      if (context?.previousFeeds) {
        queryClient.setQueryData(['rss-feeds'], context.previousFeeds);
      }
      
      console.error('🚨 ERREUR FINALE:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
    onSettled: () => {
      console.log('🏁 onSettled - Nettoyage final...');
      // Toujours refetch pour s'assurer que les données sont à jour
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
