
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

// Parser RSS simple pour Deno
function parseRSS(xml: string): RSSFeed {
  // Utiliser des expressions régulières pour parser le XML car DOMParser n'est pas disponible
  const titleMatch = xml.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/);
  const descMatch = xml.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/);
  
  const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
  const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
  
  // Extraire les items
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1];
    
    const itemTitleMatch = itemXml.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/);
    const itemDescMatch = itemXml.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/);
    const itemLinkMatch = itemXml.match(/<link[^>]*><!\[CDATA\[(.*?)\]\]><\/link>|<link[^>]*>(.*?)<\/link>/);
    const itemPubDateMatch = itemXml.match(/<pubDate[^>]*><!\[CDATA\[(.*?)\]\]><\/pubDate>|<pubDate[^>]*>(.*?)<\/pubDate>/);
    const itemAuthorMatch = itemXml.match(/<author[^>]*><!\[CDATA\[(.*?)\]\]><\/author>|<author[^>]*>(.*?)<\/author>|<dc:creator[^>]*><!\[CDATA\[(.*?)\]\]><\/dc:creator>|<dc:creator[^>]*>(.*?)<\/dc:creator>/);
    
    const itemTitle = (itemTitleMatch?.[1] || itemTitleMatch?.[2] || '').trim();
    const itemDesc = (itemDescMatch?.[1] || itemDescMatch?.[2] || '').trim();
    const itemLink = (itemLinkMatch?.[1] || itemLinkMatch?.[2] || '').trim();
    const itemPubDate = (itemPubDateMatch?.[1] || itemPubDateMatch?.[2] || '').trim();
    const itemAuthor = (itemAuthorMatch?.[1] || itemAuthorMatch?.[2] || itemAuthorMatch?.[3] || itemAuthorMatch?.[4] || '').trim();
    
    if (itemTitle && itemLink) {
      items.push({
        title: itemTitle,
        description: itemDesc,
        link: itemLink,
        pubDate: itemPubDate,
        author: itemAuthor
      });
    }
  }

  return { title, description, items };
}

// Déterminer la catégorie automatiquement
function detectCategory(title: string, description: string): string {
  const content = (title + ' ' + description).toLowerCase();
  
  if (content.includes('nature') || content.includes('cell') || content.includes('science') || content.includes('lancet') || content.includes('jco') || content.includes('nejm')) {
    return 'Revues scientifiques';
  }
  if (content.includes('arxiv') || content.includes('biorxiv') || content.includes('medrxiv')) {
    return 'Prépublications';
  }
  if (content.includes('pubmed') || content.includes('ieee') || content.includes('clinicaltrials')) {
    return 'Bases de données';
  }
  if (content.includes('news') || content.includes('technology') || content.includes('mit')) {
    return 'Actualités';
  }
  if (content.includes('inserm') || content.includes('nih') || content.includes('institut') || content.includes('nci') || content.includes('asco')) {
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

    // Récupérer le flux RSS avec des headers pour éviter les blocages
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Bot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du flux: ${response.status} - ${response.statusText}`);
    }

    const xmlContent = await response.text();
    
    if (!xmlContent || !xmlContent.includes('<rss') && !xmlContent.includes('<feed')) {
      throw new Error('Le contenu récupéré ne semble pas être un flux RSS valide');
    }

    const feed = parseRSS(xmlContent);

    if (!feed.title) {
      throw new Error('Impossible d\'extraire le titre du flux RSS');
    }

    console.log('Flux RSS analysé:', feed.title, 'avec', feed.items.length, 'articles');

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
      throw new Error(`Catégorie "${categoryName}" non trouvée`);
    }

    // Vérifier si le flux existe déjà
    const { data: existingFeed } = await supabase
      .from('rss_feeds')
      .select('id')
      .eq('url', url)
      .single();

    if (existingFeed) {
      throw new Error('Ce flux RSS existe déjà');
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
        last_fetched_at: new Date().toISOString(),
        status: 'active'
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
        try {
          publishedAt = new Date(item.pubDate).toISOString();
        } catch (dateError) {
          console.log('Erreur de conversion de date:', item.pubDate);
        }
      }

      // Nettoyer le contenu HTML
      const cleanDescription = item.description
        .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
        .replace(/&[^;]+;/g, ' ') // Supprimer les entités HTML
        .trim();

      // Insérer l'article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: item.title,
          summary: cleanDescription.length > 500 ? cleanDescription.substring(0, 497) + '...' : cleanDescription,
          content: cleanDescription,
          url: item.link,
          author: item.author || null,
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
