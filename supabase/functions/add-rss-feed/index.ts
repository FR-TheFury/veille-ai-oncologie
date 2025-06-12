
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  author?: string;
}

interface RSSFeed {
  title: string;
  description: string;
  items: RSSItem[];
}

// Parser RSS simple
function parseRSS(xml: string): RSSFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  
  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('Format RSS invalide');
  }

  const title = channel.querySelector('title')?.textContent || '';
  const description = channel.querySelector('description')?.textContent || '';
  
  const items: RSSItem[] = [];
  const itemElements = channel.querySelectorAll('item');
  
  itemElements.forEach(item => {
    const itemTitle = item.querySelector('title')?.textContent || '';
    const itemDescription = item.querySelector('description')?.textContent || '';
    const itemLink = item.querySelector('link')?.textContent || '';
    const itemPubDate = item.querySelector('pubDate')?.textContent || '';
    const itemAuthor = item.querySelector('author, dc\\:creator')?.textContent || '';
    
    if (itemTitle && itemLink) {
      items.push({
        title: itemTitle,
        description: itemDescription,
        link: itemLink,
        pubDate: itemPubDate,
        author: itemAuthor
      });
    }
  });

  return { title, description, items };
}

// Déterminer la catégorie automatiquement
function detectCategory(title: string, description: string): string {
  const content = (title + ' ' + description).toLowerCase();
  
  if (content.includes('nature') || content.includes('cell') || content.includes('science') || content.includes('lancet')) {
    return 'Revues scientifiques';
  }
  if (content.includes('arxiv') || content.includes('biorxiv') || content.includes('medrxiv')) {
    return 'Prépublications';
  }
  if (content.includes('pubmed') || content.includes('ieee')) {
    return 'Bases de données';
  }
  if (content.includes('news') || content.includes('technology') || content.includes('mit')) {
    return 'Actualités';
  }
  if (content.includes('inserm') || content.includes('nih') || content.includes('institut')) {
    return 'Instituts';
  }
  if (content.includes('conference') || content.includes('asco') || content.includes('miccai')) {
    return 'Conférences';
  }
  
  return 'Actualités'; // Catégorie par défaut
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL du flux RSS requise');
    }

    console.log('Récupération du flux RSS:', url);

    // Récupérer le flux RSS
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du flux: ${response.status}`);
    }

    const xmlContent = await response.text();
    const feed = parseRSS(xmlContent);

    console.log('Flux RSS analysé:', feed.title);

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Détecter la catégorie
    const categoryName = detectCategory(feed.title, feed.description);
    
    // Récupérer l'ID de la catégorie
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    // Insérer le flux RSS
    const { data: insertedFeed, error: feedError } = await supabase
      .from('rss_feeds')
      .insert({
        title: feed.title,
        url: url,
        description: feed.description,
        category_id: category.id,
        article_count: feed.items.length,
        last_fetched_at: new Date().toISOString()
      })
      .select()
      .single();

    if (feedError) {
      throw new Error(`Erreur lors de l'insertion du flux: ${feedError.message}`);
    }

    console.log('Flux RSS inséré:', insertedFeed.id);

    // Démarrer le traitement des articles en arrière-plan
    EdgeRuntime.waitUntil(processArticles(feed.items, insertedFeed.id, supabase));

    return new Response(JSON.stringify({ 
      success: true, 
      feed: insertedFeed,
      message: `Flux RSS "${feed.title}" ajouté avec succès. ${feed.items.length} articles en cours de traitement.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processArticles(items: RSSItem[], feedId: string, supabase: any) {
  console.log(`Traitement de ${items.length} articles pour le flux ${feedId}`);
  
  for (const item of items) {
    try {
      // Convertir la date de publication
      let publishedAt = null;
      if (item.pubDate) {
        publishedAt = new Date(item.pubDate).toISOString();
      }

      // Insérer l'article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: item.title,
          summary: item.description.substring(0, 500) + '...', // Résumé temporaire
          content: item.description,
          url: item.link,
          author: item.author,
          published_at: publishedAt,
          relevance_score: 0.5 // Score par défaut
        });

      if (error && !error.message.includes('duplicate key')) {
        console.error('Erreur lors de l\'insertion de l\'article:', error);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'article:', error);
    }
  }

  console.log(`Traitement terminé pour le flux ${feedId}`);
}
