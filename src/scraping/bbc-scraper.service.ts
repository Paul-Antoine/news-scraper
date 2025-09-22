import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  publicationDate?: Date;
}

@Injectable()
export class BbcScraperService {
  private readonly logger = new Logger(BbcScraperService.name);
  private readonly BBC_NEWS_URL = 'https://www.bbc.com/news';

  private generateRandomDate(): Date {
    const now = new Date();
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    const randomTime = fiveHoursAgo.getTime() +
      Math.random() * (now.getTime() - fiveHoursAgo.getTime());

    return new Date(randomTime);
  }

  async scrapeArticles(): Promise<ScrapedArticle[]> {
    try {
      this.logger.log('Starting to scrape BBC News articles');

      const response = await axios.get(this.BBC_NEWS_URL, { timeout: 10000 });
      const $ = cheerio.load(response.data as string);
      const articles: ScrapedArticle[] = [];

      // Select link with title
      // todo : need to improve this code using "__NEXT_DATA__" json at the end of the BBC News page, contains also publication date
      // todo : use a dummy date for now to check the sql request for articles of last 7 days sorted by publications date and using index
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
            publicationDate: this.generateRandomDate(), // tmp dummy date
          });
        }
      });

      // Remove duplicates
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
      throw new Error(`Failed to scrape BBC News: ${error?.message}`);
    }
  }
}
