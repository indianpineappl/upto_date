import axios from 'axios';
import { Topic, SubTopic } from '../types';

export class LLMService {
  private static instance: LLMService;
  private openaiApiKey: string;
  private openaiBaseUrl: string;
  
  private constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.openaiBaseUrl = 'https://api.openai.com/v1';
  }
  
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }
  
  /**
   * Summarize content using LLM
   */
  public async summarizeContent(content: string, topic: string): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes content concisely.'
            },
            {
              role: 'user',
              content: `Please provide a concise summary of the following content about ${topic}: ${content}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error summarizing content:', error);
      // Fallback to mock summary based on topic
      const summaries: Record<string, string> = {
        'Tech Innovation': 'Cutting-edge technology developments are reshaping industries. AI breakthroughs and quantum computing advances promise to revolutionize how we solve complex problems.',
        'Climate Action': 'Global climate initiatives are gaining momentum with new policy frameworks and renewable energy investments. Local communities are implementing sustainable practices to reduce carbon footprints.',
        'Health & Wellness': 'Mental health awareness is at an all-time high with new resources and support systems. Fitness trends are emphasizing holistic wellness approaches that combine physical and mental health.',
        'City Infrastructure Update': 'Major infrastructure investments are modernizing urban landscapes. New transportation networks and smart city technologies are improving quality of life for residents.',
        'Local Education Initiative': 'Innovative educational programs are preparing students for future careers. Partnerships between schools and tech companies are providing hands-on learning experiences.'
      };
      
      return summaries[topic] || `This is a comprehensive summary of ${topic}. The key points include major developments, important trends, and significant impacts on the community.`;
    }
  }
  
  /**
   * Generate sub-topics for a given topic
   */
  public async generateSubTopics(topic: string): Promise<SubTopic[]> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates sub-topics for a given topic. Return your response as a JSON array of objects with id, title, and summary properties.'
            },
            {
              role: 'user',
              content: `Generate 3 sub-topics for "${topic}". Return your response as a JSON array of objects with id, title, and summary properties. Each id should be prefixed with the topic name and a number (e.g., "${topic.toLowerCase().replace(/\s+/g, '-')}-1").`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Try to parse the response as JSON
      try {
        const content = response.data.choices[0].message.content.trim();
        // Remove markdown code block markers if present
        const jsonContent = content.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonContent);
      } catch (parseError) {
        // If parsing fails, generate mock sub-topics
        throw new Error('Failed to parse sub-topics response');
      }
    } catch (error) {
      console.error('Error generating sub-topics:', error);
      // Fallback to mock sub-topics
      const subTopicsMap: Record<string, SubTopic[]> = {
        'Tech Innovation': [
          { 
            id: 'tech-1', 
            title: 'AI Breakthroughs', 
            summary: 'Recent advancements in artificial intelligence are enabling new applications across industries.' 
          },
          { 
            id: 'tech-2', 
            title: 'Quantum Computing', 
            summary: 'Quantum processors are solving problems previously thought to be computationally impossible.' 
          },
          { 
            id: 'tech-3', 
            title: 'Biotechnology', 
            summary: 'Genetic engineering and personalized medicine are transforming healthcare.' 
          }
        ],
        'Climate Action': [
          { 
            id: 'climate-1', 
            title: 'Renewable Energy', 
            summary: 'Solar and wind power technologies are becoming more efficient and cost-effective.' 
          },
          { 
            id: 'climate-2', 
            title: 'Carbon Reduction', 
            summary: 'Innovative methods for capturing and storing carbon emissions are showing promise.' 
          },
          { 
            id: 'climate-3', 
            title: 'Sustainable Agriculture', 
            summary: 'New farming techniques are reducing environmental impact while maintaining productivity.' 
          }
        ],
        'Health & Wellness': [
          { 
            id: 'health-1', 
            title: 'Mental Health Awareness', 
            summary: 'Communities are prioritizing mental health resources and reducing stigma.' 
          },
          { 
            id: 'health-2', 
            title: 'Fitness Innovation', 
            summary: 'Wearable technology and personalized training programs are revolutionizing fitness.' 
          },
          { 
            id: 'health-3', 
            title: 'Nutrition Science', 
            summary: 'Research into personalized nutrition is helping people optimize their diets.' 
          }
        ]
      };
      
      return subTopicsMap[topic] || [
        { 
          id: 'default-1', 
          title: 'Key Developments', 
          summary: 'Important recent developments in this area.' 
        },
        { 
          id: 'default-2', 
          title: 'Future Outlook', 
          summary: 'What to expect in the coming months.' 
        }
      ];
    }
  }
  
  /**
   * Generate an image prompt based on a topic
   */
  public async generateImagePrompt(topic: string): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative assistant that generates detailed image prompts for DALL-E. Focus on visual elements, style, and mood.'
            },
            {
              role: 'user',
              content: `Generate a detailed image prompt for DALL-E based on the topic "${topic}". Include visual elements, style (e.g., realistic, digital art, painting), and mood. Keep it concise but descriptive.`
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating image prompt:', error);
      // Fallback to mock prompts
      const prompts: Record<string, string> = {
        'Tech Innovation': 'Futuristic cityscape with holographic displays and flying vehicles, digital art style',
        'Climate Action': 'Lush green landscape with solar panels and wind turbines, realistic style',
        'Health & Wellness': 'Peaceful meditation scene with natural light and plants, soft focus',
        'City Infrastructure Update': 'Modern urban transportation hub with clean design and smart technology',
        'Local Education Initiative': 'Diverse group of students collaborating with technology in a bright classroom'
      };
      
      return prompts[topic] || `Abstract representation of ${topic} concept, modern artistic style`;
    }
  }
  
  /**
   * Generate an image using DALL-E
   */
  public async generateImage(prompt: string): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await axios.post(
        `${this.openaiBaseUrl}/images/generations`,
        {
          prompt: prompt,
          n: 1,
          size: '512x512'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to placeholder image
      return 'https://placehold.co/600x400/6e8efb/ffffff?text=Generated+Image';
    }
  }
  
  /**
   * Analyze sentiment of content
   */
  public async analyzeSentiment(content: string): Promise<'positive' | 'negative' | 'neutral'> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a sentiment analysis tool. Analyze the sentiment of the provided text and respond with only one word: "positive", "negative", or "neutral".'
            },
            {
              role: 'user',
              content: `Analyze the sentiment of this text: ${content}`
            }
          ],
          max_tokens: 10,
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const sentiment = response.data.choices[0].message.content.trim().toLowerCase();
      if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
        return sentiment as 'positive' | 'negative' | 'neutral';
      } else {
        throw new Error('Invalid sentiment response');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Fallback to keyword-based sentiment analysis
      const positiveKeywords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'success'];
      const negativeKeywords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'problem'];
      
      const positiveCount = positiveKeywords.filter(word => 
        content.toLowerCase().includes(word)
      ).length;
      
      const negativeCount = negativeKeywords.filter(word => 
        content.toLowerCase().includes(word)
      ).length;
      
      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    }
  }
}

export default LLMService.getInstance();
