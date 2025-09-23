# Database Configuration - News Scraper

This document explains how to configure the MySQL database for the News Scraper project.

## Prerequisites

- MySQL Server installed and running on localhost:3306
- MySQL administrator access (root user)

## Configuration

### 1. Database Creation

```sql
-- Create the database
CREATE DATABASE news_scraper
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Verify creation
SHOW DATABASES;
```

### 2. Dedicated User Creation

```sql
-- Create a user for the application
CREATE USER 'news_scraper_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON news_scraper.* TO 'news_scraper_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

### 3. Table Creation Script

Execute the SQL script provided in [create_tables.sql](create_tables.sql) to create the articles table with proper indexing.

### 4. Installation Verification

```sql
-- Verify table exists
USE news_scraper;
SHOW TABLES;

-- Verify table structure
DESCRIBE articles;

-- Verify indexes
SHOW INDEX FROM articles;
```

## Table Structure: `articles`

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id`    | INT  | AUTO_INCREMENT, PRIMARY KEY | Unique identifier |
| `title` | VARCHAR(500) | NOT NULL | Article title |
| `url`   | VARCHAR(700) | NOT NULL, UNIQUE | Article URL |
| `publication_date` | DATETIME | NULL | publication date from BBC metadata |
| `source` | VARCHAR(100) | NOT NULL | Source website (e.g., "BBC News") |

## Indexes Created

- **PRIMARY KEY** on `id` 
- **UNIQUE KEY** on `url` (prevents duplicate articles)
- **INDEX** `idx_articles_publication_date_desc` on `publication_date DESC` (optimizes date-based queries)

## Performance Optimizations

The database schema is optimized for the application's main queries:

1. **7-day article filtering with `idx_articles_publication_date_desc`**:
   - **Why**: The application query articles from the last 7 days, ordered by publication date (newest first)
   - **How**: The descending index on `publication_date` allows MySQL to:
     - Quickly locate articles within the date range using the index B-tree structure
     - Skip full table scans by using the index for `WHERE publication_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
     - Avoid sorting overhead since data is already ordered in descending order in the index
     - Return results in the correct order (`ORDER BY publication_date DESC`) without additional sorting
   - **Performance gain**: Query execution time reduces from O(n) to O(log n) for filtering, and eliminates sorting costs

2. **Duplicate prevention**: UNIQUE constraint on `url` prevents duplicate articles at the database level

3. **UTF8MB4 charset**: Full Unicode support including emojis in article titles

### Get recent articles (optimized with index)
```sql
SELECT * FROM articles
WHERE publication_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
AND publication_date IS NOT NULL
ORDER BY publication_date DESC;
```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_scraper
DB_USER=news_scraper_user
DB_PASSWORD=your_secure_password
```
