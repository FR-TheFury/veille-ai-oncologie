import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function generateSummaryAndScore(title: string, content: string): Promise<{summary: string, score: number, keywords: string[], keyPoints: string[]}> {
  if (!openAIApiKey) {
    return {
      summary: content.substring(0, 400) + '...',
      score: 0.5,
      keywords: [],
      keyPoints: []
    };
  }

  try {
    const prompt = `
Analyse cet article scientifique et fournis :
1. Un résumé détaillé en français de 4-6 phrases qui explique clairement le contexte, les méthodes, et les résultats
2. Un score de pertinence (0-1) pour l'IA appliquée à l'oncologie
3. Les mots-clés principaux (maximum 5)
4. Une liste de 3-5 points clés à retenir de l'article (phrases courtes et impactantes)

Titre: ${title}
Contenu: ${content.substring(0, 2000)}

Réponds au format JSON:
{
  "summary": "résumé détaillé en français de 4-6 phrases",
  "score": 0.8,
  "keywords": ["mot1", "mot2", "mot3"],
  "keyPoints": ["Point clé 1", "Point clé 2", "Point clé 3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      summary: result.summary,
      score: Math.min(Math.max(result.score, 0), 1),
      keywords: result.keywords || [],
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    console.error('Erreur IA:', error);
    return {
      summary: content.substring(0, 400) + '...',
      score: 0.5,
      keywords: [],
      keyPoints: []
    };
  }
}

// Fonction utilitaire pour extraire le contenu d'une balise
function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tagName}>`, 'is');
  const match = xml.match(regex);
  return match?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
}

// Parser RSS simplifié sans DOMParser
function parseRSSItems(xmlContent: string): Array<{title: string, description: string, link: string, pubDate: string, author: string}> {
  const items: Array<{title: string, description: string, link: string, pubDate: string, author: string}> = [];
  
  try {
    // Extraire les items
    const itemMatches = xmlContent.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (itemMatches) {
      for (let i = 0; i < Math.min(itemMatches.length, 20); i++) {
        const itemXml = itemMatches[i];
        
        const title = extractTagContent(itemXml, 'title');
        const description = extractTagContent(itemXml, 'description');
        const link = extractTagContent(itemXml, 'link');
        const pubDate = extractTagContent(itemXml, 'pubDate');
        const author = extractTagContent(itemXml, 'author') || extractTagContent(itemXml, 'dc:creator');
        
        if (title && link) {
          items.push({
            title,
            description,
            link,
            pubDate,
            author
          });
        }
      }
    }
    
    console.log(`${items.length} articles extraits du flux RSS`);
    return items;
  } catch (error) {
    console.error('Erreur lors du parsing RSS:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer le flux RSS
    const { data: feed } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('id', feedId)
      .single();

    if (!feed) {
      throw new Error('Flux RSS non trouvé');
    }

    console.log('Mise à jour du flux:', feed.title);

    // Récupérer le flux RSS avec headers appropriés
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlContent = await response.text();
    console.log('Contenu RSS récupéré, longueur:', xmlContent.length);
    
    // Parser le RSS sans DOMParser
    const items = parseRSSItems(xmlContent);

    let processedCount = 0;

    for (const item of items) {
      if (!item.title || !item.link) continue;

      // Vérifier si l'article existe déjà
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('feed_id', feedId)
        .eq('url', item.link)
        .maybeSingle();

      if (existingArticle) {
        console.log('Article déjà existant:', item.title.substring(0, 50));
        continue;
      }

      // Générer résumé et score avec IA
      const aiResult = await generateSummaryAndScore(item.title, item.description);

      // Insérer le nouvel article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: item.title.substring(0, 255),
          summary: aiResult.summary,
          content: item.description,
          url: item.link,
          author: item.author ? item.author.substring(0, 100) : null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          relevance_score: aiResult.score,
          keywords: aiResult.keywords,
          key_points: aiResult.keyPoints
        });

      if (!error) {
        processedCount++;
        console.log('Nouvel article ajouté:', item.title.substring(0, 50));
      } else {
        console.error('Erreur insertion article:', error);
      }
    }

    // Mettre à jour le flux
    await supabase
      .from('rss_feeds')
      .update({
        last_fetched_at: new Date().toISOString(),
        article_count: feed.article_count + processedCount
      })
      .eq('id', feedId);

    console.log(`Flux mis à jour: ${processedCount} nouveaux articles`);

    return new Response(JSON.stringify({ 
      success: true, 
      processedCount,
      message: `${processedCount} nouveaux articles traités`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans fetch-articles:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
