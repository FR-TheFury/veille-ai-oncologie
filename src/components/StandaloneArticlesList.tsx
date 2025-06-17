
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Calendar, User } from 'lucide-react';
import { useStandaloneArticles, useDeleteStandaloneArticle } from '@/hooks/useStandaloneArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

  const handleDelete = async () => {
    if (articleToDelete) {
      await deleteArticleMutation.mutateAsync(articleToDelete);
      setArticleToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Aucun article individuel ajouté pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg line-clamp-2">
                  {article.title}
                </CardTitle>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setArticleToDelete(article.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {article.summary && (
                <p className="text-gray-600 line-clamp-3">
                  {article.summary}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </div>
                )}
                
                {article.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(article.published_at), 'dd MMM yyyy', { locale: fr })}
                  </div>
                )}
                
                {article.categories && (
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: `${article.categories.color}20`, color: article.categories.color }}
                  >
                    {article.categories.name}
                  </Badge>
                )}
              </div>
              
              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                Ajouté le {format(new Date(article.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
              </div>
            </CardContent>
          </Card>
        ))}
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
