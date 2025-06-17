
import { useState } from 'react';
import { Rss, ExternalLink, Calendar, Plus, Trash2, Eye, ArrowRight, Filter, RefreshCw, Shield, Lock, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FeedDetail from './FeedDetail';
import { useRSSFeeds, useAddRSSFeed, useFetchArticles, useDeleteRSSFeed } from '@/hooks/useRSSFeeds';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RSSFeedList = () => {
  const { t } = useTranslation();
  const { user, isAdmin, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(t('rss.categories.all'));
  const [deletingFeedId, setDeletingFeedId] = useState<string | null>(null);

  const { data: feeds = [], isLoading } = useRSSFeeds();
  const addFeedMutation = useAddRSSFeed();
  const fetchArticlesMutation = useFetchArticles();
  const deleteFeedMutation = useDeleteRSSFeed();

  // Check if user can manage feeds (admin or manager)
  const canManageFeeds = () => {
    return user && profile && (profile.role === 'admin' || profile.role === 'manager');
  };

  // Extract unique categories from feeds
  const categories = [t('rss.categories.all'), ...Array.from(new Set(feeds.map(feed => feed.categories?.name).filter(Boolean)))];
  
  const filteredFeeds = selectedCategory === t('rss.categories.all')
    ? feeds 
    : feeds.filter(feed => feed.categories?.name === selectedCategory);

  const selectedFeed = feeds.find(feed => feed.id === selectedFeedId);

  const handleAddFeed = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!canManageFeeds()) {
      return;
    }
    
    if (!newFeedUrl.trim()) return;
    
    try {
      console.log('Attempting to add RSS feed:', newFeedUrl.trim());
      await addFeedMutation.mutateAsync(newFeedUrl.trim());
      setNewFeedUrl('');
    } catch (error) {
      console.error('Error adding feed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleRefreshFeed = async (feedId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!canManageFeeds()) {
      return;
    }
    
    try {
      await fetchArticlesMutation.mutateAsync(feedId);
    } catch (error) {
      console.error('Error updating feed:', error);
    }
  };

  const handleDeleteFeed = async (feedId: string, feedTitle: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!canManageFeeds()) {
      return;
    }
    
    console.log('🎯 DÉBUT handleDeleteFeed - Feed ID:', feedId, 'Title:', feedTitle);
    
    setDeletingFeedId(feedId);
    
    try {
      console.log('🚀 Appel de la mutation de suppression...');
      await deleteFeedMutation.mutateAsync(feedId);
      console.log('✅ Mutation de suppression terminée avec succès');
    } catch (error) {
      console.error('💥 Erreur dans handleDeleteFeed:', error);
    } finally {
      setDeletingFeedId(null);
    }
  };

  const getRoleIcon = () => {
    if (!profile) return <Eye className="w-3 h-3 mr-1" />;
    
    switch (profile.role) {
      case 'admin': return <Shield className="w-3 h-3 mr-1" />;
      case 'manager': return <Settings className="w-3 h-3 mr-1" />;
      case 'lecteur': return <Eye className="w-3 h-3 mr-1" />;
      default: return <Eye className="w-3 h-3 mr-1" />;
    }
  };

  const getRoleLabel = () => {
    if (!profile) return 'Lecteur';
    
    switch (profile.role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'lecteur': return 'Lecteur';
      default: return 'Lecteur';
    }
  };

  if (selectedFeed) {
    return <FeedDetail feed={selectedFeed} onBack={() => setSelectedFeedId(null)} />;
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>{t('rss.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('rss.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('rss.subtitle').replace('{count}', feeds.length.toString())}
          </p>
          {user && (
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={profile?.role === 'admin' ? "default" : profile?.role === 'manager' ? "secondary" : "outline"} className="text-xs">
                {getRoleIcon()}
                {getRoleLabel()}
              </Badge>
              {!canManageFeeds() && (
                <p className="text-xs text-muted-foreground">
                  Vous êtes en mode lecture seule
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {user && canManageFeeds() ? (
            <>
              <Input
                placeholder={t('rss.addPlaceholder')}
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="w-64 bg-background/50 backdrop-blur-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeed()}
              />
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleAddFeed}
                disabled={addFeedMutation.isPending || !newFeedUrl.trim()}
              >
                {addFeedMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t('rss.addFeed')}
              </Button>
            </>
          ) : !user ? (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Se connecter pour gérer
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded border">
              <Lock className="w-4 h-4 inline mr-1" />
              Seuls les admins et managers peuvent ajouter des flux
            </div>
          )}
        </div>
      </div>

      {/* Display error message if add feed fails */}
      {addFeedMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Erreur lors de l'ajout du flux RSS :</p>
          <p className="text-sm mt-1">
            {addFeedMutation.error instanceof Error 
              ? addFeedMutation.error.message 
              : 'Une erreur inconnue s\'est produite'}
          </p>
        </div>
      )}

      {/* Category filters */}
      <div className="flex items-center space-x-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-gradient-to-r from-blue-600 to-purple-600" 
                : "hover:bg-blue-50 hover:border-blue-300"
              }
            >
              {category}
              {category !== t('rss.categories.all') && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {feeds.filter(feed => feed.categories?.name === category).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{feeds.length}</p>
              <p className="text-sm text-blue-600">{t('rss.stats.feeds')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{feeds.reduce((sum, feed) => sum + (feed.article_count || 0), 0)}</p>
              <p className="text-sm text-green-600">{t('rss.stats.articles')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{categories.length - 1}</p>
              <p className="text-sm text-purple-600">{t('rss.stats.categories')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{filteredFeeds.length}</p>
              <p className="text-sm text-orange-600">{t('rss.stats.displayed')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {filteredFeeds.map((feed) => {
          const isDeleting = deletingFeedId === feed.id;
          const canModify = user && canManageFeeds();
          
          return (
            <Card 
              key={feed.id} 
              className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-blue-500 ${isDeleting ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl shadow-lg`} style={{ backgroundColor: feed.categories?.color || '#3B82F6' }}>
                      <Rss className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl text-foreground group-hover:text-blue-600 transition-colors">
                          {feed.title}
                          {isDeleting && <span className="text-sm text-red-500 ml-2">(Suppression en cours...)</span>}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {feed.categories?.name || t('rss.status.uncategorized')}
                        </Badge>
                        {feed.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">
                            {t('rss.status.error')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{feed.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canModify && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRefreshFeed(feed.id)}
                        disabled={fetchArticlesMutation.isPending || isDeleting}
                        className="hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
                        {t('rss.actions.update')}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFeedId(feed.id)}
                      disabled={isDeleting}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t('rss.actions.details')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(feed.url, '_blank')}
                      disabled={isDeleting}
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {t('rss.actions.view')}
                    </Button>
                    {canModify && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isDeleting}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                            onClick={() => {
                              console.log('🔴 Bouton supprimer cliqué pour:', feed.title);
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Supprimer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le flux RSS "{feed.title}" ? 
                              Cette action supprimera également tous les articles associés et ne peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                console.log('🎯 Bouton confirmer cliqué dans la dialog pour:', feed.title);
                                handleDeleteFeed(feed.id, feed.title);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Suppression...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </>
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Mis à jour: {feed.last_fetched_at ? new Date(feed.last_fetched_at).toLocaleDateString() : t('rss.status.never')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                      {feed.article_count || 0} articles
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFeedId(feed.id)}
                      disabled={isDeleting}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {t('rss.actions.viewArticles')}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {feeds.length === 0 && (
        <div className="text-center py-12">
          <Rss className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('rss.noFeeds')}</h3>
          <p className="text-muted-foreground mb-4">{t('rss.noFeedsSubtitle')}</p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Lock className="w-4 h-4 mr-2" />
              Se connecter pour ajouter des flux
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RSSFeedList;
