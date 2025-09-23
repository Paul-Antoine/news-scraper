# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS-based news scraper service designed to scrape articles from BBC News and store them in a MySQL database. The project follows standard NestJS architecture patterns and provides senior-level code quality with comprehensive unit testing.

## Core Commands

### Development
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debug mode and watch
- `npm run build` - Build the project for production
- `npm run start:prod` - Run production build

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests in debug mode

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: MySQL (localhost:3306) with Sequelize ORM
- **Architecture Pattern**: Standard NestJS (Controllers → Services → Models)
- **Scraping**: Advanced JSON extraction using `__NEXT_DATA__` from BBC News pages
- **Testing**: Jest unit tests with comprehensive coverage

### Project Structure
- Standard NestJS structure with modules, controllers, and services
- Source code in `src/` directory
- Unit tests co-located with source files (*.spec.ts)
- E2E tests in `test/` directory
- Global exception filters for centralized error handling

### Implemented Features
- `POST /scrape` - Scrapes BBC News articles using JSON data extraction
- `GET /articles` - Retrieves stored articles from last 7 days with pagination
- Real publication date extraction from article metadata
- Duplicate detection and handling
- TypeScript interfaces for type safety

### Data Model
MySQL table `articles` with optimized indexing:
- id (AUTO_INCREMENT, PRIMARY KEY)
- title (VARCHAR(500), NOT NULL)
- url (VARCHAR(700), NOT NULL, UNIQUE)
- publication_date (DATETIME, NULL)
- source (VARCHAR(100), NOT NULL)
- INDEX idx_articles_publication_date_desc (publication_date DESC)

## Development Guidelines

### Code Standards
- TypeScript with strict configuration (ES2023 target)
- ESLint with TypeScript and Prettier integration
- Decorator metadata and experimental decorators enabled
- Module resolution set to "nodenext"

### Testing Configuration
- Jest for unit tests (src directory)
- Separate E2E test configuration in test/jest-e2e.json
- Coverage reporting enabled

## Key Configuration Files
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint configuration with TypeScript support
- `package.json` - Dependencies and scripts