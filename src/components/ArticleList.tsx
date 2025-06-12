
import { Calendar, ExternalLink, Tag, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ArticleList = () => {
  const articles = [
    {
      id: 1,
      title: "Deep Learning Approaches for Early Cancer Detection in Medical Imaging",
      abstract: "Cette étude présente une nouvelle approche d'apprentissage profond pour la détection précoce du cancer dans l'imagerie médicale, avec une précision de 94.7%...",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Anna Kowalski"],
      journal: "Nature Machine Intelligence",
      date: "2024-06-11",
      category: "Diagnostic",
      impact: "Élevé",
      citations: 45,
      trending: true,
      doi: "10.1038/s42256-024-00847-3"
    },
    {
      id: 2,
      title: "AI-Powered Personalized Treatment Plans in Oncology",
      abstract: "Développement d'un système d'IA capable de générer des plans de traitement personnalisés basés sur les données génomiques et cliniques des patients...",
      authors: ["Dr. James Liu", "Prof. Emma Thompson"],
      journal: "The Lancet Digital Health",
      date: "2024-06-10",
      category: "Traitement",
      impact: "Élevé",
      citations: 32,
      trending: true,
      doi: "10.1016/S2589-7500(24)00098-1"
    },
    {
      id: 3,
      title: "Predictive Analytics for Immunotherapy Response in Melanoma",
      abstract: "Utilisation de l'analyse prédictive pour améliorer la sélection des patients pour l'immunothérapie dans le traitement du mélanome métastatique...",
      authors: ["Dr. Maria Garcia", "Dr. Robert Kim", "Prof. David Wilson"],
      journal: "Cancer Discovery",
      date: "2024-06-09",
      category: "Recherche",
      impact: "Modéré",
      citations: 28,
      trending: false,
      doi: "10.1158/2159-8290.CD-24-0156"
    },
    {
      id: 4,
      title: "Machine Learning in Radiation Therapy Planning",
      abstract: "Application de l'apprentissage automatique pour optimiser la planification de la radiothérapie et réduire les effets secondaires...",
      authors: ["Dr. Sophie Martin", "Prof. Alessandro Rossi"],
      journal: "International Journal of Radiation Oncology",
      date: "2024-06-08",
      category: "Traitement",
      impact: "Modéré",
      citations: 19,
      trending: false,
      doi: "10.1016/j.ijrobp.2024.06.008"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Diagnostic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Traitement': return 'bg-green-100 text-green-800 border-green-200';
      case 'Recherche': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Élevé': return 'bg-red-100 text-red-800';
      case 'Modéré': return 'bg-yellow-100 text-yellow-800';
      case 'Faible': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Articles récents</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Filtrer</Button>
          <Button variant="outline" size="sm">Trier</Button>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    <Badge className={getImpactColor(article.impact)}>
                      Impact {article.impact}
                    </Badge>
                    {article.trending && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Tendance
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight mb-3 hover:text-blue-600 cursor-pointer">
                    {article.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {article.abstract}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {article.date}
                    </span>
                    <span>{article.journal}</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {article.citations} citations
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Auteurs: {article.authors.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Lire
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Tag className="w-3 h-3 mr-1" />
                    Sauver
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Charger plus d'articles</Button>
      </div>
    </div>
  );
};

export default ArticleList;
