import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface ImageResult {
  title: string;
  imageUrl: string;
  link: string;
}

export interface SearchResponse {
  searchResults: SearchResult[];
  images: ImageResult[];
  knowledgeGraph?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
}

const SEARCH_CACHE_TTL_MS = 60 * 60 * 1000   // 1h
const IMAGES_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h (les images changent rarement)

@Injectable()
export class SerperService {
  private readonly logger = new Logger(SerperService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://google.serper.dev';

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    this.apiKey = this.configService.get<string>('SERPER_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('SERPER_API_KEY not configured - web search will be disabled');
    }
  }

  async search(query: string, num: number = 5): Promise<SearchResponse> {
    if (!this.apiKey) {
      return { searchResults: [], images: [] };
    }

    const hash = createHash('md5').update(`${query}:${num}`).digest('hex').slice(0, 12);
    const key = `search:serper:${hash}`;

    const cached = await this.cache.get<SearchResponse>(key);
    if (cached) {
      this.logger.debug(`Serper cache hit: "${query}"`);
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: 'fr',
          hl: 'fr',
          num,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Serper API error: ${response.status}`);
        return { searchResults: [], images: [] };
      }

      const data = await response.json();

      const searchResults: SearchResult[] = (data.organic || []).map(
        (item: any, index: number) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet || '',
          position: index + 1,
        }),
      );

      const images: ImageResult[] = (data.images || []).slice(0, 3).map(
        (item: any) => ({
          title: item.title || '',
          imageUrl: item.imageUrl,
          link: item.link || '',
        }),
      );

      const result: SearchResponse = {
        searchResults,
        images,
        knowledgeGraph: data.knowledgeGraph
          ? {
              title: data.knowledgeGraph.title,
              description: data.knowledgeGraph.description || '',
              imageUrl: data.knowledgeGraph.imageUrl,
            }
          : undefined,
      };

      await this.cache.set(key, result, SEARCH_CACHE_TTL_MS);
      return result;
    } catch (error) {
      this.logger.error('Serper search error:', error);
      return { searchResults: [], images: [] };
    }
  }

  async searchImages(query: string, num: number = 5): Promise<ImageResult[]> {
    if (!this.apiKey) {
      return [];
    }

    const hash = createHash('md5').update(`img:${query}:${num}`).digest('hex').slice(0, 12);
    const key = `search:serper:images:${hash}`;

    const cached = await this.cache.get<ImageResult[]>(key);
    if (cached) {
      this.logger.debug(`Serper images cache hit: "${query}"`);
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/images`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: 'fr',
          hl: 'fr',
          num,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Serper Images API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const results = (data.images || []).map((item: any) => ({
        title: item.title || '',
        imageUrl: item.imageUrl,
        link: item.link || '',
      }));

      await this.cache.set(key, results, IMAGES_CACHE_TTL_MS);
      return results;
    } catch (error) {
      this.logger.error('Serper images error:', error);
      return [];
    }
  }

  formatResultsAsContext(results: SearchResponse, maxSources: number = 3): string {
    if (results.searchResults.length === 0) {
      return '';
    }

    let context = '\n\n---\n**Sources:**\n';
    results.searchResults.slice(0, maxSources).forEach((result, index) => {
      context += `${index + 1}. [${result.title}](${result.link})\n`;
    });

    return context;
  }
}
