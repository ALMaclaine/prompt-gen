import axios from 'axios';

export interface AIService {
  generatePrompt(topic: string): Promise<string>;
}

interface CacheEntry {
  prompt: string;
  timestamp: number;
}

export class OpenRouterService implements AIService {
  private apiKey: string;
  private apiUrl: string;
  private cache: Map<string, CacheEntry>;
  private requestCount: number;
  private requestReset: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.cache = new Map();
    this.requestCount = 0;
    this.requestReset = Date.now() + 60000; // Reset after 1 minute

    if (!this.apiKey) {
      console.warn('OpenRouter API key is not set. Please set the OPENAI_API_KEY environment variable.');
    }
  }

  async generatePrompt(topic: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not set');
    }

    // Check cache
    const cachedPrompt = this.getCachedPrompt(topic);
    if (cachedPrompt) {
      return cachedPrompt;
    }

    // Rate limiting
    if (this.requestCount >= 10 && Date.now() < this.requestReset) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert prompt engineer, skilled at creating thought-provoking and engaging prompts on various topics. Your task is to generate a high-quality prompt based on the given topic. The prompt should:

1. Encourage critical thinking and deep reflection
2. Be open-ended to allow for diverse responses
3. Incorporate relevant context or background information when necessary
4. Challenge common assumptions or perspectives
5. Be clear and concise, typically one or two sentences long
6. Avoid yes/no questions or overly simplistic queries
7. Be suitable for a general audience with some knowledge of the topic`
            },
            {
              role: 'user',
              content: `Generate a thought-provoking prompt about the following topic: ${topic}. The prompt should spark interesting discussions and encourage unique perspectives.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:4200', // Replace with your actual domain in production
            'X-Title': 'Prompt Generator'
          }
        }
      );

      const generatedPrompt = response.data.choices[0].message.content.trim();
      
      // Update cache and rate limiting
      this.cachePrompt(topic, generatedPrompt);
      this.updateRateLimit();

      return generatedPrompt;
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw new Error('Failed to generate prompt. Please try again.');
    }
  }

  private getCachedPrompt(topic: string): string | null {
    const cacheEntry = this.cache.get(topic);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < 3600000) { // Cache for 1 hour
      return cacheEntry.prompt;
    }
    return null;
  }

  private cachePrompt(topic: string, prompt: string): void {
    this.cache.set(topic, { prompt, timestamp: Date.now() });
  }

  private updateRateLimit(): void {
    this.requestCount++;
    if (Date.now() >= this.requestReset) {
      this.requestCount = 1;
      this.requestReset = Date.now() + 60000; // Reset after 1 minute
    }
  }
}

export const openAIService = new OpenRouterService();