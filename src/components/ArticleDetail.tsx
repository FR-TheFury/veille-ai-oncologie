
import { ArrowLeft, Calendar, Clock, ExternalLink, User, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: number;
  title: string;
  summary: string;
  publishDate: string;
  author: string;
  readTime: string;
  url: string;
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail = ({ article, onBack }: ArticleDetailProps) => {
  // Contenu d'exemple pour l'article
  const fullContent = `
    L'intelligence artificielle révolutionne le domaine de l'oncologie de manière spectaculaire. Les récentes avancées en deep learning permettent aux médecins de diagnostiquer certains types de cancer avec une précision dépassant parfois celle des experts humains.

    ## Applications principales

    ### Diagnostic par imagerie
    Les algorithmes de vision par ordinateur analysent les images médicales (scanners, IRM, radiographies) pour détecter des anomalies invisibles à l'œil nu. Cette technologie est particulièrement efficace pour :
    - La détection précoce du cancer du poumon
    - L'analyse des mammographies pour le cancer du sein
    - L'examen des biopsies cutanées pour le mélanome

    ### Médecine personnalisée
    L'IA permet de personnaliser les traitements en analysant :
    - Le profil génétique du patient
    - L'historique médical
    - Les caractéristiques spécifiques de la tumeur
    - La réponse aux traitements précédents

    ## Résultats prometteurs

    Les études récentes montrent des résultats encourageants :
    - Réduction de 30% des erreurs de diagnostic
    - Amélioration de 25% du taux de survie à 5 ans
    - Diminution des effets secondaires grâce aux traitements personnalisés

    ## Défis et perspectives

    Malgré ces avancées, plusieurs défis demeurent :
    - L'explicabilité des décisions de l'IA
    - La validation clinique à grande échelle
    - L'intégration dans les systèmes hospitaliers existants
    - Les questions éthiques et réglementaires

    L'avenir s'annonce prometteur avec l'émergence de nouvelles techniques comme l'apprentissage fédéré et l'IA multimodale, qui pourront analyser simultanément différents types de données médicales.
  `;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
        <Badge variant="secondary">Article</Badge>
      </div>

      {/* Contenu principal de l'article */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-2xl md:text-3xl text-foreground leading-tight">
            {article.title}
          </CardTitle>
          
          {/* Métadonnées de l'article */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {article.author}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {article.publishDate}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime} de lecture
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {/* Résumé */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Résumé
            </h3>
            <p className="text-blue-700 leading-relaxed">{article.summary}</p>
          </div>

          {/* Contenu principal */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {fullContent.split('\n').map((paragraph, index) => {
                if (paragraph.trim() === '') return <br key={index} />;
                
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-bold text-foreground mt-8 mb-4 border-b border-gray-200 pb-2">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                
                if (paragraph.trim().startsWith('- ')) {
                  return (
                    <li key={index} className="text-muted-foreground ml-4 mb-1">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }
                
                return (
                  <p key={index} className="text-foreground mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Intelligence Artificielle
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Oncologie
              </Badge>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => window.open(article.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir l'article original
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetail;
