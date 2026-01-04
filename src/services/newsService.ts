import Parser from 'rss-parser';
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

// Define RSS feed sources
const RSS_FEEDS = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Automobiles.xml', source: 'NYTimes Automobiles' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Baseball.xml', source: 'NYTimes Baseball' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Books/Review.xml', source: 'NYTimes Books Review' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NYTimes Business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', source: 'NYTimes Climate' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/CollegeBasketball.xml', source: 'NYTimes College Basketball' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/CollegeFootball.xml', source: 'NYTimes College Football' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Dance.xml', source: 'NYTimes Dance' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Dealbook.xml', source: 'NYTimes Dealbook' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/DiningandWine.xml', source: 'NYTimes Dining and Wine' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', source: 'NYTimes Economy' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml', source: 'NYTimes Education' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/EnergyEnvironment.xml', source: 'NYTimes Energy Environment' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml', source: 'NYTimes Europe' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml', source: 'NYTimes Fashion and Style' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Golf.xml', source: 'NYTimes Golf' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYTimes Health' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Hockey.xml', source: 'NYTimes Hockey' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYTimes Home Page' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Jobs.xml', source: 'NYTimes Jobs' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Lens.xml', source: 'NYTimes Lens' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NYTimes Middle East' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MostEmailed.xml', source: 'NYTimes Most Emailed' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYTimes Politics' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/RealEstate.xml', source: 'NYTimes Real Estate' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/SmallBusiness.xml', source: 'NYTimes Small Business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Soccer.xml', source: 'NYTimes Soccer' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Tennis.xml', source: 'NYTimes Tennis' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYTimes Technology' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/YourMoney.xml', source: 'NYTimes Your Money' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYTimes World' },
];

// Define popular news websites for crawling
const NEWS_SITES = [
  { baseUrl: 'https://www.bbc.com', source: 'BBC' },
  { baseUrl: 'https://www.reuters.com', source: 'Reuters' },
  { baseUrl: 'https://www.cnn.com', source: 'CNN' },
];

export class NewsService {
  private static instance: NewsService;
  private rssParser: Parser;
  
  private constructor() {
    this.rssParser = new Parser();
  }
  
  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }
  
  /**
   * Fetch articles from RSS feeds
   */
  private async fetchFromRSSFeeds(count: number = 10): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    
    try {
      // Fetch from multiple RSS feeds
      for (const feed of RSS_FEEDS) {
        try {
          const rss = await this.rssParser.parseURL(feed.url);
          
          // Add articles from this feed
          rss.items.slice(0, Math.ceil(count / RSS_FEEDS.length)).forEach((item, index) => {
            if (item.title && item.pubDate) {
              allArticles.push({
                id: `rss-${feed.source}-${Date.now()}-${index}`,
                title: item.title,
                summary: item.contentSnippet || item.summary || 'No summary available',
                source: feed.source,
                url: item.link || '',
                publishedAt: new Date(item.pubDate),
                imageUrl: item.enclosure?.url
              });
            }
          });
        } catch (error) {
          console.error(`Error fetching from RSS feed ${feed.url}:`, error);
          // Continue with other feeds even if one fails
        }
      }
      
      // Sort by date and limit to requested count
      return allArticles
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, count);
    } catch (error) {
      console.error('Error fetching from RSS feeds:', error);
      return [];
    }
  }
  
  /**
   * Simple web crawler for news sites (basic implementation)
   */
  /**
   * Get news articles for a location
   */
  public async getLocalNews(location?: LocationData): Promise<NewsTopic[]> {
    try {
      // Fetch articles from RSS feeds
      const rssArticles = await this.fetchFromRSSFeeds(15);
      
      // If we have location data, we would filter articles by location
      // For now, we'll just use all articles
      let relevantArticles = rssArticles;
      
      if (location && location.city) {
        // In a real implementation, we would filter articles by location
        // This is a simplified approach
        console.log(`Filtering articles for location: ${location.city}`);
      }
      
      // Transform articles to NewsTopic format
      const topics: NewsTopic[] = relevantArticles.slice(0, 10).map((article, index) => ({
        id: `news-${index}`,
        title: article.title.substring(0, 50) + (article.title.length > 50 ? '...' : ''),
        summary: article.summary.substring(0, 100) + (article.summary.length > 100 ? '...' : ''),
        source: article.source,
        locationRelevance: location ? 80 : 50, // Higher relevance for local news
        articles: [article],
        subTopics: [
          {
            id: `news-${index}-1`,
            title: 'Article Details',
            summary: `Full details of the article: ${article.title}`
          }
        ]
      }));
      
      return topics;
    } catch (error) {
      console.error('Error fetching local news:', error);
      // Fallback to mock data if RSS fetching fails
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
      // Fetch articles from RSS feeds
      const rssArticles = await this.fetchFromRSSFeeds(count * 2);
      
      // Filter articles by query (simple title matching)
      const filteredArticles = rssArticles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      );
      
      // If we don't have enough articles, crawl news sites
      let resultArticles = filteredArticles.slice(0, count);
      
      // Note: web crawling is disabled in the client build

      return resultArticles.slice(0, count);
    } catch (error) {
      console.error('Error searching news:', error);
      // Return mock data if RSS fetching fails
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
      // Fetch articles from RSS feeds (these are typically headlines)
      const rssArticles = await this.fetchFromRSSFeeds(10);
      
      // Sort by date to get the most recent
      return rssArticles
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      // Return mock data if RSS fetching fails
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
