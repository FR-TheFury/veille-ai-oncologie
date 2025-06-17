
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Rss, RefreshCw, Trash2, FileText, TrendingUp, Clock, Globe, Zap } from 'lucide-react';
import { useRSSFeeds, useAddRSSFeed, useDeleteRSSFeed, useFetchArticles } from '@/hooks/useRSSFeeds';
import { useStandaloneArticles } from '@/hooks/useStandaloneArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddStandaloneArticleDialog } from './AddStandaloneArticleDialog';
import { StandaloneArticlesList } from './StandaloneArticlesList';

export function RSSFeedList() {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);
  
  const { data: feeds, isLoading } = useRSSFeeds();
  const { data: standaloneArticles } = useStandaloneArticles();
  const addFeedMutation = useAddRSSFeed();
  const deleteFeedMutation = useDeleteRSSFeed();
  const fetchArticlesMutation = useFetchArticles();

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim()) return;

    try {
      await addFeedMutation.mutateAsync(newFeedUrl.trim());
      setNewFeedUrl('');
    } catch (error) {
      // L'erreur est gérée dans le hook
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce flux RSS ? Tous les articles associés seront également supprimés.')) {
      await deleteFeedMutation.mutateAsync(feedId);
    }
  };

  const handleFetchArticles = async (feedId: string) => {
    await fetchArticlesMutation.mutateAsync(feedId);
  };

  // Calculate statistics
  const totalFeeds = feeds?.length || 0;
  const totalArticles = feeds?.reduce((sum, feed) => sum + (feed.article_count || 0), 0) || 0;
  const totalStandaloneArticles = standaloneArticles?.length || 0;
  const activeFeeds = feeds?.filter(feed => feed.status === 'active').length || 0;
  const lastUpdate = feeds?.reduce((latest, feed) => {
    if (!feed.last_fetched_at) return latest;
    const feedDate = new Date(feed.last_fetched_at);
    return !latest || feedDate > latest ? feedDate : latest;
  }, null as Date | null);

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Flux RSS</p>
                <p className="text-2xl font-bold text-blue-900">{totalFeeds}</p>
              </div>
              <Rss className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Articles RSS</p>
                <p className="text-2xl font-bold text-green-900">{totalArticles}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Articles ajoutés</p>
                <p className="text-2xl font-bold text-purple-900">{totalStandaloneArticles}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Flux actifs</p>
                <p className="text-2xl font-bold text-orange-900">{activeFeeds}</p>
                {lastUpdate && (
                  <p className="text-xs text-orange-600 mt-1">
                    MAJ: {format(lastUpdate, 'HH:mm', { locale: fr })}
                  </p>
                )}
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feeds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feeds" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            Flux RSS
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles individuels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-6">
          {/* Formulaire d'ajout de flux RSS */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Plus className="h-5 w-5" />
                Ajouter un flux RSS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="flex-1 border-blue-200 focus:border-blue-400"
                />
                <Button 
                  type="submit" 
                  disabled={addFeedMutation.isPending || !newFeedUrl.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {addFeedMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Liste des flux RSS */}
          <div className="grid gap-4">
            {feeds?.map((feed) => (
              <Card key={feed.id} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: feed.categories?.color || '#3B82F6' }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5" style={{ color: feed.categories?.color || '#3B82F6' }} />
                        {feed.title}
                      </CardTitle>
                      {feed.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{feed.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFetchArticles(feed.id)}
                        disabled={fetchArticlesMutation.isPending}
                        className="hover:bg-blue-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFeed(feed.id)}
                        disabled={deleteFeedMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800"
                    >
                      {feed.article_count || 0} articles
                    </Badge>
                    
                    {feed.categories && (
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: `${feed.categories.color}20`, 
                          color: feed.categories.color,
                          borderColor: feed.categories.color
                        }}
                        className="border"
                      >
                        {feed.categories.name}
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={feed.status === 'active' ? 'default' : 'destructive'}
                      className={feed.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {feed.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    
                    {feed.last_fetched_at && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          MAJ: {format(new Date(feed.last_fetched_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400 truncate">
                    {feed.url}
                  </div>
                  
                  {feed.error_message && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      <strong>Erreur :</strong> {feed.error_message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!feeds || feeds.length === 0) && (
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Rss className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Aucun flux RSS configuré</p>
                    <p className="text-sm text-gray-400">Ajoutez votre premier flux ci-dessus pour commencer</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          {/* Bouton d'ajout d'article */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Plus className="h-5 w-5" />
                Ajouter un article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAddArticleDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article individuel
              </Button>
              <p className="text-sm text-purple-600 mt-2">
                Ajoutez simplement l'URL, les métadonnées seront extraites automatiquement
              </p>
            </CardContent>
          </Card>

          {/* Liste des articles individuels */}
          <StandaloneArticlesList />
        </TabsContent>
      </Tabs>

      <AddStandaloneArticleDialog 
        open={showAddArticleDialog} 
        onOpenChange={setShowAddArticleDialog} 
      />
    </div>
  );
}
