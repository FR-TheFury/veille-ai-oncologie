
import { useState } from 'react';
import { Rss, ExternalLink, Calendar, Plus, Trash2, Eye, ArrowRight, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FeedDetail from './FeedDetail';
import { useRSSFeeds, useAddRSSFeed, useFetchArticles } from '@/hooks/useRSSFeeds';

const RSSFeedList = () => {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const { data: feeds = [], isLoading } = useRSSFeeds();
  const addFeedMutation = useAddRSSFeed();
  const fetchArticlesMutation = useFetchArticles();

  // Extraire les catégories uniques des flux
  const categories = ['Tous', ...Array.from(new Set(feeds.map(feed => feed.categories?.name).filter(Boolean)))];
  
  const filteredFeeds = selectedCategory === 'Tous' 
    ? feeds 
    : feeds.filter(feed => feed.categories?.name === selectedCategory);

  const selectedFeed = feeds.find(feed => feed.id === selectedFeedId);

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;
    
    try {
      await addFeedMutation.mutateAsync(newFeedUrl.trim());
      setNewFeedUrl('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du flux:', error);
    }
  };

  const handleRefreshFeed = async (feedId: string) => {
    try {
      await fetchArticlesMutation.mutateAsync(feedId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  if (selectedFeed) {
    return <FeedDetail feed={selectedFeed} onBack={() => setSelectedFeedId(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement des flux RSS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Flux RSS - IA & Oncologie
          </h2>
          <p className="text-muted-foreground mt-1">
            Suivez {feeds.length} sources spécialisées pour votre veille technologique
          </p>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="URL du flux RSS..."
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
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filtres par catégorie */}
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
              {category !== 'Tous' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {feeds.filter(feed => feed.categories?.name === category).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{feeds.length}</p>
              <p className="text-sm text-blue-600">Flux RSS</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{feeds.reduce((sum, feed) => sum + (feed.article_count || 0), 0)}</p>
              <p className="text-sm text-green-600">Articles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{categories.length - 1}</p>
              <p className="text-sm text-purple-600">Catégories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{filteredFeeds.length}</p>
              <p className="text-sm text-orange-600">Affichés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {filteredFeeds.map((feed) => (
          <Card key={feed.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-blue-500">
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
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {feed.categories?.name || 'Non catégorisé'}
                      </Badge>
                      {feed.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          Erreur
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{feed.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRefreshFeed(feed.id)}
                    disabled={fetchArticlesMutation.isPending}
                    className="hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${fetchArticlesMutation.isPending ? 'animate-spin' : ''}`} />
                    MAJ
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFeedId(feed.id)}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Détails
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(feed.url, '_blank')}
                    className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Mis à jour: {feed.last_fetched_at ? new Date(feed.last_fetched_at).toLocaleDateString() : 'Jamais'}
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
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Voir les articles
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feeds.length === 0 && (
        <div className="text-center py-12">
          <Rss className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucun flux RSS</h3>
          <p className="text-muted-foreground mb-4">Ajoutez votre premier flux RSS pour commencer votre veille.</p>
        </div>
      )}
    </div>
  );
};

export default RSSFeedList;
