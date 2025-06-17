
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Calendar, User, FileText, Sparkles, Eye } from 'lucide-react';
import { useStandaloneArticles, useDeleteStandaloneArticle } from '@/hooks/useStandaloneArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ArticleDetail from './ArticleDetail';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function StandaloneArticlesList() {
  const { data: articles, isLoading } = useStandaloneArticles();
  const deleteArticleMutation = useDeleteStandaloneArticle();
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const { canManageContent } = useAuth();

  const handleDelete = async () => {
    if (articleToDelete) {
      await deleteArticleMutation.mutateAsync(articleToDelete);
      setArticleToDelete(null);
    }
  };

  const selectedArticle = articles?.find(article => article.id === selectedArticleId);

  // If an article is selected, show the article detail view
  if (selectedArticle) {
    // Convert StandaloneArticle to Article format for ArticleDetail component
    const articleForDetail = {
      ...selectedArticle,
      feed_id: '', // Add feed_id as empty string for standalone articles
      summary: selectedArticle.summary || '', // Ensure summary is always a string
      content: selectedArticle.content || '', // Ensure content is always a string
      author: selectedArticle.author || '', // Ensure author is always a string
      published_at: selectedArticle.published_at || selectedArticle.created_at, // Ensure published_at is always defined
      relevance_score: selectedArticle.relevance_score || 0.5, // Ensure relevance_score is always a number
      keywords: selectedArticle.keywords || [], // Ensure keywords is always an array
      key_points: [], // StandaloneArticle doesn't have key_points
    };
    
    return (
      <ArticleDetail 
        article={articleForDetail} 
        onBack={() => setSelectedArticleId(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Aucun article individuel ajouté</p>
            {canManageContent() ? (
              <p className="text-sm text-gray-400">
                Utilisez le bouton ci-dessus pour ajouter votre premier article
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Seuls les administrateurs et managers peuvent ajouter des articles
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {articles.map((article, index) => {
          // Cycle through gradient colors for visual variety
          const gradients = [
            'from-purple-50 to-pink-50 border-purple-200',
            'from-blue-50 to-cyan-50 border-blue-200', 
            'from-green-50 to-emerald-50 border-green-200',
            'from-orange-50 to-red-50 border-orange-200',
            'from-indigo-50 to-purple-50 border-indigo-200'
          ];
          const gradientClass = gradients[index % gradients.length];

          return (
            <Card 
              key={article.id} 
              className={`hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${gradientClass} border-l-4 hover:scale-[1.01]`}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg line-clamp-2 flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    {article.title}
                  </CardTitle>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArticleId(article.id)}
                      className="hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(article.url, '_blank')}
                      className="hover:bg-green-50 border-green-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {canManageContent() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArticleToDelete(article.id)}
                        disabled={deleteArticleMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {article.summary && (
                  <div className="p-3 bg-white/60 rounded-lg border border-white/40">
                    <p className="text-gray-700 line-clamp-3 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  {article.author && (
                    <div className="flex items-center gap-1 text-gray-600 bg-white/40 px-2 py-1 rounded">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{article.author}</span>
                    </div>
                  )}
                  
                  {article.published_at && (
                    <div className="flex items-center gap-1 text-gray-600 bg-white/40 px-2 py-1 rounded">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(article.published_at), 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  )}
                  
                  {article.categories && (
                    <Badge 
                      variant="secondary" 
                      className="border"
                      style={{ 
                        backgroundColor: `${article.categories.color}20`, 
                        color: article.categories.color,
                        borderColor: article.categories.color
                      }}
                    >
                      {article.categories.name}
                    </Badge>
                  )}
                </div>
                
                {article.keywords && article.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-white/40 border-gray-300 hover:bg-white/60 transition-colors"
                      >
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 bg-white/30 px-2 py-1 rounded">
                  ✨ Ajouté le {format(new Date(article.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
