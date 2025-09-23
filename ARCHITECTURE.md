# News Scraper Project Architecture

## Overview

```
┌────────────────────────────────────────────────┐
│              APP MODULE                        │
│  ┌────────────────────────────────────────┐    │
│  │      GlobalExceptionFilter             │    │
│  │   (Centralized Error Handling)         │    │
│  └────────────────────────────────────────┘    │
└─────────────────────┬──────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
┌──────────┐  ┌──────────────┐  ┌─────────────┐
│ARTICLES  │  │   SCRAPING   │  │  DATABASE   │
│ MODULE   │  │   MODULE     │  │   MODULE    │
└──────────┘  └──────────────┘  └─────────────┘
```

## Detailed Module Structure

### 1. Articles Module
```
┌─────────────────────────────────────────────────────────────────┐
│                      ARTICLES MODULE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐      ┌─────────────────┐                │
│  │ ArticlesController │────▶│ ArticlesService │                │
│  │                    │      │                 │                │
│  │ GET /articles      │      │ - find()        │                │
│  └────────────────────┘      │ - create()      │                │
│           │                  └─────────────────┘                │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌───────────────────┐    ┌──────────────────┐                  │
│  │GetArticlesQueryDto│    │ Article Model    │                  │
│  │                   │    │                  │                  │
│  │ - page?: string   │    │ - id: number     │                  │
│  │ - limit?: string  │    │ - title: string  │                  │
│  └───────────────────┘    │ - url: string    │                  │
│                           │ - source: string │                  │
│                           │ - publicationDate│                  │
│                           └──────────────────┘                  │
│                                    │                            │
│                           ┌─────────────────┐                   │
│                           │GetArticlesResponseDto               │
│                           │                 │                   │
│                           │ - articles[]    │                   │
│                           │ - pagination    │                   │
│                           └─────────────────┘                   │
│                                                                 │
│  Features:                                                      │
│  • Filters articles from last 7 days automatically             │
│  • Orders by publication date (DESC) with database index       │
│  • Pagination with configurable page size (max 100)           │
│  • Unit tests with comprehensive coverage                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Scraping Module
```
┌────────────────────────────────────────────────────────────────┐
│                      SCRAPING MODULE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │ScrapingController│────▶│ ScrapingService  │                 │
│  │                  │     │                  │                 │
│  │ POST /scrape     │     │ - scrapeNews()   │                 │
│  └──────────────────┘     └──────────────────┘                 │
│           │                        │                           │
│           │                        ▼                           │
│           │               ┌──────────────────┐                 │
│           │               │ BbcScraperService│                 │
│           │               │                  │                 │
│           │               │ - scrapeArticles │                 │
│           │               │ - JSON extraction│                 │
│           │               │ - __NEXT_DATA__  │                 │
│           │               └──────────────────┘                 │
│           │                        │                           │
│           │                        │ uses                      │
│           │                        ▼                           │
│           │               ┌─────────────────┐                  │
│           │               │ ArticlesService │                  │
│           │               │                 │                  │
│           │               │ - create()      │                  │
│           │               └─────────────────┘                  │
│           │                                                    │
│           ▼                                                    │
│  ┌─────────────────┐                                           │
│  │ScrapeResponseDto│                                           │
│  │                 │                                           │
│  │ - articles[]    │                                           │
│  │ - count: number │                                           │
│  │ - saved: number │                                           │
│  │ - duplicates    │                                           │
│  │ - status        │                                           │
│  │ - message       │                                           │
│  └─────────────────┘                                           │
│                                                                │
│  Advanced Features:                                            │
│  • JSON data extraction from __NEXT_DATA__ instead of HTML    │
│  • Real publication dates from article metadata               │
│  • TypeScript interfaces for type safety                      │
│  • Duplicate detection via unique constraint handling         │
│  • Comprehensive error handling and logging                   │
│  • Unit tests with mocked dependencies                        │
└────────────────────────────────────────────────────────────────┘
```

### 3. Database Module
```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE MODULE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                                           │
│  │ Article Model    │                                           │
│  │                  │                                           │
│  │ @Table           │                                           │
│  │ @Column          │                                           │
│  │                  │                                           │
│  │ Properties:      │                                           │
│  │ - id             │                                           │
│  │ - title          │                                           │
│  │ - url (UNIQUE)   │                                           │
│  │ - source         │                                           │
│  │ - publicationDate│                                           │
│  └──────────────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │  MySQL Database  │                                           │
│  │                  │                                           │
│  │ Table: articles  │                                           │
│  │ • UNIQUE(url)    │                                           │
│  │ • INDEX(pub_date)│                                           │
│  └──────────────────┘                                           │
│                                                                 │
│  Optimizations:                                                 │
│  • Unique constraint on URL prevents duplicates                │
│  • Descending index on publication_date for fast queries       │
│  • Sequelize ORM with TypeScript support                       │
│  • Automatic timestamp handling                                │
└─────────────────────────────────────────────────────────────────┘
```

## Main Data Flow

### 1. Scraping Flow
```
Client ──POST /scrape──▶ ScrapingController
                              │
                              ▼
                         ScrapingService
                              │
                              ▼
                        BbcScraperService ──extract JSON──▶ BBC Website (__NEXT_DATA__)
                              │                                    │
                              │                                    ▼
                              │                           Extract real timestamps
                              ▼                                    │
                         ArticlesService ──save with metadata──▶ MySQL Database
                              │                                    │
                              ▼                                    ▼
                        ScrapeResponseDto ──response──▶ Client    Duplicate handling
```

### 2. Articles Retrieval Flow
```
Client ──GET /articles──▶ ArticlesController
                              │
                              ▼
                         ArticlesService ──optimized query──▶ MySQL Database
                              │                                       │
                              │                                       ▼
                              │                              • Filter last 7 days
                              │                              • Order by pub_date DESC
                              │                              • Use database index
                              ▼                                       │
                        GetArticlesResponseDto ──response──▶ Client  ◀─┘
```

## Error Handling

```
┌────────────────────────────────────────────────────────────────┐
│                 GlobalExceptionFilter                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Exception Types:                                              │
│                                                                │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  HttpException  │    │  Error Types    │                    │
│  │                 │    │                 │                    │
│  │ - Status code   │    │ - Sequelize     │                    │
│  │ - Message       │    │ - Scraping      │                    │
│  └─────────────────┘    │ - Validation    │                    │
│                         │ - General       │                    │
│                         └─────────────────┘                    │
│                                  │                             │
│                                  ▼                             │
│                         ┌─────────────────┐                    │
│                         │ Error Response  │                    │
│                         │                 │                    │
│                         │ - statusCode    │                    │
│                         │ - message       │                    │
│                         │ - timestamp     │                    │
│                         │ - path          │                    │
│                         └─────────────────┘                    │
│                                                                │
│  Special Handling:                                             │
│  • SequelizeUniqueConstraintError → Duplicate detection       │
│  • JSON parsing errors → Scraping failure response            │
│  • Validation errors → 400 Bad Request with details           │
│  • Database connection errors → 500 Internal Server Error     │
└────────────────────────────────────────────────────────────────┘
```

## Technologies Used

- **Framework**: NestJS + TypeScript
- **Database**: MySQL + Sequelize ORM
- **Validation**: class-validator + class-transformer
- **Web Scraping**: Axios + JSON extraction (no HTML parsing)
- **Testing**: Jest with comprehensive unit test coverage
- **Architecture**: Standard NestJS (Controllers → Services → Models)
