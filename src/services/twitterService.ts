import axios from 'axios';
import { Topic } from '../types';

export interface TwitterTrend {
  name: string;
  tweet_volume: number;
  url: string;
}

export interface TwitterTopic extends Topic {
  tweetCount?: number;
  trendScore?: number;
  influentialAccounts?: string[];
}

export class TwitterService {
  private static instance: TwitterService;
  private baseUrl: string;
  private apiKey: string;
  private bearerToken: string;
  
  private constructor() {
    this.baseUrl = 'https://api.twitter.com/2';
    this.apiKey = process.env.REACT_APP_TWITTER_API_KEY || '';
    this.bearerToken = process.env.REACT_APP_TWITTER_BEARER_TOKEN || '';
  }
  
  public static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }
  
  /**
   * Get trending topics for a location
   */
  public async getTrendingTopics(lat?: number, lng?: number): Promise<TwitterTopic[]> {
    try {
      // For now, we'll use worldwide trends since getting location-specific trends
      // requires a WOEID (Where On Earth ID) which we would need to obtain separately
      const response = await axios.get(`${this.baseUrl}/trends`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        },
        params: {
          id: 1 // Worldwide WOEID
        }
      });
      
      // Transform Twitter API response to our Topic format
      return response.data.data.map((trend: any, index: number) => ({
        id: `twitter-${index}`,
        title: trend.name,
        summary: `Trending topic on Twitter with ${trend.tweet_volume || 0} tweets`,
        tweetCount: trend.tweet_volume || 0,
        trendScore: trend.tweet_volume ? Math.min(trend.tweet_volume / 1000, 100) : 0,
        influentialAccounts: [],
        subTopics: [
          {
            id: `twitter-${index}-1`,
            title: `Recent discussions about ${trend.name}`,
            summary: `Latest conversations and mentions of ${trend.name} on Twitter`
          }
        ]
      }));
    } catch (error) {
      console.error('Error fetching Twitter trends:', error);
      // Fallback to mock data if API call fails
      return [
        {
          id: 'twitter-1',
          title: 'Tech Innovation',
          summary: 'Latest developments in technology and innovation',
          tweetCount: 15420,
          trendScore: 95,
          influentialAccounts: ['@techreview', '@innovate'],
          subTopics: [
            { 
              id: 'twitter-1-1', 
              title: 'AI Breakthroughs', 
              summary: 'New advancements in artificial intelligence and machine learning' 
            },
            { 
              id: 'twitter-1-2', 
              title: 'Quantum Computing', 
              summary: 'Progress in quantum computing research and applications' 
            }
          ]
        },
        {
          id: 'twitter-2',
          title: 'Climate Action',
          summary: 'Global and local initiatives for climate change mitigation',
          tweetCount: 12350,
          trendScore: 88,
          influentialAccounts: ['@climateorg', '@greenfuture'],
          subTopics: [
            { 
              id: 'twitter-2-1', 
              title: 'Renewable Energy', 
              summary: 'Advancements in solar, wind, and other renewable energy sources' 
            },
            { 
              id: 'twitter-2-2', 
              title: 'Policy Changes', 
              summary: 'New environmental policies and their impact' 
            }
          ]
        }
      ];
    }
  }
  
  /**
   * Search for tweets related to a topic
   */
  public async searchTweets(query: string, count: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        },
        params: {
          query: query,
          max_results: count,
          'tweet.fields': 'author_id,public_metrics,created_at'
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching tweets:', error);
      // Return mock data if API call fails
      return [
        {
          id: 'tweet-1',
          text: `Just read an amazing article about ${query}! The future looks bright. #innovation`,
          author_id: 'techenthusiast',
          public_metrics: {
            retweet_count: 42,
            like_count: 120
          },
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'tweet-2',
          text: `Can't believe the progress in ${query} this year. Mind-blowing developments!`,
          author_id: 'futurist',
          public_metrics: {
            retweet_count: 28,
            like_count: 87
          },
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
    }
  }
  
  /**
   * Get influential accounts tweeting about a topic
   */
  public async getInfluentialAccounts(topic: string): Promise<string[]> {
    // In a real implementation, we would search for users who frequently tweet about the topic
    // and have high follower counts or engagement rates
    try {
      const response = await axios.get(`${this.baseUrl}/users/by`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        },
        params: {
          usernames: 'twitterdev,twitterapi', // Example accounts
          'user.fields': 'public_metrics'
        }
      });
      
      return response.data.data?.map((user: any) => `@${user.username}`) || [];
    } catch (error) {
      console.error('Error fetching influential accounts:', error);
      // Return mock data if API call fails
      return [
        '@techreview',
        '@innovate',
        '@futuretech',
        '@digitaltrends'
      ];
    }
  }
}

export default TwitterService.getInstance();
