import { newsService, NewsArticle } from './newsService';

class GlobalNewsService {
  private articles: NewsArticle[] = [];
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

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
      // Initialize with first batch of articles
      const initialArticles = await newsService.initialize();
      if (initialArticles.length > 0) {
        this.articles = initialArticles;
      }

      this.isInitialized = true;
    } catch (error) {
      // Silent error handling
      this.isInitialized = true;
    }
  }

  // Get current articles
  getArticles(): NewsArticle[] {
    return this.articles;
  }

  // Load more articles (pagination)
  async loadMoreArticles(): Promise<NewsArticle[]> {
    try {
      const newArticles = await newsService.loadMoreArticles();
      if (newArticles.length > 0) {
        this.articles.push(...newArticles);
      }
      return newArticles;
    } catch (error) {
      console.error('Failed to load more articles:', error);
      return [];
    }
  }

  // Check if there are more articles to load
  hasMoreArticles(): boolean {
    return newsService.hasMore();
  }

  // Refresh articles (for pull-to-refresh)
  async refresh(): Promise<NewsArticle[]> {
    try {
      // Reset pagination and get fresh articles
      newsService.resetPagination();
      const freshArticles = await newsService.initialize();
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
}

export const globalNewsService = new GlobalNewsService(); 