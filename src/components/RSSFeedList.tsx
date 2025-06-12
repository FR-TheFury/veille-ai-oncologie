
import { useState } from 'react';
import { Rss, ExternalLink, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RSSFeedList = () => {
  const [feeds] = useState([
    {
      id: 1,
      title: "PubMed - AI Cancer Research",
      url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/...",
      description: "Dernières publications sur l'IA en oncologie",
      articleCount: 12,
      lastUpdate: "2024-06-12"
    },
    {
      id: 2,
      title: "Nature Cancer AI",
      url: "https://www.nature.com/subjects/cancer/rss",
      description: "Articles Nature sur l'IA appliquée au cancer",
      articleCount: 8,
      lastUpdate: "2024-06-11"
    },
    {
      id: 3,
      title: "arXiv Computer Science",
      url: "https://arxiv.org/rss/cs",
      description: "Prépublications en informatique médicale",
      articleCount: 15,
      lastUpdate: "2024-06-12"
    }
  ]);

  const [newFeedUrl, setNewFeedUrl] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Flux RSS</h2>
        <div className="flex space-x-2">
          <Input
            placeholder="URL du flux RSS..."
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            className="w-64"
          />
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {feeds.map((feed) => (
          <Card key={feed.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Rss className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feed.title}</CardTitle>
                    <p className="text-sm text-gray-600">{feed.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Mis à jour: {feed.lastUpdate}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {feed.articleCount} articles
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RSSFeedList;
