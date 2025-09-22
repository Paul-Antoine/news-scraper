# Architecture du Projet News Scraper

## Vue d'ensemble

```
┌────────────────────────────────────────────────┐
│              APP MODULE                        │
│  ┌────────────────────────────────────────┐    │
│  │      GlobalExceptionFilter             │    │
│  │   (Gestion centralisée des erreurs)    │    │
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

## Structure détaillée des modules

### 1. Articles Module
```
┌─────────────────────────────────────────────────────────────────┐
│                      ARTICLES MODULE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐      ┌─────────────────┐                │
│  │ ArticlesController │────▶│ ArticlesService │                │
│  │                    │      │                 │                │
│  │ GET /articles      │      │ - findAll()     │                │
│  └────────────────────┘      │ - create()      │                │
│           │                  └─────────────────┘                │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌───────────────────┐    ┌──────────────────┐                  │
│  │GetArticlesQueryDto│    │ Article Model    │                  │
│  │                   │    │                  │                  │
│  │ - page?: string   │    │ - id: number     │                  │
│  │ - limit?: string  │    │ - title: string  │                  │
│  │ - source?: string │    │ - url: string    │                  │
│  └───────────────────┘    │ - source: string │                  │
│                           │ - publicationDate│                  │
│                           └──────────────────┘                  │
│                                    │                            │
│                           ┌─────────────────┐                   │
│                           │GetArticlesResponseDto               │
│                           │                 │                   │
│                           │ - articles[]    │                   │
│                           │ - pagination    │                   │
│                           └─────────────────┘                   │
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
│  │ - url            │                                           │
│  │ - source         │                                           │
│  │ - publicationDate│                                           │
│  └──────────────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │  MySQL Database  │                                           │
│  │                  │                                           │
│  │ Table: articles  │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de données principal

### 1. Scraping Flow
```
Client ──POST /scrape──▶ ScrapingController
                              │
                              ▼
                         ScrapingService
                              │
                              ▼
                        BbcScraperService ──scrape──▶ BBC Website
                              │
                              ▼
                         ArticlesService ──save──▶ MySQL Database
                              │
                              ▼
                        ScrapeResponseDto ──response──▶ Client
```

### 2. Articles Retrieval Flow
```
Client ──GET /articles──▶ ArticlesController
                              │
                              ▼
                         ArticlesService ──query──▶ MySQL Database
                              │
                              ▼
                        GetArticlesResponseDto ──response──▶ Client
```

## Gestion des erreurs

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
│  └─────────────────┘    │ - General       │                    │
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
└────────────────────────────────────────────────────────────────┘
```

## Technologies utilisées

- **Framework**: NestJS + TypeScript
- **Base de données**: MySQL + Sequelize ORM
- **Validation**: class-validator
- **Web Scraping**: Axios + Cheerio
- **Architecture**: Standard NestJS (Controllers → Services → Models)
