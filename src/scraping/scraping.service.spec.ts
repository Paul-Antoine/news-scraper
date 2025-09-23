import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingService } from './scraping.service';
import { BbcScraperService } from './bbc-scraper.service';
import { ArticlesService } from '../articles/articles.service';
import { ScrapedArticle } from './bbc-scraper.service';

describe('ScrapingService', () => {
  let service: ScrapingService;
  let mockBbcScraperService: jest.Mocked<BbcScraperService>;
  let mockArticlesService: jest.Mocked<ArticlesService>;

  const mockScrapedArticles: ScrapedArticle[] = [
    {
      title: 'Test Article 1',
      url: 'https://bbc.com/news/test1',
      source: 'BBC News',
      publicationDate: new Date('2024-01-01'),
    },
    {
      title: 'Test Article 2',
      url: 'https://bbc.com/news/test2',
      source: 'BBC News',
      publicationDate: new Date('2024-01-02'),
    },
  ];

  const mockSavedArticle = {
    id: 1,
    title: 'Test Article 1',
    url: 'https://bbc.com/news/test1',
    source: 'BBC News',
    publicationDate: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockBbcScraperService = {
      scrapeArticles: jest.fn(),
    } as any;

    mockArticlesService = {
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingService,
        {
          provide: BbcScraperService,
          useValue: mockBbcScraperService,
        },
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeNews', () => {
    it('should successfully scrape and save articles', async () => {
      mockBbcScraperService.scrapeArticles.mockResolvedValue(mockScrapedArticles);
      mockArticlesService.create.mockResolvedValue(mockSavedArticle);

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [mockSavedArticle, mockSavedArticle],
        count: 2,
        saved: 2,
        duplicates: 0,
        status: 'success',
        message: 'Successfully scraped 2 articles. Saved: 2, Duplicates: 0',
      });

      expect(mockBbcScraperService.scrapeArticles).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.create).toHaveBeenCalledTimes(2);
    });

    it('should return success message when no articles found', async () => {
      mockBbcScraperService.scrapeArticles.mockResolvedValue([]);

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [],
        count: 0,
        saved: 0,
        duplicates: 0,
        status: 'success',
        message: 'No new articles found',
      });

      expect(mockBbcScraperService.scrapeArticles).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.create).not.toHaveBeenCalled();
    });

    it('should handle duplicate articles (unique constraint errors)', async () => {
      const uniqueConstraintError = new Error('Duplicate entry');
      (uniqueConstraintError as any).name = 'SequelizeUniqueConstraintError';

      mockBbcScraperService.scrapeArticles.mockResolvedValue(mockScrapedArticles);
      mockArticlesService.create
        .mockResolvedValueOnce(mockSavedArticle)
        .mockRejectedValueOnce(uniqueConstraintError);

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [mockSavedArticle],
        count: 2,
        saved: 1,
        duplicates: 1,
        status: 'success',
        message: 'Successfully scraped 2 articles. Saved: 1, Duplicates: 1',
      });

      expect(mockArticlesService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle articles without publication date', async () => {
      const articleWithoutDate: ScrapedArticle = {
        title: 'Test Article',
        url: 'https://bbc.com/news/test',
        source: 'BBC News',
      };

      mockBbcScraperService.scrapeArticles.mockResolvedValue([articleWithoutDate]);
      mockArticlesService.create.mockResolvedValue(mockSavedArticle);

      await service.scrapeNews();

      expect(mockArticlesService.create).toHaveBeenCalledWith({
        title: 'Test Article',
        url: 'https://bbc.com/news/test',
        source: 'BBC News',
        publicationDate: null,
      });
    });

    it('should handle scraping errors', async () => {
      const scrapingError = new Error('Failed to scrape BBC News');
      mockBbcScraperService.scrapeArticles.mockRejectedValue(scrapingError);

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [],
        count: 0,
        saved: 0,
        duplicates: 0,
        status: 'error',
        message: 'Scraping failed: Failed to scrape BBC News',
      });

      expect(mockArticlesService.create).not.toHaveBeenCalled();
    });

    it('should handle database save errors (non-duplicate)', async () => {
      const databaseError = new Error('Database connection failed');
      mockBbcScraperService.scrapeArticles.mockResolvedValue([mockScrapedArticles[0]]);
      mockArticlesService.create.mockRejectedValue(databaseError);

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [],
        count: 0,
        saved: 0,
        duplicates: 0,
        status: 'error',
        message: 'Scraping failed: Database connection failed',
      });
    });

    it('should handle unknown errors', async () => {
      mockBbcScraperService.scrapeArticles.mockRejectedValue('String error');

      const result = await service.scrapeNews();

      expect(result).toEqual({
        articles: [],
        count: 0,
        saved: 0,
        duplicates: 0,
        status: 'error',
        message: 'Scraping failed: Unknown error',
      });
    });

    it('should call services with correct parameters', async () => {
      mockBbcScraperService.scrapeArticles.mockResolvedValue([mockScrapedArticles[0]]);
      mockArticlesService.create.mockResolvedValue(mockSavedArticle);

      await service.scrapeNews();

      expect(mockArticlesService.create).toHaveBeenCalledWith({
        title: 'Test Article 1',
        url: 'https://bbc.com/news/test1',
        source: 'BBC News',
        publicationDate: new Date('2024-01-01'),
      });
    });
  });
});