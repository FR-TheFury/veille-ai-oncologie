
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Rss, RefreshCw, Trash2, FileText } from 'lucide-react';
import { useRSSFeeds, useAddRSSFeed, useDeleteRSSFeed, useFetchArticles } from '@/hooks/useRSSFeeds';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddStandaloneArticleDialog } from './AddStandaloneArticleDialog';
import { StandaloneArticlesList } from './StandaloneArticlesList';

export function RSSFeedList() {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);
  
  const { data: feeds, isLoading } = useRSSFeeds();
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={addFeedMutation.isPending || !newFeedUrl.trim()}
                >
                  {addFeedMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Liste des flux RSS */}
          <div className="grid gap-4">
            {feeds?.map((feed) => (
              <Card key={feed.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{feed.title}</CardTitle>
                      {feed.description && (
                        <p className="text-sm text-gray-600 mt-1">{feed.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFetchArticles(feed.id)}
                        disabled={fetchArticlesMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFeed(feed.id)}
                        disabled={deleteFeedMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                    <Badge variant="secondary">
                      {feed.article_count || 0} articles
                    </Badge>
                    {feed.categories && (
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: `${feed.categories.color}20`, color: feed.categories.color }}
                      >
                        {feed.categories.name}
                      </Badge>
                    )}
                    <Badge variant={feed.status === 'active' ? 'default' : 'destructive'}>
                      {feed.status}
                    </Badge>
                    {feed.last_fetched_at && (
                      <span>
                        Dernière mise à jour : {format(new Date(feed.last_fetched_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {feed.url}
                  </div>
                  {feed.error_message && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      Erreur : {feed.error_message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!feeds || feeds.length === 0) && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Aucun flux RSS configuré. Ajoutez votre premier flux ci-dessus.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          {/* Bouton d'ajout d'article */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter un article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAddArticleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article individuel
              </Button>
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
