
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

// Parser RSS amélioré pour Deno
function parseRSS(xml: string): RSSFeed {
  // Nettoyer le XML d'abord
  xml = xml.replace(/^\uFEFF/, ''); // Supprimer BOM
  xml = xml.trim();
  
  console.log('Tentative de parsing XML, longueur:', xml.length);
  console.log('Début du XML:', xml.substring(0, 500));
  
  // Vérifier si c'est un flux Atom ou RSS
  const isAtom = xml.includes('<feed') && (xml.includes('xmlns="http://www.w3.org/2005/Atom"') || xml.includes('xmlns:atom'));
  const isRDF = xml.includes('<rdf:RDF') || xml.includes('xmlns:rdf');
  
  console.log('Type de flux détecté:', { isAtom, isRDF });
  
  if (isAtom) {
    return parseAtomFeed(xml);
  } else if (isRDF) {
    return parseRDFFeed(xml);
  } else {
    return parseRSSFeed(xml);
  }
}

function parseRSSFeed(xml: string): RSSFeed {
  // Extraire le titre et la description du canal
  const channelTitleMatch = xml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
  const channelDescMatch = xml.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
  
  const title = channelTitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || 'RSS Feed';
  const description = channelDescMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
  
  console.log('Titre du flux:', title);
  console.log('Description du flux:', description);
  
  // Extraire les items
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let itemMatch;
  let itemCount = 0;
  
  while ((itemMatch = itemRegex.exec(xml)) !== null && itemCount < 50) {
    const itemXml = itemMatch[1];
    
    const itemTitleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const itemDescMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    const itemLinkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s);
    const itemPubDateMatch = itemXml.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/s);
    const itemAuthorMatch = itemXml.match(/<(?:author|dc:creator)[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/(?:author|dc:creator)>/s);
    
    const itemTitle = itemTitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemDesc = itemDescMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemLink = itemLinkMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemPubDate = itemPubDateMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemAuthor = itemAuthorMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    
    if (itemTitle && itemLink) {
      items.push({
        title: itemTitle,
        description: itemDesc,
        link: itemLink,
        pubDate: itemPubDate,
        author: itemAuthor
      });
      itemCount++;
    }
  }

  console.log(`${items.length} articles extraits`);
  return { title, description, items };
}

