import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  publicationDate?: Date;
}

interface BBCNewsItem {
  title: string;
  href: string;
  metadata: {
    firstUpdated?: number;
    lastUpdated?: number;
  };
}

interface BBCNewsSection {
  content: BBCNewsItem[];
}

@Injectable()
export class BbcScraperService {
  private readonly logger = new Logger(BbcScraperService.name);
  private readonly BBC_NEWS_URL = 'https://www.bbc.com/news';

  async scrapeArticles(): Promise<ScrapedArticle[]> {
    try {
      this.logger.log('Starting to scrape BBC News articles');

      const response = await axios.get(this.BBC_NEWS_URL, { timeout: 10000 });
      const html = response.data as string;

      // Extract __NEXT_DATA__ JSON
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
      if (!nextDataMatch) {
        throw new Error('__NEXT_DATA__ not found in BBC News page');
      }

      const jsonData = JSON.parse(nextDataMatch[1]);
      const articles: ScrapedArticle[] = [];

      // Navigate through the JSON structure to extract articles
      const pageData = jsonData?.props?.pageProps?.page;
      const newsData = pageData?.['@"news",'] || pageData?.['@"news"'] || pageData?.news;
      const sections = newsData?.sections || [];

      for (const section of sections as BBCNewsSection[]) {
        if (section.content && Array.isArray(section.content)) {
          for (const item of section.content) {
            if (item.title && item.href && item.metadata) {
              const url = item.href.startsWith('http')
                ? item.href
                : `https://www.bbc.com${item.href}`;

              // Convert timestamp to Date if available
              let publicationDate: Date | undefined;
              const timestamp = item.metadata.firstUpdated || item.metadata.lastUpdated;
              if (timestamp) {
                publicationDate = new Date(timestamp);
              }

              // Skip if already exists
              if (!articles.some(article => article.url === url)) {
                articles.push({
                  title: item.title,
                  url,
                  source: 'BBC News',
                  publicationDate,
                });
              }
            }
          }
        }
      }

      this.logger.log(`Successfully scraped ${articles.length} articles from BBC News`);
      return articles;
    } catch (error) {
      this.logger.error('Error scraping BBC News articles', error);
      throw new Error(`Failed to scrape BBC News: ${error?.message}`);
    }
  }

}
