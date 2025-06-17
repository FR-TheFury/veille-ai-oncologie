
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Extracting metadata from:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract metadata using regex patterns
    const extractMetaContent = (name: string): string | null => {
      const patterns = [
        new RegExp(`<meta\\s+property=["']og:${name}["']\\s+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']og:${name}["']`, 'i'),
        new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+name=["']${name}["']`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // Extract title
    let title = extractMetaContent('title') || 
                html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 
                '';
    title = title.trim();

    // Extract description
    let summary = extractMetaContent('description') || 
                  extractMetaContent('summary') || 
                  '';

    // Extract author
    let author = extractMetaContent('author') || 
                 html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i)?.[1] || 
                 '';

    // Extract published date
    let publishedAt = extractMetaContent('published_time') || 
                      extractMetaContent('article:published_time') || 
                      html.match(/<time[^>]*datetime=["']([^"']+)["']/i)?.[1] || 
                      '';

    // Extract keywords
    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];

    // Clean up extracted data
    title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    summary = summary.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    author = author.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

    console.log('Extracted metadata:', { title, summary, author, publishedAt, keywords });

    return new Response(JSON.stringify({
      title: title || 'Article sans titre',
      summary: summary || '',
      author: author || '',
      published_at: publishedAt || '',
      keywords: keywords.length > 0 ? keywords : []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error extracting article metadata:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      title: '',
      summary: '',
      author: '',
      published_at: '',
      keywords: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
