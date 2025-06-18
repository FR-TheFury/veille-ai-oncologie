
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

  // Fonction pour traduire le contenu selon la langue
  const getTranslatedContent = () => {
    const currentLang = i18n.language;
    
    // Structure du contenu traduit
    const translatedContent = {
      fr: {
        introduction: t('article.content.introduction'),
        applications: {
          title: t('article.content.applications.title'),
          diagnosticImaging: {
            title: t('article.content.applications.diagnosticImaging.title'),
            description: t('article.content.applications.diagnosticImaging.description')
          },
          personalizedMedicine: {
            title: t('article.content.applications.personalizedMedicine.title'),
            description: t('article.content.applications.personalizedMedicine.description')
          }
        },
        results: {
          title: t('article.content.results.title'),
          description: t('article.content.results.description')
        },
        challenges: {
          title: t('article.content.challenges.title'),
          description: t('article.content.challenges.description')
        }
      },
      en: {
        introduction: t('article.content.introduction'),
        applications: {
          title: t('article.content.applications.title'),
          diagnosticImaging: {
            title: t('article.content.applications.diagnosticImaging.title'),
            description: t('article.content.applications.diagnosticImaging.description')
          },
          personalizedMedicine: {
            title: t('article.content.applications.personalizedMedicine.title'),
            description: t('article.content.applications.personalizedMedicine.description')
          }
        },
        results: {
          title: t('article.content.results.title'),
          description: t('article.content.results.description')
        },
        challenges: {
          title: t('article.content.challenges.title'),
          description: t('article.content.challenges.description')
        }
      }
    };

    return translatedContent[currentLang as keyof typeof translatedContent] || translatedContent.en;
  };

  // Fonction pour traduire les mots-clés
  const getTranslatedKeywords = () => {
    if (!article.keywords || article.keywords.length === 0) {
      return [
        t('article.defaultKeywords.ai'),
        t('article.defaultKeywords.oncology'),
        t('article.defaultKeywords.machinelearning'),
        t('article.defaultKeywords.research')
      ];
    }

    // Traduire les mots-clés connus
    return article.keywords.map(keyword => {
      const lowercaseKeyword = keyword.toLowerCase();
      const translationKey = `article.defaultKeywords.${lowercaseKeyword}`;
      const translated = t(translationKey);
      
      // Si la traduction existe et est différente de la clé, l'utiliser
      if (translated !== translationKey) {
        return translated;
      }
      
      // Sinon, garder le mot-clé original
      return keyword;
    });
  };

  const content = getTranslatedContent();
  const translatedKeywords = getTranslatedKeywords();

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

          {/* Main content - Translated */}
          <div className="prose max-w-none">
            <div className="text-foreground leading-relaxed space-y-6">
              {/* Introduction */}
              <p className="text-lg leading-relaxed">
                {content.introduction}
              </p>

              {/* Applications */}
              <div>
                <h2 className="text-xl font-bold text-foreground mt-8 mb-4 border-b border-gray-200 pb-2">
                  {content.applications.title}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                      {content.applications.diagnosticImaging.title}
                    </h3>
                    <p className="text-foreground mb-4 leading-relaxed">
                      {content.applications.diagnosticImaging.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                      {content.applications.personalizedMedicine.title}
                    </h3>
                    <p className="text-foreground mb-4 leading-relaxed">
                      {content.applications.personalizedMedicine.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <h2 className="text-xl font-bold text-foreground mt-8 mb-4 border-b border-gray-200 pb-2">
                  {content.results.title}
                </h2>
                <p className="text-foreground mb-4 leading-relaxed">
                  {content.results.description}
                </p>
              </div>

              {/* Challenges */}
              <div>
                <h2 className="text-xl font-bold text-foreground mt-8 mb-4 border-b border-gray-200 pb-2">
                  {content.challenges.title}
                </h2>
                <p className="text-foreground mb-4 leading-relaxed">
                  {content.challenges.description}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {translatedKeywords.slice(0, 4).map((keyword, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                  {keyword}
                </Badge>
              ))}
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
