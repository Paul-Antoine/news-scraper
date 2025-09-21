import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsScraperPort } from '../ports/news-scraper.port';
import { Article } from '../interfaces/article.interface';

@Injectable()
export class BbcNewsScraperAdapter implements NewsScraperPort {
  private readonly logger = new Logger(BbcNewsScraperAdapter.name);
  private readonly BBC_NEWS_URL = 'https://www.bbc.com/news';

  async scrapeArticles(): Promise<Article[]> {
    try {
      this.logger.log('Starting to scrape BBC News articles');

      const response = await axios.get(this.BBC_NEWS_URL, { timeout: 10000 });

      const $ = cheerio.load(response.data as string);
      const articles: Article[] = [];

      $(
        'h2[data-testid="card-headline"] a, h3[data-testid="card-headline"] a',
      ).each((_, element) => {
        const $element = $(element);
        const title = $element.text().trim();
        const relativeUrl = $element.attr('href');

        if (title && relativeUrl) {
          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `https://www.bbc.com${relativeUrl}`;

          articles.push({
            title,
            url,
            source: 'BBC News',
            publicationDate: undefined,
          });
        }
      });

      $('a[data-testid="internal-link"]').each((_, element) => {
        const $element = $(element);
        const title = $element.find('h2, h3').text().trim();
        const relativeUrl = $element.attr('href');

        if (
          title &&
          relativeUrl &&
          !articles.some((article) => article.url.includes(relativeUrl))
        ) {
          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `https://www.bbc.com${relativeUrl}`;

          articles.push({
            title,
            url,
            source: 'BBC News',
            publicationDate: undefined,
          });
        }
      });

      const uniqueArticles = articles.filter(
        (article, index, self) =>
          index === self.findIndex((a) => a.url === article.url),
      );

      this.logger.log(
        `Successfully scraped ${uniqueArticles.length} articles from BBC News`,
      );

      return uniqueArticles;
    } catch (error) {
      this.logger.error('Error scraping BBC News articles', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to scrape BBC News: ${errorMessage}`);
    }
  }
}
