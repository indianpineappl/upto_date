import axios from 'axios';
import { NewsArticle } from './newsService';

// Define the structure for news sites
interface NewsSite {
  baseUrl: string;
  source: string;
  selectors: {
    article: string;
    title: string;
    summary: string;
    link: string;
  };
}

// Define news websites to crawl
const NEWS_SITES: NewsSite[] = [
  { baseUrl: 'https://www.ndtv.com', source: 'NDTV', selectors: { article: '.news_Itm', title: 'h2.newsHdng a', summary: '.newsCont', link: 'h2.newsHdng a' } },
  { baseUrl: 'https://www.indiatoday.in', source: 'India Today', selectors: { article: '.catagory-listing', title: 'h2 a', summary: '.detail', link: 'h2 a' } },
];

export class WebCrawler {
  private static instance: WebCrawler;
  
  private constructor() {}

  private parseHtml(html: string) {
    // DOMParser is available in browser environments (CRA build target)
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  private text(el: Element | null | undefined): string {
    return (el?.textContent || '').trim();
  }

  private attr(el: Element | null | undefined, name: string): string {
    return (el?.getAttribute(name) || '').trim();
  }
  
  public static getInstance(): WebCrawler {
    if (!WebCrawler.instance) {
      WebCrawler.instance = new WebCrawler();
    }
    return WebCrawler.instance;
  }
  
  /**
   * Crawl a specific news website
   */
  private async crawlSite(site: any, count: number): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(site.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const doc = this.parseHtml(String(response.data || ''));
      const articles: NewsArticle[] = [];

      const nodes = Array.from(doc.querySelectorAll(site.selectors.article));
      nodes.slice(0, count).forEach((element: Element, index: number) => {
        const titleElement = element.querySelector(site.selectors.title);
        const summaryElement = element.querySelector(site.selectors.summary);
        const linkElement = element.querySelector(site.selectors.link);

        const title = this.text(titleElement);
        const summary = this.text(summaryElement);
        const href = this.attr(linkElement, 'href');
        const url = href
          ? href.startsWith('http')
            ? href
            : site.baseUrl + href
          : '';

        if (title && url) {
          articles.push({
            id: `crawl-${site.source}-${Date.now()}-${index}`,
            title: title.substring(0, 100),
            summary: summary.substring(0, 200) || 'No summary available',
            source: site.source,
            url: url,
            publishedAt: new Date()
          });
        }
      });
      
      return articles;
    } catch (error) {
      console.error(`Error crawling ${site.source}:`, error);
      return [];
    }
  }
  
  /**
   * Crawl multiple news websites
   */
  public async crawlNewsSites(count: number = 10): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    const articlesPerSite = Math.ceil(count / NEWS_SITES.length);
    
    // Crawl each site
    for (const site of NEWS_SITES) {
      try {
        const articles = await this.crawlSite(site, articlesPerSite);
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error crawling ${site.source}:`, error);
      }
    }
    
    // Sort by date and limit to requested count
    return allArticles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, count);
  }
  
  /**
   * Crawl a specific article URL to get more detailed content
   */
  public async crawlArticle(url: string): Promise<{ content: string; images: string[] } | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const doc = this.parseHtml(String(response.data || ''));
      
      // Try to extract article content (this is a simplified approach)
      // In a real implementation, you would need more sophisticated selectors
      // based on each website's structure
      let content = '';
      const images: string[] = [];
      
      // Try common content selectors
      const contentSelectors = [
        'article',
        '.article-content',
        '.story-content',
        '.news-content',
        '.post-content',
        '.content'
      ];
      
      for (const selector of contentSelectors) {
        const contentElement = doc.querySelector(selector);
        if (contentElement) {
          content = this.text(contentElement);
          break;
        }
      }
      
      // Extract images
      Array.from(doc.querySelectorAll('img')).forEach((element: Element) => {
        const src = this.attr(element, 'src');
        if (src) {
          images.push(src.startsWith('http') ? src : url + src);
        }
      });
      
      return { content, images };
    } catch (error) {
      console.error(`Error crawling article ${url}:`, error);
      return null;
    }
  }
}

export default WebCrawler.getInstance();
