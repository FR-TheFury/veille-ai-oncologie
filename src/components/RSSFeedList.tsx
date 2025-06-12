
import { useState } from 'react';
import { Rss, ExternalLink, Calendar, Plus, Trash2, Eye, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FeedDetail from './FeedDetail';

const RSSFeedList = () => {
  const [feeds] = useState([
    {
      id: 1,
      title: "PubMed - AI Cancer Research",
      url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/...",
      description: "Dernières publications sur l'IA en oncologie",
      articleCount: 12,
      lastUpdate: "2024-06-12",
      category: "Recherche",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Nature Cancer AI",
      url: "https://www.nature.com/subjects/cancer/rss",
      description: "Articles Nature sur l'IA appliquée au cancer",
      articleCount: 8,
      lastUpdate: "2024-06-11",
      category: "Journal",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      id: 3,
      title: "arXiv Computer Science",
      url: "https://arxiv.org/rss/cs",
      description: "Prépublications en informatique médicale",
      articleCount: 15,
      lastUpdate: "2024-06-12",
      category: "Prépublications",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ]);

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);

  const selectedFeed = feeds.find(feed => feed.id === selectedFeedId);

  if (selectedFeed) {
    return <FeedDetail feed={selectedFeed} onBack={() => setSelectedFeedId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Flux RSS
          </h2>
          <p className="text-muted-foreground mt-1">
            Suivez vos sources de veille technologique
          </p>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="URL du flux RSS..."
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            className="w-64 bg-background/50 backdrop-blur-sm"
          />
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {feeds.map((feed) => (
          <Card key={feed.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${feed.color} rounded-xl shadow-lg`}>
                    <Rss className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-xl text-foreground group-hover:text-blue-600 transition-colors">
                        {feed.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {feed.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feed.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFeedId(feed.id)}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Détails
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300 hover:text-green-700">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Mis à jour: {feed.lastUpdate}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    {feed.articleCount} articles
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
    </div>
  );
};

export default RSSFeedList;
