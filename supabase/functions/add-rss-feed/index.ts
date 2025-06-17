
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

// Parser RSS simplifié et plus robuste
function parseRSS(xml: string): RSSFeed {
  try {
    // Nettoyer le XML d'abord
    xml = xml.replace(/^\uFEFF/, ''); // Supprimer BOM
    xml = xml.trim();
    
    console.log('Tentative de parsing XML, longueur:', xml.length);
    console.log('Début du XML (premiers 300 caractères):', xml.substring(0, 300));
    
    // Vérifier si c'est un flux Atom ou RSS
    const isAtom = xml.includes('<feed') && xml.includes('xmlns');
    const isRDF = xml.includes('<rdf:RDF') || xml.includes('xmlns:rdf');
    
    console.log('Type de flux détecté:', { isAtom, isRDF });
    
    if (isAtom) {
      return parseAtomFeed(xml);
    } else if (isRDF) {
      return parseRDFFeed(xml);
    } else {
      return parseRSSFeed(xml);
    }
  } catch (error) {
    console.error('Erreur lors du parsing RSS:', error);
    throw new Error(`Erreur lors du parsing du flux RSS: ${error.message}`);
  }
}

function parseRSSFeed(xml: string): RSSFeed {
  try {
    // Extraire le titre et la description du canal de manière plus robuste
    const channelMatch = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
    const channelContent = channelMatch ? channelMatch[1] : xml;
    
    const titleMatch = channelContent.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    const descMatch = channelContent.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is);
    
    const title = titleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || 'RSS Feed';
    const description = descMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
    
    console.log('Titre du flux:', title);
    console.log('Description du flux:', description);
    
    // Extraire les items de manière plus simple
    const items: RSSItem[] = [];
    const itemMatches = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (itemMatches) {
      for (let i = 0; i < Math.min(itemMatches.length, 20); i++) {
        const itemXml = itemMatches[i];
        
        const itemTitle = extractTagContent(itemXml, 'title');
        const itemDesc = extractTagContent(itemXml, 'description');
        const itemLink = extractTagContent(itemXml, 'link');
        const itemPubDate = extractTagContent(itemXml, 'pubDate');
        const itemAuthor = extractTagContent(itemXml, 'author') || extractTagContent(itemXml, 'dc:creator');
        
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
    }

    console.log(`${items.length} articles extraits`);
    return { title, description, items };
  } catch (error) {
    console.error('Erreur dans parseRSSFeed:', error);
    throw error;
  }
}

function parseAtomFeed(xml: string): RSSFeed {
  try {
    const title = extractTagContent(xml, 'title') || 'Atom Feed';
    const description = extractTagContent(xml, 'subtitle') || '';
    
    const items: RSSItem[] = [];
    const entryMatches = xml.match(/<entry[^>]*>([\s\S]*?)<\/entry>/gi);
    
    if (entryMatches) {
      for (let i = 0; i < Math.min(entryMatches.length, 20); i++) {
        const entryXml = entryMatches[i];
        
        const entryTitle = extractTagContent(entryXml, 'title');
        const entrySummary = extractTagContent(entryXml, 'summary') || extractTagContent(entryXml, 'content');
        const linkMatch = entryXml.match(/<link[^>]*href="([^"]*)"[^>]*>/);
        const entryLink = linkMatch?.[1] || '';
        const entryUpdated = extractTagContent(entryXml, 'updated') || extractTagContent(entryXml, 'published');
        const entryAuthor = extractAuthorFromAtom(entryXml);
        
        if (entryTitle && entryLink) {
          items.push({
            title: entryTitle,
            description: entrySummary,
            link: entryLink,
            pubDate: entryUpdated,
            author: entryAuthor
          });
        }
      }
    }

    return { title, description, items };
  } catch (error) {
    console.error('Erreur dans parseAtomFeed:', error);
    throw error;
  }
}

function parseRDFFeed(xml: string): RSSFeed {
  try {
    const title = extractTagContent(xml, 'title') || 'RDF Feed';
    const description = extractTagContent(xml, 'description') || '';
    
    const items: RSSItem[] = [];
    const itemMatches = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (itemMatches) {
      for (let i = 0; i < Math.min(itemMatches.length, 20); i++) {
        const itemXml = itemMatches[i];
        
        const itemTitle = extractTagContent(itemXml, 'title');
        const itemDesc = extractTagContent(itemXml, 'description');
        const itemLink = extractTagContent(itemXml, 'link');
        const itemDate = extractTagContent(itemXml, 'dc:date');
        const itemCreator = extractTagContent(itemXml, 'dc:creator');
        
        if (itemTitle && itemLink) {
          items.push({
            title: itemTitle,
            description: itemDesc,
            link: itemLink,
            pubDate: itemDate,
            author: itemCreator
          });
        }
      }
    }

    return { title, description, items };
  } catch (error) {
    console.error('Erreur dans parseRDFFeed:', error);
    throw error;
  }
}

