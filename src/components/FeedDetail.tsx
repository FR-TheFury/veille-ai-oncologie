
import { useState } from 'react';
import { ArrowLeft, Calendar, ExternalLink, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ArticleDetail from './ArticleDetail';

interface Feed {
  id: number;
  title: string;
  url: string;
  description: string;
  articleCount: number;
  lastUpdate: string;
  category: string;
  color: string;
}

interface Article {
  id: number;
  title: string;
  summary: string;
  publishDate: string;
  author: string;
  readTime: string;
  url: string;
}

interface FeedDetailProps {
  feed: Feed;
  onBack: () => void;
}

const FeedDetail = ({ feed, onBack }: FeedDetailProps) => {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  // Données d'exemple pour les articles
  const articles: Article[] = [
    {
      id: 1,
      title: "Deep Learning Applications in Cancer Diagnosis: Recent Advances",
      summary: "Une revue complète des dernières applications du deep learning dans le diagnostic du cancer, incluant l'analyse d'images médicales et la détection précoce.",
      publishDate: "2024-06-10",
      author: "Dr. Marie Dubois",
      readTime: "8 min",
      url: "https://example.com/article1"
    },
    {
      id: 2,
      title: "AI-Powered Precision Medicine in Oncology",
      summary: "Comment l'intelligence artificielle révolutionne la médecine personnalisée en oncologie, avec des cas d'usage concrets et des résultats prometteurs.",
      publishDate: "2024-06-09",
      author: "Prof. Jean Martin",
      readTime: "12 min",
      url: "https://example.com/article2"
    },
    {
      id: 3,
      title: "Machine Learning for Drug Discovery in Cancer Treatment",
      summary: "Les algorithmes de machine learning accélèrent la découverte de nouveaux traitements contre le cancer, réduisant les coûts et les délais.",
      publishDate: "2024-06-08",
      author: "Dr. Sophie Laurent",
      readTime: "6 min",
      url: "https://example.com/article3"
    }
  ];

  const selectedArticle = articles.find(article => article.id === selectedArticleId);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticleId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center space-x-3">
          <div className={`p-3 ${feed.color} rounded-xl shadow-lg`}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{feed.title}</h1>
            <p className="text-muted-foreground">{feed.description}</p>
          </div>
        </div>
      </div>

      {/* Statistiques du flux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Articles totaux</p>
                <p className="text-2xl font-bold text-blue-700">{feed.articleCount}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Dernière MAJ</p>
                <p className="text-lg font-bold text-green-700">{feed.lastUpdate}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Catégorie</p>
                <p className="text-lg font-bold text-purple-700">{feed.category}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des articles */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Articles récents</h2>
        
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {article.publishDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </span>
                    <span>Par {article.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedArticleId(article.id)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      Lire plus
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
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
      </div>
    </div>
  );
};

export default FeedDetail;
