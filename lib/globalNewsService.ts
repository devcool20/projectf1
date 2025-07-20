import { newsService, NewsArticle } from './newsService';

class GlobalNewsService {
  private static instance: GlobalNewsService;
  private articles: NewsArticle[] = [];
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): GlobalNewsService {
    if (!GlobalNewsService.instance) {
      GlobalNewsService.instance = new GlobalNewsService();
    }
    return GlobalNewsService.instance;
  }

  // Initialize news fetching once on app startup
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization immediately without waiting
    this.initializationPromise = this.performInitialization();
    
    // Don't await here - let it run in background
    this.initializationPromise.then(() => {
      console.log('News service initialized successfully');
    }).catch((error) => {
      console.error('News service initialization failed:', error);
    });
    
    return Promise.resolve();
  }

  private async performInitialization(): Promise<void> {
    try {
      // First try to get cached articles
      const cachedArticles = await newsService.getCachedArticles(50);
      if (cachedArticles.length > 0) {
        this.articles = cachedArticles;
      }

      // Then fetch fresh news in background
      const freshArticles = await newsService.fetchAllNews();
      if (freshArticles.length > 0) {
        this.articles = freshArticles;
      }

      this.isInitialized = true;
    } catch (error) {
      // Silent error handling
      this.isInitialized = true;
    }
  }

  // Get all articles
  getArticles(): NewsArticle[] {
    return this.articles;
  }

  // Refresh articles (for pull-to-refresh)
  async refresh(): Promise<NewsArticle[]> {
    try {
      const freshArticles = await newsService.fetchAllNews();
      if (freshArticles.length > 0) {
        this.articles = freshArticles;
      }
      return this.articles;
    } catch (error) {
      return this.articles;
    }
  }

  // Search articles
  searchArticles(query: string): NewsArticle[] {
    if (!query.trim()) {
      return this.articles;
    }

    const searchTerm = query.toLowerCase();
    return this.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    );
  }

  // Get article by ID
  getArticleById(id: string): NewsArticle | null {
    return this.articles.find(article => article.id === id) || null;
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const globalNewsService = GlobalNewsService.getInstance(); 