// Fonction utilitaire pour extraire le contenu d'une balise
function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tagName}>`, 'is');
  const match = xml.match(regex);
  return match?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
}

// Fonction utilitaire pour extraire l'auteur d'un flux Atom
function extractAuthorFromAtom(entryXml: string): string {
  const authorMatch = entryXml.match(/<author[^>]*>([\s\S]*?)<\/author>/i);
  if (authorMatch) {
    const nameMatch = authorMatch[1].match(/<name[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/i);
    return nameMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
  }
  return '';
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

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`Tentative de récupération: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0; +https://example.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Réponse reçue: ${response.status} ${response.statusText}`);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La requête a pris trop de temps');
    }
    throw error;
  }
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
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      throw new Error('URL invalide fournie');
    }

    // Vérifier que l'URL utilise HTTP ou HTTPS
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      throw new Error('Seuls les protocoles HTTP et HTTPS sont autorisés');
    }

    console.log('Récupération du flux RSS:', url);

    // Récupérer le flux RSS avec timeout
    const response = await fetchWithTimeout(url);
    const xmlContent = await response.text();
    
    console.log('Contenu récupéré, longueur:', xmlContent.length);

    if (!xmlContent || xmlContent.length < 50) {
      throw new Error('Le contenu récupéré semble vide ou trop court');
    }

    // Vérifier basiquement si c'est du XML
    if (!xmlContent.includes('<')) {
      console.log('Contenu reçu (premiers 200 caractères):', xmlContent.substring(0, 200));
      throw new Error('Le contenu récupéré ne semble pas être du XML valide');
    }

    const feed = parseRSS(xmlContent);

    if (!feed.title || feed.title === 'RSS Feed' || feed.title === 'Atom Feed' || feed.title === 'RDF Feed') {
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
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (categoryError || !category) {
      console.error('Erreur catégorie:', categoryError);
      throw new Error(`Catégorie "${categoryName}" non trouvée dans la base de données`);
    }

    // Vérifier si le flux existe déjà
    const { data: existingFeed } = await supabase
      .from('rss_feeds')
      .select('id')
      .eq('url', url)
      .maybeSingle();

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

    // Traiter les articles (limité pour éviter les timeouts)
    if (feed.items.length > 0) {
      console.log(`Début du traitement de ${Math.min(feed.items.length, 10)} articles`);
      await processArticles(feed.items.slice(0, 10), insertedFeed.id, supabase);
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
    
    // Retourner une erreur plus spécifique selon le type d'erreur
    let errorMessage = error.message || 'Une erreur inconnue s\'est produite';
    let statusCode = 400;
    
    if (errorMessage.includes('Timeout')) {
      errorMessage = 'Le flux RSS met trop de temps à répondre. Veuillez réessayer plus tard.';
      statusCode = 408;
    } else if (errorMessage.includes('500')) {
      errorMessage = 'Le serveur du flux RSS a rencontré une erreur. Veuillez vérifier l\'URL ou réessayer plus tard.';
      statusCode = 502;
    } else if (errorMessage.includes('404')) {
      errorMessage = 'Le flux RSS n\'a pas été trouvé. Veuillez vérifier l\'URL.';
      statusCode = 404;
    } else if (errorMessage.includes('403')) {
      errorMessage = 'L\'accès au flux RSS est interdit. Le site pourrait bloquer les bots ou nécessiter une authentification.';
      statusCode = 403;
    } else if (errorMessage.includes('Erreur HTTP')) {
      // Extraire le code d'erreur HTTP du message
      const httpCodeMatch = errorMessage.match(/Erreur HTTP (\d+)/);
      if (httpCodeMatch) {
        const httpCode = parseInt(httpCodeMatch[1]);
        statusCode = httpCode;
        
        if (httpCode >= 500) {
          errorMessage = 'Erreur du serveur source. Le site RSS rencontre des problèmes techniques.';
        } else if (httpCode === 429) {
          errorMessage = 'Trop de requêtes. Le site RSS limite l\'accès. Réessayez plus tard.';
        } else if (httpCode >= 400) {
          errorMessage = `Erreur d'accès au flux RSS (${httpCode}). Vérifiez l'URL et les permissions.`;
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: error.message
    }), {
      status: statusCode,
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

      // Nettoyer le contenu
      const cleanDescription = item.description
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim()
        .substring(0, 500);

      // Vérifier si l'article existe déjà
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('url', item.link)
        .maybeSingle();

      if (existingArticle) {
        console.log('Article déjà existant:', item.title.substring(0, 50));
        continue;
      }

      // Insérer l'article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: item.title.substring(0, 255),
          summary: cleanDescription,
          content: cleanDescription,
          url: item.link,
          author: item.author ? item.author.substring(0, 100) : null,
          published_at: publishedAt,
          relevance_score: 0.5
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
