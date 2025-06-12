
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function generateSummaryAndScore(title: string, content: string): Promise<{summary: string, score: number, keywords: string[]}> {
  if (!openAIApiKey) {
    return {
      summary: content.substring(0, 200) + '...',
      score: 0.5,
      keywords: []
    };
  }

  try {
    const prompt = `
Analyse cet article scientifique et fournis :
1. Un résumé en français de 2-3 phrases maximum
2. Un score de pertinence (0-1) pour l'IA appliquée à l'oncologie
3. Les mots-clés principaux (maximum 5)

Titre: ${title}
Contenu: ${content.substring(0, 1000)}

Réponds au format JSON:
{
  "summary": "résumé en français",
  "score": 0.8,
  "keywords": ["mot1", "mot2", "mot3"]
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
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error('Erreur IA:', error);
    return {
      summary: content.substring(0, 200) + '...',
      score: 0.5,
      keywords: []
    };
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

    // Récupérer le flux RSS
    const response = await fetch(feed.url);
    const xmlContent = await response.text();
    
    // Parser le RSS (réutiliser la fonction du premier edge function)
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    const items = doc.querySelectorAll('item');

    let processedCount = 0;

    for (const item of items) {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const author = item.querySelector('author, dc\\:creator')?.textContent || '';

      if (!title || !link) continue;

      // Vérifier si l'article existe déjà
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('feed_id', feedId)
        .eq('url', link)
        .single();

      if (existingArticle) continue;

      // Générer résumé et score avec IA
      const aiResult = await generateSummaryAndScore(title, description);

      // Insérer le nouvel article
      const { error } = await supabase
        .from('articles')
        .insert({
          feed_id: feedId,
          title: title,
          summary: aiResult.summary,
          content: description,
          url: link,
          author: author,
          published_at: pubDate ? new Date(pubDate).toISOString() : null,
          relevance_score: aiResult.score,
          keywords: aiResult.keywords
        });

      if (!error) {
        processedCount++;
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

    return new Response(JSON.stringify({ 
      success: true, 
      processedCount,
      message: `${processedCount} nouveaux articles traités`
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
