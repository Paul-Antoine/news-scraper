# News Scraper Architecture

This document provides a visual representation of the news scraper application architecture.

## System Overview

```mermaid
graph TB
    User[User/Client] --> API[NestJS API Gateway]
    API --> Controller[Controllers Layer]
    Controller --> Service[Services Layer]
    Service --> DB[(MySQL Database)]
    Service --> BBC[BBC News Website]

    subgraph "NestJS Application"
        API
        Controller
        Service
        Filter[Global Exception Filter]
    end

    API --> Filter
    Filter --> API
```

## Detailed Application Architecture

```mermaid
graph TB
    subgraph "NestJS Application"
        subgraph "Controllers"
            AppController[App Controller<br/>GET /]
            ScrapingController[Scraping Controller<br/>POST /scrape]
            ArticlesController[Articles Controller<br/>GET /articles]
        end

        subgraph "Services"
            AppService[App Service]
            ScrapingService[Scraping Service]
            BBCScraperService[BBC Scraper Service]
            ArticlesService[Articles Service]
        end

        subgraph "Data Layer"
            ArticleModel[Article Model<br/>Sequelize ORM]
        end

        subgraph "Common"
            GlobalFilter[Global Exception Filter]
            ArticleInterface[Article Interface]
        end

        subgraph "DTOs"
            ScrapeResponseDto[Scrape Response DTO]
            ArticleResponseDto[Article Response DTO]
            GetArticlesQueryDto[Get Articles Query DTO]
        end
    end

    subgraph "External Systems"
        BBC[BBC News Website<br/>JSON Data Extraction]
        MySQL[(MySQL Database<br/>news_scraper)]
    end

    AppController --> AppService
    ScrapingController --> ScrapingService
    ArticlesController --> ArticlesService

    ScrapingService --> BBCScraperService
    ScrapingService --> ArticlesService
    ArticlesService --> ArticleModel

    BBCScraperService --> BBC
    ArticleModel --> MySQL

    GlobalFilter -.-> AppController
    GlobalFilter -.-> ScrapingController
    GlobalFilter -.-> ArticlesController
```

## Module Dependencies

```mermaid
graph TB
    AppModule[App Module] --> ConfigModule[Config Module]
    AppModule --> SequelizeModule[Sequelize Module]
    AppModule --> DatabaseModule[Database Module]
    AppModule --> ScrapingModule[Scraping Module]
    AppModule --> ArticlesModule[Articles Module]

    ScrapingModule --> ScrapingController
    ScrapingModule --> ScrapingService
    ScrapingModule --> BBCScraperService
    ScrapingModule --> ArticlesModule

    ArticlesModule --> ArticlesController
    ArticlesModule --> ArticlesService
    ArticlesModule --> DatabaseModule

    DatabaseModule --> ArticleModel

    style AppModule fill:#e1f5fe
    style ScrapingModule fill:#f3e5f5
    style ArticlesModule fill:#e8f5e8
    style DatabaseModule fill:#fff3e0
```

## Data Flow - Scraping Process

```mermaid
sequenceDiagram
    participant Client
    participant ScrapingController
    participant ScrapingService
    participant BBCScraperService
    participant ArticlesService
    participant MySQL
    participant BBC

    Client->>ScrapingController: POST /scrape
    ScrapingController->>ScrapingService: scrapeNews()
    ScrapingService->>BBCScraperService: scrapeArticles()
    BBCScraperService->>BBC: Fetch homepage
    BBC-->>BBCScraperService: HTML with __NEXT_DATA__
    BBCScraperService->>BBCScraperService: Extract JSON data
    BBCScraperService->>BBCScraperService: Parse articles
    BBCScraperService-->>ScrapingService: Article[]

    loop For each article
        ScrapingService->>ArticlesService: saveArticle()
        ArticlesService->>MySQL: INSERT/UPDATE article
        MySQL-->>ArticlesService: Result
        ArticlesService-->>ScrapingService: Saved article
    end

    ScrapingService-->>ScrapingController: ScrapeResponseDto
    ScrapingController-->>Client: Response with stats
```

## Data Flow - Articles Retrieval

```mermaid
sequenceDiagram
    participant Client
    participant ArticlesController
    participant ArticlesService
    participant MySQL

    Client->>ArticlesController: GET /articles?page=1&limit=10
    ArticlesController->>ArticlesController: Validate query params
    ArticlesController->>ArticlesService: find({page, limit})
    ArticlesService->>MySQL: SELECT with pagination
    MySQL-->>ArticlesService: Article records
    ArticlesService->>ArticlesService: Format response
    ArticlesService-->>ArticlesController: GetArticlesResponseDto
    ArticlesController-->>Client: Paginated articles
```

## Database Schema

```mermaid
erDiagram
    ARTICLES {
        int id PK "AUTO_INCREMENT"
        varchar title "VARCHAR(500) NOT NULL"
        varchar url "VARCHAR(700) NOT NULL UNIQUE"
        datetime publication_date "DATETIME NULL"
        varchar source "VARCHAR(100) NOT NULL"
    }

    ARTICLES ||--o{ INDEX_publication_date : "idx_articles_publication_date_desc"
```

## Technology Stack

```mermaid
graph TB
    subgraph "Backend Framework"
        NestJS[NestJS<br/>TypeScript Framework]
    end

    subgraph "Database"
        MySQL[(MySQL<br/>Relational Database)]
        Sequelize[Sequelize<br/>ORM]
    end

    subgraph "Development Tools"
        Jest[Jest<br/>Testing Framework]
        ESLint[ESLint<br/>Linting]
        Prettier[Prettier<br/>Code Formatting]
    end

    subgraph "External APIs"
        BBCAPI[BBC News<br/>JSON Data Extraction]
    end

    NestJS --> Sequelize
    Sequelize --> MySQL
    NestJS --> BBCAPI
    NestJS -.-> Jest
    NestJS -.-> ESLint
    NestJS -.-> Prettier
```

## API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | Health check | App status |
| POST | `/scrape` | Trigger news scraping | Scraping results |
| GET | `/articles` | Retrieve articles | Paginated articles list |

## Key Features

- **Advanced Scraping**: Extracts data from `__NEXT_DATA__` JSON embedded in BBC News pages
- **Duplicate Prevention**: URL-based uniqueness constraint prevents duplicate articles
- **Real Publication Dates**: Extracts actual publication timestamps from article metadata
- **Pagination Support**: Efficient pagination with configurable page size limits
- **Type Safety**: Comprehensive TypeScript interfaces and DTOs
- **Error Handling**: Global exception filter for centralized error management
- **Testing**: Unit tests with Jest for all major components