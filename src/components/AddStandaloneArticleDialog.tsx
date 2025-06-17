
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddStandaloneArticle } from '@/hooks/useStandaloneArticles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AddStandaloneArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStandaloneArticleDialog({ open, onOpenChange }: AddStandaloneArticleDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    url: '',
    author: '',
    published_at: '',
    category_id: '',
    keywords: ''
  });

  const addArticleMutation = useAddStandaloneArticle();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      return;
    }

    const articleData = {
      title: formData.title.trim(),
      summary: formData.summary.trim() || undefined,
      content: formData.content.trim() || undefined,
      url: formData.url.trim(),
      author: formData.author.trim() || undefined,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : undefined,
      category_id: formData.category_id || undefined,
      keywords: formData.keywords.trim() ? formData.keywords.split(',').map(k => k.trim()) : undefined
    };

    try {
      await addArticleMutation.mutateAsync(articleData);
      setFormData({
        title: '',
        summary: '',
        content: '',
        url: '',
        author: '',
        published_at: '',
        category_id: '',
        keywords: ''
      });
      onOpenChange(false);
    } catch (error) {
      // L'erreur est gérée dans le hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un article</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de l'article"
              required
            />
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Auteur</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Nom de l'auteur"
            />
          </div>

          <div>
            <Label htmlFor="published_at">Date de publication</Label>
            <Input
              id="published_at"
              type="datetime-local"
              value={formData.published_at}
              onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="keywords">Mots-clés</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="mot1, mot2, mot3"
            />
          </div>

          <div>
            <Label htmlFor="summary">Résumé</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Résumé de l'article"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Contenu détaillé de l'article"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={addArticleMutation.isPending}>
              {addArticleMutation.isPending ? 'Ajout...' : 'Ajouter l\'article'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