function parseAtomFeed(xml: string): RSSFeed {
  // Parser pour les flux Atom
  const titleMatch = xml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
  const subtitleMatch = xml.match(/<subtitle[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/subtitle>/s);
  
  const title = titleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || 'Atom Feed';
  const description = subtitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
  
  const items: RSSItem[] = [];
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g;
  let entryMatch;
  let entryCount = 0;
  
  while ((entryMatch = entryRegex.exec(xml)) !== null && entryCount < 50) {
    const entryXml = entryMatch[1];
    
    const entryTitleMatch = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const entrySummaryMatch = entryXml.match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/(?:summary|content)>/s);
    const entryLinkMatch = entryXml.match(/<link[^>]*href="([^"]*)"[^>]*>/);
    const entryUpdatedMatch = entryXml.match(/<(?:updated|published)[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/(?:updated|published)>/s);
    const entryAuthorMatch = entryXml.match(/<author[^>]*>[\s\S]*?<name[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/s);
    
    const entryTitle = entryTitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const entrySummary = entrySummaryMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const entryLink = entryLinkMatch?.[1]?.trim() || '';
    const entryUpdated = entryUpdatedMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const entryAuthor = entryAuthorMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    
    if (entryTitle && entryLink) {
      items.push({
        title: entryTitle,
        description: entrySummary,
        link: entryLink,
        pubDate: entryUpdated,
        author: entryAuthor
      });
      entryCount++;
    }
  }

  return { title, description, items };
}

function parseRDFFeed(xml: string): RSSFeed {
  // Parser pour les flux RDF/RSS 1.0
  const channelTitleMatch = xml.match(/<channel[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
  const channelDescMatch = xml.match(/<channel[^>]*>[\s\S]*?<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
  
  const title = channelTitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || 'RDF Feed';
  const description = channelDescMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
  
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*rdf:about="([^"]*)"[^>]*>([\s\S]*?)<\/item>/g;
  let itemMatch;
  let itemCount = 0;
  
  while ((itemMatch = itemRegex.exec(xml)) !== null && itemCount < 50) {
    const itemLink = itemMatch[1];
    const itemXml = itemMatch[2];
    
    const itemTitleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const itemDescMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    const itemDateMatch = itemXml.match(/<dc:date[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:date>/s);
    const itemCreatorMatch = itemXml.match(/<dc:creator[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:creator>/s);
    
    const itemTitle = itemTitleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemDesc = itemDescMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemDate = itemDateMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    const itemCreator = itemCreatorMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    
    if (itemTitle && itemLink) {
      items.push({
        title: itemTitle,
        description: itemDesc,
        link: itemLink,
        pubDate: itemDate,
        author: itemCreator
      });
      itemCount++;
    }
  }

  return { title, description, items };
}

// Déterminer la catégorie automatiquement
function detectCategory(title: string, description: string): string {
  const content = (title + ' ' + description).toLowerCase();
  
  if (content.includes('nature') || content.includes('cell') || content.includes('science') || content.includes('lancet') || content.includes('jco') || content.includes('nejm') || content.includes('cancer') || content.includes('oncology')) {
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

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  const userAgents = [
    'Mozilla/5.0 (compatible; RSS-Bot/1.0)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'feedparser-python/6.0.8 +https://pythonhosted.org/feedparser/'
  ];

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Tentative ${i + 1}/${maxRetries} pour ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgents[i % userAgents.length],
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        redirect: 'follow'
      });

      console.log(`Réponse reçue: ${response.status} ${response.statusText}`);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        return response;
      }

      console.log(`Tentative ${i + 1} échouée avec le statut ${response.status}: ${response.statusText}`);
      
      if (response.status === 403 || response.status === 429) {
        // Attendre un peu plus longtemps pour ces erreurs
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
      } else if (response.status === 404) {
        throw new Error(`URL non trouvée (404): Vérifiez que l'URL ${url} est correcte et accessible`);
      } else if (response.status >= 500) {
        console.log(`Erreur serveur ${response.status}, tentative de retry...`);
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
      } else {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Erreur lors de la tentative ${i + 1}:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
    }
  }

  throw new Error('Toutes les tentatives ont échoué');
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

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      throw new Error('URL invalide fournie');
    }

    console.log('Récupération du flux RSS:', url);

    // Récupérer le flux RSS avec retry
    const response = await fetchWithRetry(url);
    const xmlContent = await response.text();
    
    console.log('Contenu récupéré, longueur:', xmlContent.length);
    console.log('Content-Type de la réponse:', response.headers.get('content-type'));

    if (!xmlContent || xmlContent.length < 100) {
      throw new Error('Le contenu récupéré semble vide ou trop court pour être un flux RSS valide');
    }

    // Vérifier si c'est du XML valide
    if (!xmlContent.includes('<') || (!xmlContent.includes('<rss') && !xmlContent.includes('<feed') && !xmlContent.includes('<rdf:RDF') && !xmlContent.includes('<channel'))) {
      console.log('Contenu reçu (premiers 500 caractères):', xmlContent.substring(0, 500));
      throw new Error('Le contenu récupéré ne semble pas être un flux RSS/XML valide');
    }

    const feed = parseRSS(xmlContent);

    if (!feed.title || feed.title === 'RSS Feed' || feed.title === 'Atom Feed' || feed.title === 'RDF Feed') {
      throw new Error('Impossible d\'extraire le titre du flux RSS - le format pourrait ne pas être supporté');
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
      throw new Error(`Catégorie "${categoryName}" non trouvée dans la base de données`);
    }

    // Vérifier si le flux existe déjà
    const { data: existingFeed } = await supabase
      .from('rss_feeds')
      .select('id')
      .eq('url', url)
      .single();

    if (existingFeed) {
      throw new Error('Ce flux RSS existe déjà dans la base de données');
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
      console.error('Erreur lors de l\'insertion du flux:', feedError);
      throw new Error(`Erreur lors de l'insertion du flux: ${feedError.message}`);
    }

    console.log('Flux RSS inséré:', insertedFeed.id);

    // Traiter les articles de manière synchrone pour éviter les timeouts
    if (feed.items.length > 0) {
      console.log(`Début du traitement de ${feed.items.length} articles`);
      await processArticles(feed.items, insertedFeed.id, supabase);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      feed: insertedFeed,
      message: `Flux RSS "${feed.title}" ajouté avec succès avec ${feed.items.length} articles.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur complète:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Une erreur inconnue s\'est produite'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processArticles(items: RSSItem[], feedId: string, supabase: any) {
  console.log(`Traitement de ${items.length} articles pour le flux ${feedId}`);
  
  for (const item of items.slice(0, 20)) { // Limiter à 20 articles pour éviter les timeouts
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

      // Nettoyer le contenu HTML et limiter la taille
      const cleanDescription = item.description
        .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
        .replace(/&[^;]+;/g, ' ') // Supprimer les entités HTML
        .trim()
        .substring(0, 1000); // Limiter à 1000 caractères

      // Vérifier si l'article existe déjà
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('url', item.link)
        .single();

      if (existingArticle) {
        console.log('Article déjà existant, passage au suivant:', item.title.substring(0, 50));
        continue;
      }

      // Insérer l'article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: item.title.substring(0, 255), // Limiter la taille du titre
          summary: cleanDescription.length > 500 ? cleanDescription.substring(0, 497) + '...' : cleanDescription,
          content: cleanDescription,
          url: item.link,
          author: item.author ? item.author.substring(0, 100) : null,
          published_at: publishedAt,
          relevance_score: 0.5 // Score par défaut
        });

      if (error) {
        console.error('Erreur lors de l\'insertion de l\'article:', error);
      } else {
        console.log('Article inséré:', item.title.substring(0, 50));
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'article:', error);
    }
  }

  console.log(`Traitement terminé pour le flux ${feedId}`);
}
