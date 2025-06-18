
import { ArrowLeft, Calendar, Clock, ExternalLink, User, BookOpen, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Article } from '@/hooks/useRSSFeeds';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail = ({ article, onBack }: ArticleDetailProps) => {
  const { t, i18n } = useTranslation();

  // Déterminer la locale pour date-fns selon la langue actuelle
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  // Contenu par défaut d'exemple pour l'article en fonction de la langue
  const getDefaultContent = () => {
    if (i18n.language === 'fr') {
      return `
L'intelligence artificielle révolutionne le domaine de l'oncologie de manière spectaculaire. Les récentes avancées en apprentissage profond permettent aux médecins de diagnostiquer certains types de cancer avec une précision qui dépasse parfois celle des experts humains.

## Applications Principales

### Imagerie Diagnostique
Les algorithmes de vision par ordinateur analysent les images médicales (scanners, IRM, radiographies) pour détecter des anomalies invisibles à l'œil nu. Cette technologie est particulièrement efficace pour :
- La détection précoce du cancer du poumon
- L'analyse de mammographies pour le cancer du sein
- L'examen de biopsies cutanées pour le mélanome

### Médecine Personnalisée
L'IA permet de personnaliser les traitements en analysant :
- Le profil génétique du patient
- L'historique médical
- Les caractéristiques spécifiques de la tumeur
- La réponse aux traitements précédents

## Résultats Prometteurs

Des études récentes montrent des résultats encourageants :
- 30% de réduction des erreurs diagnostiques
- 25% d'amélioration du taux de survie à 5 ans
- Réduction des effets secondaires grâce aux traitements personnalisés

## Défis et Perspectives

Malgré ces avancées, plusieurs défis demeurent :
- L'explicabilité des décisions de l'IA
- La validation clinique à grande échelle
- L'intégration dans les systèmes hospitaliers existants
- Les questions éthiques et réglementaires

L'avenir s'annonce prometteur avec l'émergence de nouvelles techniques comme l'apprentissage fédéré et l'IA multimodale, qui pourront analyser simultanément différents types de données médicales.
      `;
    } else {
      return `
Artificial intelligence is revolutionizing the field of oncology in spectacular ways. Recent advances in deep learning allow doctors to diagnose certain types of cancer with accuracy that sometimes exceeds that of human experts.

## Main Applications

### Diagnostic Imaging
Computer vision algorithms analyze medical images (scans, MRIs, X-rays) to detect anomalies invisible to the naked eye. This technology is particularly effective for:
- Early lung cancer detection
- Mammography analysis for breast cancer
- Skin biopsy examination for melanoma

### Personalized Medicine
AI enables treatment personalization by analyzing:
- Patient genetic profile
- Medical history
- Specific tumor characteristics
- Response to previous treatments

## Promising Results

Recent studies show encouraging results:
- 30% reduction in diagnostic errors
- 25% improvement in 5-year survival rate
- Reduction of side effects through personalized treatments

## Challenges and Perspectives

Despite these advances, several challenges remain:
- Explainability of AI decisions
- Large-scale clinical validation
- Integration into existing hospital systems
- Ethical and regulatory questions

The future looks promising with the emergence of new techniques like federated learning and multimodal AI, which will be able to simultaneously analyze different types of medical data.
      `;
    }
  };

  const fullContent = getDefaultContent();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('article.back')}
        </Button>
        <Badge variant="secondary">{t('article.article')}</Badge>
      </div>

      {/* Main article content */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-2xl md:text-3xl text-foreground leading-tight">
            {article.title}
          </CardTitle>
          
          {/* Article metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
            {article.author && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {article.author}
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {article.published_at ? 
                format(new Date(article.published_at), 'PPP', { locale: dateLocale }) : 
                t('feed.unknownDate')
              }
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {t('article.reading')}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {/* Summary */}
          {article.summary && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                {t('article.detailedSummary')}
              </h3>
              <p className="text-blue-700 leading-relaxed">{article.summary}</p>
            </div>
          )}

          {/* Key Points Section */}
          {article.key_points && article.key_points.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                {t('article.keyPoints')}
              </h3>
              <ul className="space-y-2">
                {article.key_points.map((point, index) => (
                  <li key={index} className="text-amber-700 leading-relaxed flex items-start">
                    <span className="text-amber-500 mr-2 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {article.content ? (
                article.content.split('\n').map((paragraph, index) => {
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
                })
              ) : (
                fullContent.split('\n').map((paragraph, index) => {
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
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {article.keywords && article.keywords.length > 0 ? (
                article.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {t('article.defaultKeywords.ai')}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {t('article.defaultKeywords.oncology')}
                  </Badge>
                </>
              )}
            </div>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => window.open(article.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('article.viewOriginal')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetail;
