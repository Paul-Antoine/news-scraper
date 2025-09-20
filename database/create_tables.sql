-- ===================================================================
-- Script de création de la table articles pour News Scraper
-- Base de données: news_scraper
-- Version: 1.0
-- ===================================================================

-- Utiliser la base de données news_scraper
USE news_scraper;

-- Créer la table articles selon les spécifications du PRD
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(700) NOT NULL UNIQUE,
    publication_date DATETIME NULL,
    source VARCHAR(100) NOT NULL
) DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Table des articles scrapés depuis les sites de news';

-- Créer un index sur la source pour optimiser les requêtes
CREATE INDEX idx_articles_source ON articles(source);

-- Créer un index sur la date de publication pour les requêtes temporelles
CREATE INDEX idx_articles_publication_date ON articles(publication_date);


-- Afficher la structure de la table créée
DESCRIBE articles;