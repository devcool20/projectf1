// News API configuration
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

// Fallback to a different news API if News API fails
const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';
const GNEWS_API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY || 'your-gnews-api-key'; // You'll need to get a free key from gnews.io

// Formula 1 related search terms - more specific to avoid irrelevant results
const F1_SEARCH_TERMS = [
  '"Formula 1"',
  '"Formula One"',
  '"F1 racing"',
  '"Grand Prix"',
  '"F1 championship"'
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

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

class NewsService {
  private cache: Map<string, NewsArticle> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private currentPage: number = 1;
  private hasMoreArticles: boolean = true;
  private allProcessedArticles: NewsArticle[] = [];
  private readonly ARTICLES_PER_PAGE = 5;

  // Fetch news from News API with fallback
  async fetchNewsFromAPI(searchTerm: string, page: number = 1, useTopHeadlines: boolean = false): Promise<NewsAPIArticle[]> {
    try {
      // Check if we have valid API keys
      if (!NEWS_API_KEY || NEWS_API_KEY === 'your-news-api-key') {
        console.log('No valid News API key found, using mock data...');
        return this.getMockArticles();
      }

      // Try News API first
      const newsApiArticles = await this.fetchFromNewsAPI(searchTerm, page, useTopHeadlines);
      if (newsApiArticles.length > 0) {
        return newsApiArticles;
      }
      
      // Fallback to GNews API
      console.log('News API failed, trying GNews API...');
      const gnewsArticles = await this.fetchFromGNewsAPI(searchTerm, page);
      if (gnewsArticles.length > 0) {
        return gnewsArticles;
      }
      
      // Final fallback to mock data
      console.log('All APIs failed, using mock data...');
      return this.getMockArticles();
    } catch (error) {
      console.error('All news APIs failed:', error);
      return this.getMockArticles();
    }
  }

  // Fetch from News API
  private async fetchFromNewsAPI(searchTerm: string, page: number = 1, useTopHeadlines: boolean = false): Promise<NewsAPIArticle[]> {
    try {
      if (!NEWS_API_KEY || NEWS_API_KEY === 'your-news-api-key') {
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
        pageSize: '10', // Reduced from 20 to avoid rate limiting
        apiKey: NEWS_API_KEY
      });
      
      // Add domain filtering only for everything endpoint
      if (!useTopHeadlines) {
        params.append('domains', domainsParam);
      }

      const endpoint = useTopHeadlines ? 'top-headlines' : 'everything';
      const response = await fetch(`${NEWS_API_BASE_URL}/${endpoint}?${params}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log('News API rate limit reached, will try GNews API...');
        } else {
          console.error(`❌ News API request failed: ${response.status} ${response.statusText}`);
        }
        return [];
      }

      const data: NewsAPIResponse = await response.json();
      
      if (data.status !== 'ok') {
        return [];
      }

      return data.articles;
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }

  // Fetch from GNews API
  private async fetchFromGNewsAPI(searchTerm: string, page: number = 1): Promise<NewsAPIArticle[]> {
    try {
      if (!GNEWS_API_KEY || GNEWS_API_KEY === 'your-gnews-api-key') {
        console.log('No valid GNews API key found, using mock data...');
        return [];
      }
      
      const params = new URLSearchParams({
        q: searchTerm,
        lang: 'en',
        country: 'us',
        max: '10', // Reduced from 20 to avoid rate limiting
        page: page.toString(),
        apikey: GNEWS_API_KEY
      });

      const response = await fetch(`${GNEWS_API_BASE_URL}/search?${params}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          console.log('GNews API key invalid or expired, using mock data...');
        } else {
          console.error(`❌ GNews API request failed: ${response.status} ${response.statusText}`);
        }
        return [];
      }

      const data = await response.json();
      
      if (!data.articles) {
        return [];
      }

      // Convert GNews format to NewsAPI format
      return data.articles.map((article: any) => ({
        source: {
          id: null,
          name: article.source?.name || 'Unknown'
        },
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        content: article.content
      }));
    } catch (error) {
      console.error('GNews API error:', error);
      return [];
    }
  }

  // Remove duplicate articles based on URL
  private removeDuplicateArticles(articles: NewsAPIArticle[]): NewsAPIArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const url = article.url.split('?')[0]; // Remove query parameters
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  }

  // Clean content by removing HTML tags and extra whitespace
  private cleanContent(content: string): string {
    if (!content) return '';
    
    // Remove HTML tags
    let cleaned = content.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace and newlines
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (keep it reasonable for mobile)
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 500) + '...';
    }
    
    return cleaned;
  }

  // Check if content contains navigation or irrelevant text
  private containsNavigationContent(content: string): boolean {
    const navigationKeywords = [
      'click here', 'read more', 'continue reading', 'subscribe', 'sign up',
      'advertisement', 'ad', 'sponsored', 'cookie policy', 'privacy policy'
    ];
    
    const lowerContent = content.toLowerCase();
    return navigationKeywords.some(keyword => lowerContent.includes(keyword));
  }

  // Generate placeholder image using a more reliable service
  private generatePlaceholderImage(title: string): string {
    // Use a more reliable placeholder service or local assets
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `https://picsum.photos/400/200?random=${Date.now()}&text=${encodedTitle}`;
  }

  // Initialize and fetch first batch of articles
  async initialize(): Promise<NewsArticle[]> {
    if (this.allProcessedArticles.length > 0) {
      // Return first page from cache
      return this.allProcessedArticles.slice(0, this.ARTICLES_PER_PAGE);
    }

    try {
      const articles = await this.fetchAllNews();
      return articles.slice(0, this.ARTICLES_PER_PAGE);
    } catch (error) {
      console.error('Failed to initialize news:', error);
      return this.getMockArticles().slice(0, this.ARTICLES_PER_PAGE);
    }
  }

  // Load more articles (pagination)
  async loadMoreArticles(): Promise<NewsArticle[]> {
    if (!this.hasMoreArticles) {
      return [];
    }

    const startIndex = (this.currentPage - 1) * this.ARTICLES_PER_PAGE;
    const endIndex = startIndex + this.ARTICLES_PER_PAGE;
    
    // If we have enough articles in cache, return them
    if (endIndex <= this.allProcessedArticles.length) {
      this.currentPage++;
      return this.allProcessedArticles.slice(startIndex, endIndex);
    }

    // If we need to fetch more articles
    try {
      const newArticles = await this.fetchMoreNews();
      if (newArticles.length > 0) {
        this.allProcessedArticles.push(...newArticles);
        this.currentPage++;
        return newArticles.slice(0, this.ARTICLES_PER_PAGE);
      } else {
        this.hasMoreArticles = false;
        return [];
      }
    } catch (error) {
      console.error('Failed to load more articles:', error);
      this.hasMoreArticles = false;
      return [];
    }
  }

  // Check if there are more articles to load
  hasMore(): boolean {
    return this.hasMoreArticles;
  }

  // Reset pagination
  resetPagination(): void {
    this.currentPage = 1;
    this.hasMoreArticles = true;
  }

  // Fetch all Formula 1 news from multiple search terms
  async fetchAllNews(): Promise<NewsArticle[]> {
    const now = Date.now();
    
    // Check cache first
    if (now - this.lastFetch < this.CACHE_DURATION && this.allProcessedArticles.length > 0) {
      return this.allProcessedArticles;
    }

    // Add timeout to prevent hanging
    const timeout = new Promise<NewsArticle[]>((_, reject) => {
      setTimeout(() => reject(new Error('News fetch timeout')), 30000); // 30 second timeout
    });

    try {
      const fetchPromise = (async () => {
        const allArticles: NewsAPIArticle[] = [];
        const usedImageUrls = new Set<string>(); // Track used image URLs
        
        // Fetch from fewer search terms to avoid rate limiting
        const searchTerms = F1_SEARCH_TERMS.slice(0, 2); // Reduced to 2 terms for initial load
        
        for (const searchTerm of searchTerms) {
          const articles = await this.fetchNewsFromAPI(searchTerm);
          allArticles.push(...articles);
          
          // Add longer delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 1000ms to 2000ms
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
               pageSize: '10', // Reduced from 20
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
         
         // Process articles and convert to our format
         const processedArticles: NewsArticle[] = [];
         const limit = Math.min(f1RelevantArticles.length, 15); // Reduced to 15 for initial load
        
        for (let i = 0; i < limit; i++) {
          const apiArticle = f1RelevantArticles[i];
          
          // Convert News API article to our format
          const article: NewsArticle = {
            id: `article_${i}_${Date.now()}`, // Generate unique ID
            title: apiArticle.title,
            description: apiArticle.description || '',
            content: apiArticle.content || apiArticle.description || '',
            url: apiArticle.url,
            image_url: apiArticle.urlToImage,
            author: apiArticle.author,
            published_at: apiArticle.publishedAt,
            source: apiArticle.source.name,
            category: 'F1 News',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
          
          // Only include articles with images and good content
          if (article.image_url && hasGoodContent) {
            processedArticles.push(article);
          }
        }

        // Update cache
        this.allProcessedArticles = processedArticles;
        this.lastFetch = now;

        return processedArticles;
      })();

      return await Promise.race([fetchPromise, timeout]);
    } catch (error) {
      console.error('News fetch error:', error);
      return [];
    }
  }

  // Fetch more news for pagination
  private async fetchMoreNews(): Promise<NewsArticle[]> {
    try {
      const allArticles: NewsAPIArticle[] = [];
      const usedImageUrls = new Set<string>();
      
      // Get already used image URLs
      this.allProcessedArticles.forEach(article => {
        if (article.image_url) {
          usedImageUrls.add(article.image_url);
        }
      });
      
      // Fetch from additional search terms or next page
      const searchTerms = F1_SEARCH_TERMS.slice(2, 4); // Get next 2 terms
      
      for (const searchTerm of searchTerms) {
        const articles = await this.fetchNewsFromAPI(searchTerm, 2); // Try page 2
        allArticles.push(...articles);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Process new articles
      const uniqueArticles = this.removeDuplicateArticles(allArticles);
      const articlesWithImages = uniqueArticles.filter(article => 
        article.urlToImage && 
        article.urlToImage.trim() !== '' &&
        article.urlToImage !== 'null'
      );
      
      const f1RelevantArticles = articlesWithImages.filter(article => {
        const title = article.title.toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = (article.content || '').toLowerCase();
        
        const f1Keywords = [
          'formula 1', 'formula one', 'f1', 'grand prix', 'gp',
          'max verstappen', 'lewis hamilton', 'charles leclerc', 'lando norris',
          'ferrari', 'mercedes', 'red bull', 'mclaren', 'aston martin',
          'alpine', 'williams', 'haas', 'alfa romeo', 'alpha tauri',
          'racing', 'qualifying', 'practice', 'race', 'championship',
          'podium', 'pole position', 'fastest lap', 'pit stop',
          'team principal', 'driver', 'constructor', 'points'
        ];
        
        const hasF1Content = f1Keywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          content.includes(keyword)
        );
        
        return hasF1Content;
      });
      
      const processedArticles: NewsArticle[] = [];
      const limit = Math.min(f1RelevantArticles.length, 10); // Limit to 10 new articles
        
      for (let i = 0; i < limit; i++) {
        const apiArticle = f1RelevantArticles[i];
        
        const article: NewsArticle = {
          id: `article_${this.allProcessedArticles.length + i}_${Date.now()}`,
          title: apiArticle.title,
          description: apiArticle.description || '',
          content: apiArticle.content || apiArticle.description || '',
          url: apiArticle.url,
          image_url: apiArticle.urlToImage,
          author: apiArticle.author,
          published_at: apiArticle.publishedAt,
          source: apiArticle.source.name,
          category: 'F1 News',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (article.content) {
          article.content = this.cleanContent(article.content);
        }

        if (!article.content || article.content.trim() === '') {
          article.content = article.description || '';
        }

        if (article.image_url && usedImageUrls.has(article.image_url)) {
          article.image_url = this.generatePlaceholderImage(article.title || 'F1 News');
        }
        
        if (article.image_url) {
          usedImageUrls.add(article.image_url);
        }

        const hasGoodContent = article.content && 
          article.content.length >= 100 && 
          !this.containsNavigationContent(article.content);
        
        if (article.image_url && hasGoodContent) {
          processedArticles.push(article);
        }
      }

      return processedArticles;
    } catch (error) {
      console.error('Failed to fetch more news:', error);
      return [];
    }
  }

  // Get mock articles as final fallback
  private getMockArticles(): NewsAPIArticle[] {
    return [
      {
        source: { id: null, name: 'Formula 1 Official' },
        author: 'F1 Media',
        title: 'Max Verstappen Dominates Practice Session Ahead of Grand Prix',
        description: 'Red Bull driver shows exceptional pace in final practice session, setting the fastest lap time.',
        url: 'https://www.formula1.com',
        urlToImage: 'https://picsum.photos/400/200?random=1&text=Max+Verstappen',
        publishedAt: new Date().toISOString(),
        content: 'Max Verstappen continued his impressive form by topping the timesheets in the final practice session ahead of this weekend\'s Grand Prix. The Red Bull driver set a blistering pace that left his competitors trailing by over half a second.'
      },
      {
        source: { id: null, name: 'ESPN F1' },
        author: 'ESPN Staff',
        title: 'Lewis Hamilton Discusses Future Plans with Mercedes',
        description: 'Seven-time world champion opens up about his contract negotiations and future in Formula 1.',
        url: 'https://www.espn.com/f1',
        urlToImage: 'https://picsum.photos/400/200?random=2&text=Lewis+Hamilton',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'Lewis Hamilton has revealed details about his ongoing contract negotiations with Mercedes, expressing his desire to continue racing in Formula 1. The seven-time world champion emphasized his commitment to the team and his passion for the sport.'
      },
      {
        source: { id: null, name: 'Autosport' },
        author: 'Autosport Staff',
        title: 'Ferrari Shows Strong Pace in Latest Testing Session',
        description: 'Scuderia Ferrari demonstrates promising performance with their latest car updates.',
        url: 'https://www.autosport.com/f1',
        urlToImage: 'https://picsum.photos/400/200?random=3&text=Ferrari',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        content: 'Ferrari has shown encouraging signs during their latest testing session, with both Charles Leclerc and Carlos Sainz reporting positive feedback about the car\'s handling and performance characteristics.'
      }
    ];
  }

  // Get cached articles (now just returns the in-memory cache)
  async getCachedArticles(limit: number = 50): Promise<NewsArticle[]> {
    return Array.from(this.cache.values()).slice(0, limit);
  }

  // Get article by ID (from cache)
  async getArticleById(id: string): Promise<NewsArticle | null> {
    return this.cache.get(id) || null;
  }

  // Search articles (from cache)
  async searchArticles(query: string, limit: number = 20): Promise<NewsArticle[]> {
    if (!query.trim()) {
      return Array.from(this.cache.values()).slice(0, limit);
    }

    const searchTerm = query.toLowerCase();
    const results = Array.from(this.cache.values()).filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    );

    return results.slice(0, limit);
  }
}

export const newsService = new NewsService(); 