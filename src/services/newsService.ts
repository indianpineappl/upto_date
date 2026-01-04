import axios from 'axios';
import { Topic, LocationData } from '../types';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface NewsTopic extends Topic {
  articles?: NewsArticle[];
  source?: string;
  locationRelevance?: number;
}

export class NewsService {
  private static instance: NewsService;
  private baseUrl: string;
  private apiKey: string;
  
  private constructor() {
    this.baseUrl = 'https://newsapi.org/v2';
    this.apiKey = process.env.REACT_APP_NEWS_API_KEY || '';
  }
  
  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }
  
  /**
   * Get news articles for a location
   */
  public async getLocalNews(location?: LocationData): Promise<NewsTopic[]> {
    try {
      // For location-based news, we would typically use the city name
      // For now, we'll use a general query
      let query = 'latest';
      
      if (location) {
        // In a real implementation, we would reverse geocode the coordinates
        // to get the city name and use it in the query
        query = 'local';
      }
      
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          apiKey: this.apiKey,
          pageSize: 10,
          sortBy: 'publishedAt'
        }
      });
      
      // Transform News API response to our Topic format
      return response.data.articles.map((article: any, index: number) => ({
        id: `news-${index}`,
        title: article.title.substring(0, 50) + (article.title.length > 50 ? '...' : ''),
        summary: article.description ? article.description.substring(0, 100) + (article.description.length > 100 ? '...' : '') : 'No summary available',
        source: article.source.name,
        locationRelevance: location ? 80 : 50, // Higher relevance for local news
        articles: [
          {
            id: `article-${index}-1`,
            title: article.title,
            summary: article.description || 'No description available',
            source: article.source.name,
            url: article.url,
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.urlToImage
          }
        ],
        subTopics: [
          {
            id: `news-${index}-1`,
            title: 'Article Details',
            summary: `Full details of the article: ${article.title}`
          }
        ]
      }));
    } catch (error) {
      console.error('Error fetching local news:', error);
      // Fallback to mock data if API call fails
      return [
        {
          id: 'news-1',
          title: 'City Infrastructure Update',
          summary: 'Major improvements planned for public transportation and road systems',
          source: 'Local Daily News',
          locationRelevance: 92,
          articles: [
            {
              id: 'article-1-1',
              title: 'New Metro Line to Connect Downtown to Airport',
              summary: 'City council approves $2.3 billion project to expand public transit',
              source: 'Local Daily News',
              url: 'https://example.com/article-1',
              publishedAt: new Date(Date.now() - 86400000)
            },
            {
              id: 'article-1-2',
              title: 'Road Construction to Begin Next Month',
              summary: 'Multi-year project to improve highway infrastructure',
              source: 'City Reporter',
              url: 'https://example.com/article-2',
              publishedAt: new Date(Date.now() - 172800000)
            }
          ],
          subTopics: [
            { 
              id: 'news-1-1', 
              title: 'Transportation', 
              summary: 'Updates on public transit and road improvements' 
            },
            { 
              id: 'news-1-2', 
              title: 'Budget Allocation', 
              summary: 'How the city is funding these infrastructure projects' 
            }
          ]
        },
        {
          id: 'news-2',
          title: 'Local Education Initiative',
          summary: 'New program aims to improve STEM education in public schools',
          source: 'Education Journal',
          locationRelevance: 85,
          articles: [
            {
              id: 'article-2-1',
              title: 'Tech Companies Partner with Schools',
              summary: 'Local tech firms donate equipment and mentorship hours',
              source: 'Education Journal',
              url: 'https://example.com/article-3',
              publishedAt: new Date(Date.now() - 259200000)
            }
          ],
          subTopics: [
            { 
              id: 'news-2-1', 
              title: 'Partnerships', 
              summary: 'Collaboration between schools and local businesses' 
            },
            { 
              id: 'news-2-2', 
              title: 'Curriculum Changes', 
              summary: 'Updates to STEM programs in local schools' 
            }
          ]
        }
      ];
    }
  }
  
  /**
   * Search for news articles by topic
   */
  public async searchNews(query: string, count: number = 10): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          apiKey: this.apiKey,
          pageSize: count,
          sortBy: 'relevancy'
        }
      });
      
      return response.data.articles.map((article: any) => ({
        id: article.id || `article-${Math.random()}`,
        title: article.title,
        summary: article.description || 'No description available',
        source: article.source.name,
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        imageUrl: article.urlToImage
      }));
    } catch (error) {
      console.error('Error searching news:', error);
      // Return mock data if API call fails
      return [
        {
          id: 'search-1',
          title: `${query}: What You Need to Know`,
          summary: `Comprehensive overview of recent developments in ${query}`,
          source: 'Global News Network',
          url: 'https://example.com/search-1',
          publishedAt: new Date()
        },
        {
          id: 'search-2',
          title: `Experts Weigh In on ${query}`,
          summary: `Leading professionals share insights on ${query} trends`,
          source: 'Industry Review',
          url: 'https://example.com/search-2',
          publishedAt: new Date(Date.now() - 86400000)
        }
      ];
    }
  }
  
  /**
   * Get top headlines
   */
  public async getTopHeadlines(): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          apiKey: this.apiKey,
          country: 'us', // Default to US, could be customized
          pageSize: 10
        }
      });
      
      return response.data.articles.map((article: any) => ({
        id: article.id || `headline-${Math.random()}`,
        title: article.title,
        summary: article.description || 'No description available',
        source: article.source.name,
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        imageUrl: article.urlToImage
      }));
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      // Return mock data if API call fails
      return [
        {
          id: 'headline-1',
          title: 'Global Climate Summit Reaches Historic Agreement',
          summary: 'World leaders commit to ambitious new carbon reduction targets',
          source: 'International News',
          url: 'https://example.com/headline-1',
          publishedAt: new Date(Date.now() - 3600000)
        },
        {
          id: 'headline-2',
          title: 'Breakthrough in Renewable Energy Storage',
          summary: 'Scientists develop new battery technology with 10x capacity',
          source: 'Science Daily',
          url: 'https://example.com/headline-2',
          publishedAt: new Date(Date.now() - 7200000)
        }
      ];
    }
  }
}

export default NewsService.getInstance();
