# News Scraper

A NestJS backend service to scrape BBC News articles and store them in a MySQL database.

## 🚀 Features

- **BBC News Scraping**: Article extraction from BBC News
- **MySQL Storage**: Article persistence with duplicate detection
- **REST API**: Endpoints to trigger scraping and retrieve articles with pagination
- **Data Validation**: DTOs with validation
- **Global Error Handling**: Centralized exception filters for consistent error management

## 📋 Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)
- npm

## 🛠️ Installation

1. **Clone the project**
```bash
git clone https://github.com/Paul-Antoine/news-scraper.git
cd news-scraper
```

2. **Install dependencies**
```bash
npm install
```

3. **Database configuration**
   - Create a MySQL database named `news_scraper`
   - Configure environment variables (optional):
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=news_scraper_user
   DB_PASSWORD=your_password
   DB_NAME=news_scraper
   ```

   For detailed database setup instructions, see [database/README.md](database/README.md).


## 🎯 Usage

### Starting the server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server starts on `http://localhost:3000`

### API Endpoints

#### 1. Scrape articles
```bash
POST /scrape
```

**Response:**
```json
{
  "articles": [...],
  "count": 15,
  "saved": 12,
  "duplicates": 3,
  "status": "success",
  "message": "Successfully scraped 15 articles. Saved: 12, Duplicates: 3"
}
```

#### 2. Get articles (last 7 days only)
```bash
GET /articles?page=1&limit=10
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Articles per page (default: 10, max: 100)

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "url": "https://www.bbc.com/news/...",
      "source": "BBC News",
      "publicationDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**Note:** The articles endpoint automatically filters articles from the last 7 days only, ordered by publication date (newest first).

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test debugging
npm run test:debug
```

## 🔧 Available Scripts

```bash
npm run start:dev     # Start in development mode with watch
npm run start:debug   # Start in debug mode with watch
npm run build         # Build for production
npm run start:prod    # Start production build
npm run lint          # Code linting with ESLint
npm run format        # Code formatting with Prettier
```

## 📁 Project Structure

```
src/
├── articles/                    # Articles module
│   ├── dto/                     # Data Transfer Objects
│   │   ├── article-response.dto.ts
│   │   └── get-articles-query.dto.ts
│   ├── articles.controller.ts   # REST endpoints for articles
│   ├── articles.service.ts      # Business logic for articles
│   ├── articles.service.spec.ts # Unit tests
│   └── articles.module.ts       # Module configuration
├── scraping/                    # Scraping module
│   ├── dto/
│   │   └── scrape-response.dto.ts
│   ├── bbc-scraper.service.ts   # BBC News scraper with JSON extraction
│   ├── scraping.controller.ts   # REST endpoints for scraping
│   ├── scraping.service.ts      # Orchestrates scraping and saving
│   ├── scraping.service.spec.ts # Unit tests
│   └── scraping.module.ts       # Module configuration
├── database/                    # Database configuration
│   └── models/
│       └── article.model.ts     # Sequelize model for articles
├── common/                      # Shared utilities
│   ├── filters/                 # Global exception filters
│   │   └── global-exception.filter.ts
│   └── interfaces/              # Common interfaces
│       └── article.interface.ts
└── app.module.ts                # Main application module
```

## 🛡️ Error Handling

The project includes a centralized error handling system that:

- Maps Sequelize errors to appropriate HTTP status codes
- Handles scraping errors with user-friendly messages
- Logs all errors for debugging purposes
- Returns standardized JSON error responses
- Manages duplicate article detection via unique constraint errors

## 🔄 Architecture

**Standard NestJS Architecture** featuring:

- **Controllers**: HTTP route handling and request/response management
- **Services**: Business logic and data processing
- **DTOs**: Data validation and transformation with class-validator
- **Models**: Sequelize ORM models for database operations
- **Filters**: Centralized exception handling
- **Interfaces**: TypeScript type definitions for better code safety

For detailed architecture diagrams and module interactions, see [ARCHITECTURE.md](ARCHITECTURE.md).
