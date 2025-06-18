
import { useState } from 'react';
import { Plus, RefreshCw, Trash2, ExternalLink, Calendar, User, BookOpen, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRSSFeeds, useAddRSSFeed, useDeleteRSSFeed, useFetchArticles, useAllArticles } from '@/hooks/useRSSFeeds';
import { useStandaloneArticles } from '@/hooks/useStandaloneArticles';
import { AddStandaloneArticleDialog } from '@/components/AddStandaloneArticleDialog';
import { StandaloneArticlesList } from '@/components/StandaloneArticlesList';
import FeedDetail from '@/components/FeedDetail';
import ArticleDetail from '@/components/ArticleDetail';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Feed } from '@/hooks/useRSSFeeds';

export function RSSFeedList() {
  const { t, i18n } = useTranslation();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [feedToDelete, setFeedToDelete] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [showStandaloneDialog, setShowStandaloneDialog] = useState(false);
  const [showStandaloneArticles, setShowStandaloneArticles] = useState(false);

  const { data: rssFeeds, isLoading: isLoadingFeeds } = useRSSFeeds();
  const { data: standaloneArticles } = useStandaloneArticles();
  const { data: allArticles } = useAllArticles();
  const addFeedMutation = useAddRSSFeed();
  const deleteFeedMutation = useDeleteRSSFeed();
  const fetchArticlesMutation = useFetchArticles();
  const { user, canManageContent } = useAuth();

  // Déterminer la locale pour date-fns selon la langue actuelle
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  console.log('🔍 Debug auth state:', { user: !!user, canManage: canManageContent() });

  // Si un flux est sélectionné, afficher les détails du flux
  if (selectedFeed) {
    return <FeedDetail feed={selectedFeed} onBack={() => setSelectedFeed(null)} />;
  }

  // Si un article est sélectionné, l'afficher
  if (selectedArticleId && allArticles) {
    const selectedArticle = allArticles.find(article => article.id === selectedArticleId);
    if (selectedArticle) {
      // Convertir CombinedArticle vers Article pour ArticleDetail
      const articleForDetail = {
        ...selectedArticle,
        feed_id: selectedArticle.feed_id || '',
        key_points: [],
        keywords: selectedArticle.keywords || [],
      };
      return (
        <ArticleDetail 
          article={articleForDetail} 
          onBack={() => setSelectedArticleId(null)} 
        />
      );
    }
  }

  // Si on affiche les articles individuels
  if (showStandaloneArticles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowStandaloneArticles(false)}
              className="hover:bg-gray-50"
            >
              ← {t('rss.actions.backToFeeds')}
            </Button>
            <h2 className="text-2xl font-bold">{t('standalone.title')}</h2>
          </div>
          {canManageContent() && (
            <Button
              onClick={() => setShowStandaloneDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('rss.actions.addArticle')}
            </Button>
          )}
        </div>
        <StandaloneArticlesList />
        <AddStandaloneArticleDialog
          open={showStandaloneDialog}
          onOpenChange={setShowStandaloneDialog}
        />
      </div>
    );
  }

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) {
      toast.error(t('rss.messages.enterValidUrl'));
      return;
    }

    try {
      await addFeedMutation.mutateAsync(newFeedUrl.trim());
      setNewFeedUrl('');
    } catch (error) {
      console.error('Error adding feed:', error);
    }
  };

  const handleDelete = async () => {
    if (!feedToDelete) return;

    console.log('🗑️ Attempting to delete feed:', feedToDelete);
    
    try {
      await deleteFeedMutation.mutateAsync(feedToDelete);
      setFeedToDelete(null);
      toast.success(t('rss.messages.feedDeletedSuccess'));
    } catch (error) {
      console.error('❌ Error deleting feed:', error);
      toast.error(t('rss.messages.feedDeleteError'));
    }
  };

  const handleRefreshFeed = async (feedId: string) => {
    try {
      await fetchArticlesMutation.mutateAsync(feedId);
    } catch (error) {
      console.error('Error updating feed:', error);
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header avec statistiques */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('rss.mainTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('rss.mainSubtitle')}
          </p>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{rssFeeds?.length || 0}</div>
                <div className="text-sm text-blue-700">{t('rss.stats.feeds')}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{standaloneArticles?.length || 0}</div>
                <div className="text-sm text-purple-700">{t('rss.stats.standaloneArticles')}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{allArticles?.length || 0}</div>
                <div className="text-sm text-green-700">{t('rss.stats.totalArticles')}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          {canManageContent() && (
            <div className="flex gap-2">
              <Input
                placeholder={t('rss.addPlaceholder')}
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="min-w-80"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeed()}
              />
              <Button
                onClick={handleAddFeed}
                disabled={addFeedMutation.isPending || !newFeedUrl.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addFeedMutation.isPending ? t('rss.actions.adding') : t('rss.addFeed')}
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowStandaloneArticles(true)}
            className="hover:bg-purple-50 border-purple-200"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {t('standalone.title')} ({standaloneArticles?.length || 0})
          </Button>
        </div>

        {/* Liste des flux RSS */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">{t('rss.title')}</h2>
          
          {isLoadingFeeds ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !rssFeeds || rssFeeds.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">{t('rss.noFeeds')}</p>
                  <p className="text-sm text-gray-400">{t('rss.noFeedsSubtitle')}</p>
                  {canManageContent() ? (
                    <p className="text-sm text-gray-400 mt-2">
                      {t('rss.noFeedsForAdmins')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">
                      {t('rss.noFeedsForUsers')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rssFeeds.map((feed, index) => {
                const gradients = [
                  'from-blue-50 to-cyan-50 border-blue-200',
                  'from-purple-50 to-pink-50 border-purple-200', 
                  'from-green-50 to-emerald-50 border-green-200',
                  'from-orange-50 to-red-50 border-orange-200',
                  'from-indigo-50 to-purple-50 border-indigo-200'
                ];
                const gradientClass = gradients[index % gradients.length];

                return (
                  <Card 
                    key={feed.id} 
                    className={`hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${gradientClass} border-l-4 hover:scale-[1.01]`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg line-clamp-2 flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {feed.title}
                        </CardTitle>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFeed(feed)}
                            className="hover:bg-blue-50 border-blue-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(feed.url, '_blank')}
                                className="hover:bg-green-50 border-green-200"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-all">{feed.url}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshFeed(feed.id)}
                            disabled={fetchArticlesMutation.isPending}
                            className="hover:bg-yellow-50 border-yellow-200"
                          >
                            <RefreshCw className={`h-4 w-4 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          {canManageContent() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('🔴 Setting feed to delete:', feed.id);
                                setFeedToDelete(feed.id);
                              }}
                              disabled={deleteFeedMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {feed.description && (
                        <div className="p-3 bg-white/60 rounded-lg border border-white/40">
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                            {feed.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-3 items-center text-sm">
                        <div className="flex items-center gap-1 text-gray-600 bg-white/40 px-2 py-1 rounded">
                          <BookOpen className="h-3 w-3" />
                          <span className="font-medium">
                            {t('rss.status.articlesCount', { count: feed.article_count || 0 })}
                          </span>
                        </div>
                        
                        {feed.last_fetched_at && (
                          <div className="flex items-center gap-1 text-gray-600 bg-white/40 px-2 py-1 rounded">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {t('rss.status.lastUpdated', { 
                                date: format(new Date(feed.last_fetched_at), 'dd MMM yyyy', { locale: dateLocale }) 
                              })}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-gray-600 bg-white/40 px-2 py-1 rounded">
                          <div className={`h-2 w-2 rounded-full ${feed.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="capitalize">
                            {feed.status === 'active' ? t('rss.status.active') : t('rss.status.inactive')}
                          </span>
                        </div>
                        
                        {feed.categories && (
                          <Badge 
                            variant="secondary" 
                            className="border"
                            style={{ 
                              backgroundColor: `${feed.categories.color}20`, 
                              color: feed.categories.color,
                              borderColor: feed.categories.color
                            }}
                          >
                            {feed.categories.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 bg-white/30 px-2 py-1 rounded">
                        🔗 {truncateUrl(feed.url)}
                      </div>

                      {feed.error_message && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-200">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{feed.error_message}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Articles récents */}
        {allArticles && allArticles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{t('feed.recentArticles')}</h2>
            <div className="grid gap-4">
              {allArticles.slice(0, 6).map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{article.title}</h3>
                        {article.summary && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {article.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{article.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(article.published_at || article.created_at), 'dd MMM yyyy', { locale: dateLocale })}
                            </span>
                          </div>
                          {article.source_type && (
                            <Badge variant="outline" className="text-xs">
                              {article.source_type === 'rss' ? 'RSS' : t('standalone.title')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedArticleId(article.id)}
                        className="hover:bg-blue-50 border-blue-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <AlertDialog open={!!feedToDelete} onOpenChange={() => setFeedToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('rss.messages.confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('rss.messages.confirmDeleteMessage')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteFeedMutation.isPending}
              >
                {deleteFeedMutation.isPending ? t('rss.actions.deleting') : t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
