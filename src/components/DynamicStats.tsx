
import React from 'react';
import { useRSSFeeds } from '@/hooks/useRSSFeeds';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface StatsData {
  feedCount: number;
  articleCount: number;
  categoryCount: number;
  developers: number;
}

const DynamicStats = () => {
  const { t } = useTranslation();
  const { data: feeds, isLoading: feedsLoading } = useRSSFeeds();

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = feedsLoading || articlesLoading || categoriesLoading;

  const stats: StatsData = {
    feedCount: feeds?.length || 0,
    articleCount: articles || 0,
    categoryCount: categories || 0,
    developers: 4,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="text-3xl font-bold text-gray-400 animate-pulse">---</div>
            <div className="text-sm text-gray-400">{t('stats.loading')}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div>
        <div className="text-3xl font-bold text-indigo-600">{stats.feedCount}</div>
        <div className="text-sm text-indigo-500">{t('stats.feeds')}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-purple-600">{stats.articleCount}</div>
        <div className="text-sm text-purple-500">{t('stats.articles')}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-blue-600">{stats.categoryCount}</div>
        <div className="text-sm text-blue-500">{t('stats.categories')}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-green-600">{stats.developers}</div>
        <div className="text-sm text-green-500">{t('stats.developers')}</div>
      </div>
    </div>
  );
};

export default DynamicStats;
