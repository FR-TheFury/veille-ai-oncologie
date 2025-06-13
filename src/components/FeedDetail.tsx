
import { useState } from 'react';
import { ArrowLeft, Calendar, ExternalLink, BookOpen, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ArticleDetail from './ArticleDetail';
import { useArticles, useFetchArticles } from '@/hooks/useRSSFeeds';
import { useTranslation } from 'react-i18next';
import type { Feed } from '@/hooks/useRSSFeeds';

interface FeedDetailProps {
  feed: Feed;
  onBack: () => void;
}

const FeedDetail = ({ feed, onBack }: FeedDetailProps) => {
  const { t } = useTranslation();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const { data: articles = [], isLoading } = useArticles(feed.id);
  const fetchArticlesMutation = useFetchArticles();

  const handleRefreshFeed = async () => {
    try {
      await fetchArticlesMutation.mutateAsync(feed.id);
    } catch (error) {
      console.error('Error updating feed:', error);
    }
  };

  const selectedArticle = articles.find(article => article.id === selectedArticleId);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticleId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('feed.back')}
        </Button>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl shadow-lg`} style={{ backgroundColor: feed.categories?.color || '#3B82F6' }}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{feed.title}</h1>
            <p className="text-muted-foreground">{feed.description}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefreshFeed}
          disabled={fetchArticlesMutation.isPending}
          className="ml-auto hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
          {t('feed.update')}
        </Button>
      </div>

      {/* Feed statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">{t('feed.stats.totalArticles')}</p>
                <p className="text-2xl font-bold text-blue-700">{articles.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">{t('feed.stats.lastUpdate')}</p>
                <p className="text-lg font-bold text-green-700">
                  {feed.last_fetched_at ? new Date(feed.last_fetched_at).toLocaleDateString() : t('rss.status.never')}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">{t('feed.stats.averageScore')}</p>
                <p className="text-lg font-bold text-purple-700">
                  {articles.length > 0 
                    ? (articles.reduce((sum, article) => sum + (article.relevance_score || 0), 0) / articles.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles list */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t('feed.recentArticles')}</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>{t('feed.loadingArticles')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('feed.noArticles')}</h3>
            <p className="text-muted-foreground mb-4">{t('feed.noArticlesSubtitle')}</p>
            <Button onClick={handleRefreshFeed} disabled={fetchArticlesMutation.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
              {t('feed.fetchArticles')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="group hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground group-hover:text-blue-600 transition-colors cursor-pointer">
                        {article.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.summary}
                      </p>
                      {article.keywords && article.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Badge 
                        variant={article.relevance_score > 0.7 ? "default" : article.relevance_score > 0.5 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {t('feed.score', { score: (article.relevance_score * 100).toFixed(0) })}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {article.published_at ? t('feed.publishedOn', { 
                          date: new Date(article.published_at).toLocaleDateString() 
                        }) : t('feed.unknownDate')}
                      </span>
                      {article.author && (
                        <span>{t('feed.by', { author: article.author })}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedArticleId(article.id)}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      >
                        {t('feed.readMore')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(article.url, '_blank')}
                        className="hover:bg-green-50 hover:text-green-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedDetail;
