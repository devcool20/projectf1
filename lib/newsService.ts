import { supabase } from './supabase';

// News API configuration
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

// Formula 1 related search terms - more specific to avoid irrelevant results
const F1_SEARCH_TERMS = [
  '"Formula 1"',
  '"Formula One"',
  '"F1 racing"',
  '"Grand Prix"',
  '"F1 championship"',
  '"Formula 1 drivers"',
  '"F1 teams"',
  '"Formula 1 race"',
  '"F1 qualifying"',
  '"Formula 1 practice"'
];

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image_url?: string;
  author?: string;
  published_at: string;
  source: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

class NewsService {
  private cache: Map<string, NewsArticle> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Fetch news from News API
  async fetchNewsFromAPI(searchTerm: string, page: number = 1, useTopHeadlines: boolean = false): Promise<NewsAPIArticle[]> {
    try {
      if (!NEWS_API_KEY) {
        return [];
      }
      
      // Add domain filtering to only get news from reputable F1 and motorsport sources
      const f1Domains = [
        'formula1.com',
        'autosport.com',
        'motorsport.com',
        'espn.com',
        'sky.com',
        'bbc.com',
        'reuters.com',
        'ap.org',
        'cnn.com',
        'nbcnews.com',
        'abcnews.go.com',
        'cbsnews.com',
        'foxnews.com',
        'usatoday.com',
        'latimes.com',
        'nytimes.com',
        'washingtonpost.com',
        'theguardian.com',
        'independent.co.uk',
        'telegraph.co.uk'
      ];
      
      const domainsParam = f1Domains.join(',');
      
      const params = new URLSearchParams({
        q: searchTerm,
        language: 'en',
        sortBy: 'publishedAt',
        page: page.toString(),
        pageSize: '20', // Maximum articles per request
        apiKey: NEWS_API_KEY
      });
      
      // Add domain filtering only for everything endpoint
      if (!useTopHeadlines) {
        params.append('domains', domainsParam);
      }

      const endpoint = useTopHeadlines ? 'top-headlines' : 'everything';
      const response = await fetch(`${NEWS_API_BASE_URL}/${endpoint}?${params}`);
      
      if (!response.ok) {
        console.error(`❌ News API request failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const data: NewsAPIResponse = await response.json();
      
      if (data.status !== 'ok') {
        return [];
      }

      return data.articles;
    } catch (error) {
      return [];
    }
  }

  // Fetch all Formula 1 news from multiple search terms
  async fetchAllNews(): Promise<NewsArticle[]> {
    const now = Date.now();
    
    // Check cache first
    if (now - this.lastFetch < this.CACHE_DURATION && this.cache.size > 0) {
      return Array.from(this.cache.values());
    }

    // Add timeout to prevent hanging
    const timeout = new Promise<NewsArticle[]>((_, reject) => {
      setTimeout(() => reject(new Error('News fetch timeout')), 30000); // 30 second timeout
    });

    try {
      const fetchPromise = (async () => {
        const allArticles: NewsAPIArticle[] = [];
        const usedImageUrls = new Set<string>(); // Track used image URLs
        
        // Fetch from multiple search terms to get comprehensive F1 news
        const searchTerms = F1_SEARCH_TERMS.slice(0, 5); // Limit to first 5 terms to avoid rate limiting
        
        for (const searchTerm of searchTerms) {
          const articles = await this.fetchNewsFromAPI(searchTerm);
          allArticles.push(...articles);
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Remove duplicates based on URL
        const uniqueArticles = this.removeDuplicateArticles(allArticles);
        
        // Filter articles with images and process them
        const articlesWithImages = uniqueArticles.filter(article => 
          article.urlToImage && 
          article.urlToImage.trim() !== '' &&
          article.urlToImage !== 'null'
        );
        
        // Additional filtering to ensure articles are actually about Formula 1
        const f1RelevantArticles = articlesWithImages.filter(article => {
          const title = article.title.toLowerCase();
          const description = (article.description || '').toLowerCase();
          const content = (article.content || '').toLowerCase();
          
          // F1-specific keywords that must be present
          const f1Keywords = [
            'formula 1', 'formula one', 'f1', 'grand prix', 'gp',
            'max verstappen', 'lewis hamilton', 'charles leclerc', 'lando norris',
            'ferrari', 'mercedes', 'red bull', 'mclaren', 'aston martin',
            'alpine', 'williams', 'haas', 'alfa romeo', 'alpha tauri',
            'racing', 'qualifying', 'practice', 'race', 'championship',
            'podium', 'pole position', 'fastest lap', 'pit stop',
            'team principal', 'driver', 'constructor', 'points'
          ];
          
          // Check if any F1 keyword is present in title, description, or content
          const hasF1Content = f1Keywords.some(keyword => 
            title.includes(keyword) || 
            description.includes(keyword) || 
            content.includes(keyword)
          );
          
          return hasF1Content;
        });
         
         // If we don't have enough F1 articles, try top headlines with sports category
         if (f1RelevantArticles.length < 5) {
           try {
             const topHeadlinesParams = new URLSearchParams({
               category: 'sports',
               language: 'en',
               page: '1',
               pageSize: '20',
               apiKey: NEWS_API_KEY
             });
             
             const topHeadlinesResponse = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${topHeadlinesParams}`);
             if (topHeadlinesResponse.ok) {
               const topHeadlinesData: NewsAPIResponse = await topHeadlinesResponse.json();
               const sportsArticles = topHeadlinesData.articles.filter(article => {
                 const title = article.title.toLowerCase();
                 const description = (article.description || '').toLowerCase();
                 
                 // Check for F1 keywords in sports articles
                 const f1Keywords = ['formula 1', 'formula one', 'f1', 'grand prix', 'gp', 'racing'];
                 return f1Keywords.some(keyword => title.includes(keyword) || description.includes(keyword));
               });
               
               f1RelevantArticles.push(...sportsArticles);
             }
           } catch (error) {
             // Silent error handling
           }
         }
         
         // Process articles and save to database
         const processedArticles: NewsArticle[] = [];
         const limit = Math.min(f1RelevantArticles.length, 30); // Limit to 30 articles
        
        for (let i = 0; i < limit; i++) {
          const apiArticle = f1RelevantArticles[i];
          
          // Check if we already have this article in database
          let existingArticle: NewsArticle | null = null;
          try {
            existingArticle = await this.getArticleByUrl(apiArticle.url);
          } catch (dbError) {
            // Silent error handling
          }
          
          if (existingArticle) {
            processedArticles.push(existingArticle);
            continue;
          }

          // Convert News API article to our format
          const article: Partial<NewsArticle> = {
            title: apiArticle.title,
            description: apiArticle.description || '',
            content: apiArticle.content || apiArticle.description || '',
            url: apiArticle.url,
            image_url: apiArticle.urlToImage,
            author: apiArticle.author,
            published_at: apiArticle.publishedAt,
            source: apiArticle.source.name,
            category: 'F1 News'
          };

          // Clean and validate content
          if (article.content) {
            article.content = this.cleanContent(article.content);
          }

          // Always prioritize content over description, even if truncated
          // Only use description if content is completely empty
          if (!article.content || article.content.trim() === '') {
            article.content = article.description || '';
          }

          // Check if this image URL has already been used
          if (article.image_url && usedImageUrls.has(article.image_url)) {
            article.image_url = this.generatePlaceholderImage(article.title || 'F1 News');
          }
          
          // Track this image URL as used
          if (article.image_url) {
            usedImageUrls.add(article.image_url);
          }

          // Validate that we have good content
          const hasGoodContent = article.content && 
            article.content.length >= 100 && 
            !this.containsNavigationContent(article.content);
          
          // Only save articles with images and good content
          if (article.image_url && hasGoodContent) {
            try {
              const savedArticle = await this.saveArticle(article as any);
              if (savedArticle) {
                processedArticles.push(savedArticle);
              } else {
                // Add the article anyway even if saving failed
                processedArticles.push(article as any);
              }
            } catch (saveError) {
              // Add the article anyway even if saving failed
              processedArticles.push(article as any);
            }
          }
        }

        // Update cache
        this.cache.clear();
        processedArticles.forEach(article => {
          this.cache.set(article.id, article);
        });
        this.lastFetch = now;

        return processedArticles;
      })();

      return await Promise.race([fetchPromise, timeout]);
    } catch (error) {
      return [];
    }
  }

  // Remove duplicate articles based on URL
  private removeDuplicateArticles(articles: NewsAPIArticle[]): NewsAPIArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const url = article.url.toLowerCase();
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  }

  // Clean content text
  private cleanContent(content: string): string {
    try {
      if (!content) return '';
      
      // Remove HTML tags if present
      content = content.replace(/<[^>]*>/g, '');
      
      // Decode HTML entities
      content = content.replace(/&amp;/g, '&');
      content = content.replace(/&lt;/g, '<');
      content = content.replace(/&gt;/g, '>');
      content = content.replace(/&quot;/g, '"');
      content = content.replace(/&#39;/g, "'");
      content = content.replace(/&nbsp;/g, ' ');
      content = content.replace(/&mdash;/g, '—');
      content = content.replace(/&ndash;/g, '–');
      content = content.replace(/&hellip;/g, '...');
      
      // Remove truncation patterns like "+754 chars" or similar
      content = content.replace(/\+\d+\s*chars?/gi, '');
      content = content.replace(/\[.*?\]/g, ''); // Remove square bracket content
      content = content.replace(/\.\.\.$/, ''); // Remove trailing ellipsis
      
      // Remove common unwanted patterns
      content = content.replace(/subscribe to our newsletter/gi, '');
      content = content.replace(/follow us on/gi, '');
      content = content.replace(/share this article/gi, '');
      content = content.replace(/related articles/gi, '');
      content = content.replace(/advertisement/gi, '');
      content = content.replace(/sponsored content/gi, '');
      
      // Remove extra whitespace
      content = content.replace(/\s+/g, ' ');
      content = content.trim();
      
      return content;
    } catch (error) {
      return '';
    }
  }

  // Check if content contains navigation elements
  private containsNavigationContent(content: string): boolean {
    const navKeywords = [
      'skip to content', 'opens in a new tab', 'chevron dropdown',
      'previous', 'next', 'round', 'schedule', 'results', 'standings',
      'archive', 'sign in', 'subscribe', 'f1 tv', 'hospitality',
      'experiences', 'store', 'tickets', 'authentics', 'fia',
      'race series', 'driver standings', 'team standings', 'full schedule'
    ];
    
    const lowerContent = content.toLowerCase();
    return navKeywords.some(keyword => lowerContent.includes(keyword));
  }

  // Generate placeholder image
  private generatePlaceholderImage(title: string): string {
    const encodedTitle = encodeURIComponent(title.substring(0, 30));
    return `https://via.placeholder.com/800x400/1f2937/ffffff?text=${encodedTitle}`;
  }

  // Get article from database by URL
  private async getArticleByUrl(url: string): Promise<NewsArticle | null> {
    try {
      // Clean the URL to avoid encoding issues
      const cleanUrl = url.split('?')[0]; // Remove query parameters
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .ilike('url', `%${cleanUrl}%`) // Use ILIKE for partial matching
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data as NewsArticle;
    } catch (error) {
      return null;
    }
  }

  // Save article to database
  private async saveArticle(article: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.image_url,
          author: article.author,
          published_at: article.published_at,
          source: article.source,
          category: article.category
        })
        .select()
        .single();

      if (error) {
        return null;
      }

      return data as NewsArticle;
    } catch (error) {
      return null;
    }
  }

  // Get cached articles from database
  async getCachedArticles(limit: number = 50): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      return data as NewsArticle[];
    } catch (error) {
      return [];
    }
  }

  // Get article by ID
  async getArticleById(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as NewsArticle;
    } catch (error) {
      return null;
    }
  }

  // Search articles
  async searchArticles(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      return data as NewsArticle[];
    } catch (error) {
      return [];
    }
  }
}

export const newsService = new NewsService(); 