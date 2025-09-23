import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ArticlesService } from './articles.service';
import { Article } from '../database/models/article.model';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let mockArticleModel: any;

  const mockArticles = [
    {
      id: 1,
      title: 'Test Article 1',
      url: 'https://example.com/article1',
      source: 'Test Source',
      publicationDate: new Date('2024-01-01'),
      toJSON: () => ({
        id: 1,
        title: 'Test Article 1',
        url: 'https://example.com/article1',
        source: 'Test Source',
        publicationDate: new Date('2024-01-01'),
      }),
    },
    {
      id: 2,
      title: 'Test Article 2',
      url: 'https://example.com/article2',
      source: 'Test Source',
      publicationDate: new Date('2024-01-02'),
      toJSON: () => ({
        id: 2,
        title: 'Test Article 2',
        url: 'https://example.com/article2',
        source: 'Test Source',
        publicationDate: new Date('2024-01-02'),
      }),
    },
  ];

  beforeEach(async () => {
    mockArticleModel = {
      findAndCountAll: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article),
          useValue: mockArticleModel,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should return paginated articles from the last 7 days', async () => {
      const mockResult = {
        rows: mockArticles,
        count: 2,
      };

      mockArticleModel.findAndCountAll.mockResolvedValue(mockResult);

      const options = { page: 1, limit: 10 };
      const result = await service.find(options);

      expect(result).toEqual({
        articles: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });

      expect(mockArticleModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          publicationDate: {
            [Op.gte]: expect.any(Date),
            [Op.not]: null,
          },
        },
        limit: 10,
        offset: 0,
        order: [['publicationDate', 'DESC']],
      });
    });

    it('should calculate correct offset for pagination', async () => {
      const mockResult = {
        rows: mockArticles,
        count: 2,
      };

      mockArticleModel.findAndCountAll.mockResolvedValue(mockResult);

      const options = { page: 3, limit: 5 };
      await service.find(options);

      expect(mockArticleModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 10, // (3-1) * 5 = 10
        }),
      );
    });

    it('should calculate correct number of pages', async () => {
      const mockResult = {
        rows: mockArticles,
        count: 25,
      };

      mockArticleModel.findAndCountAll.mockResolvedValue(mockResult);

      const options = { page: 1, limit: 10 };
      const result = await service.find(options);

      expect(result.pagination.pages).toBe(3); // Math.ceil(25/10) = 3
    });

    it('should filter articles from the last 7 days', async () => {
      mockArticleModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const options = { page: 1, limit: 10 };
      await service.find(options);

      const callArgs = mockArticleModel.findAndCountAll.mock.calls[0][0];
      const sevenDaysAgo = callArgs.where.publicationDate[Op.gte];
      const now = new Date();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);

      // Check that the date is approximately 7 days ago (within 1 minute tolerance)
      expect(Math.abs(sevenDaysAgo.getTime() - expectedDate.getTime())).toBeLessThan(60000);
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const articleData = {
        title: 'New Article',
        url: 'https://example.com/new-article',
        source: 'Test Source',
        publicationDate: new Date('2024-01-01'),
      };

      const mockCreatedArticle = {
        id: 3,
        ...articleData,
        toJSON: () => ({ id: 3, ...articleData }),
      };

      mockArticleModel.create.mockResolvedValue(mockCreatedArticle);

      const result = await service.create(articleData);

      expect(result).toEqual({ id: 3, ...articleData });
      expect(mockArticleModel.create).toHaveBeenCalledWith(articleData);
    });

    it('should create article without publication date', async () => {
      const articleData = {
        title: 'New Article',
        url: 'https://example.com/new-article',
        source: 'Test Source',
      };

      const mockCreatedArticle = {
        id: 3,
        ...articleData,
        publicationDate: null,
        toJSON: () => ({ id: 3, ...articleData, publicationDate: null }),
      };

      mockArticleModel.create.mockResolvedValue(mockCreatedArticle);

      const result = await service.create(articleData);

      expect(result).toEqual({ id: 3, ...articleData, publicationDate: null });
      expect(mockArticleModel.create).toHaveBeenCalledWith(articleData);
    });
  });
});