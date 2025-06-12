
import { useState } from 'react';
import { Rss, ExternalLink, Calendar, Plus, Trash2, Eye, ArrowRight, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FeedDetail from './FeedDetail';

const RSSFeedList = () => {
  const [feeds] = useState([
    // Revues scientifiques
    {
      id: 1,
      title: "Nature Cancer",
      url: "https://www.nature.com/subjects/cancer.rss",
      description: "Articles Nature sur l'IA appliquée au cancer",
      articleCount: 15,
      lastUpdate: "2024-06-12",
      category: "Revues scientifiques",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      id: 2,
      title: "Nature Medicine",
      url: "https://www.nature.com/nm.rss",
      description: "Recherches en médecine incluant l'IA médicale",
      articleCount: 12,
      lastUpdate: "2024-06-12",
      category: "Revues scientifiques",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      id: 3,
      title: "Cell",
      url: "https://www.cell.com/cell/current.rss",
      description: "Publications Cell sur la biologie du cancer et l'IA",
      articleCount: 8,
      lastUpdate: "2024-06-11",
      category: "Revues scientifiques",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      id: 4,
      title: "Science Translational Medicine",
      url: "https://www.science.org/rss/journal_stm.xml",
      description: "Médecine translationnelle et IA",
      articleCount: 10,
      lastUpdate: "2024-06-11",
      category: "Revues scientifiques",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      id: 5,
      title: "The Lancet Oncology",
      url: "https://www.thelancet.com/journals/lanonc/rss.xml",
      description: "Oncologie clinique et recherche",
      articleCount: 14,
      lastUpdate: "2024-06-11",
      category: "Revues scientifiques",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },

    // Prépublications
    {
      id: 6,
      title: "arXiv Computer Science",
      url: "https://arxiv.org/rss/cs",
      description: "Prépublications en informatique médicale",
      articleCount: 25,
      lastUpdate: "2024-06-12",
      category: "Prépublications",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      id: 7,
      title: "bioRxiv",
      url: "https://connect.biorxiv.org/biorxiv_xml.php?subject=cancer_biology",
      description: "Prépublications en biologie du cancer",
      articleCount: 18,
      lastUpdate: "2024-06-12",
      category: "Prépublications",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      id: 8,
      title: "medRxiv",
      url: "https://connect.medrxiv.org/medrxiv_xml.php?subject=oncology",
      description: "Prépublications médicales en oncologie",
      articleCount: 22,
      lastUpdate: "2024-06-12",
      category: "Prépublications",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },

    // Bases de données
    {
      id: 9,
      title: "PubMed - AI Cancer Research",
      url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/1uGOLZTlGpNJJhSnW6ZRZGLJz9dWjQ-FQIrmDYv2TaVpfUOoVR/?limit=20&utm_campaign=pubmed-2&fc=20211105010759",
      description: "Dernières publications sur l'IA en oncologie",
      articleCount: 30,
      lastUpdate: "2024-06-12",
      category: "Bases de données",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      id: 10,
      title: "IEEE Xplore - Medical AI",
      url: "https://ieeexplore.ieee.org/rss/TOC10206.RSS",
      description: "Technologies IEEE en IA médicale",
      articleCount: 16,
      lastUpdate: "2024-06-11",
      category: "Bases de données",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },

    // Actualités et magazines
    {
      id: 11,
      title: "MIT Technology Review - AI",
      url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
      description: "Actualités IA du MIT Technology Review",
      articleCount: 8,
      lastUpdate: "2024-06-12",
      category: "Actualités",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 12,
      title: "Nature News - AI",
      url: "https://www.nature.com/subjects/machine-learning.rss",
      description: "Actualités Nature sur l'apprentissage automatique",
      articleCount: 12,
      lastUpdate: "2024-06-11",
      category: "Actualités",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 13,
      title: "Science News - AI",
      url: "https://www.sciencenews.org/topic/artificial-intelligence/feed",
      description: "Actualités scientifiques sur l'IA",
      articleCount: 6,
      lastUpdate: "2024-06-11",
      category: "Actualités",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },

    // Instituts de recherche
    {
      id: 14,
      title: "NIH News - Cancer Research",
      url: "https://www.cancer.gov/rss/news.xml",
      description: "Actualités du National Cancer Institute",
      articleCount: 9,
      lastUpdate: "2024-06-10",
      category: "Instituts",
      color: "bg-gradient-to-br from-teal-500 to-teal-600"
    },
    {
      id: 15,
      title: "INSERM Actualités",
      url: "https://www.inserm.fr/actualites/feed/",
      description: "Actualités de l'INSERM sur la recherche médicale",
      articleCount: 7,
      lastUpdate: "2024-06-10",
      category: "Instituts",
      color: "bg-gradient-to-br from-teal-500 to-teal-600"
    },

    // Conférences et organisations
    {
      id: 16,
      title: "ASCO Publications",
      url: "https://ascopubs.org/action/showFeed?type=etoc&feed=rss&jc=jco",
      description: "Journal of Clinical Oncology",
      articleCount: 11,
      lastUpdate: "2024-06-09",
      category: "Conférences",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      id: 17,
      title: "MICCAI Society",
      url: "https://www.miccai.org/feed/",
      description: "Conférence sur l'imagerie médicale et l'IA",
      articleCount: 5,
      lastUpdate: "2024-06-08",
      category: "Conférences",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ]);

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const categories = ['Tous', 'Revues scientifiques', 'Prépublications', 'Bases de données', 'Actualités', 'Instituts', 'Conférences'];
  
  const filteredFeeds = selectedCategory === 'Tous' 
    ? feeds 
    : feeds.filter(feed => feed.category === selectedCategory);

  const selectedFeed = feeds.find(feed => feed.id === selectedFeedId);

  if (selectedFeed) {
    return <FeedDetail feed={selectedFeed} onBack={() => setSelectedFeedId(null)} />;
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
          />
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
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
                  {feeds.filter(feed => feed.category === category).length}
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
              <p className="text-2xl font-bold text-green-700">{feeds.reduce((sum, feed) => sum + feed.articleCount, 0)}</p>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(feed.url, '_blank')}
                    className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  >
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
