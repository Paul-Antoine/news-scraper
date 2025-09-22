# Configuration Base de Données - News Scraper

Ce document explique comment configurer la base de données MySQL pour le projet News Scraper.

## Prérequis

- MySQL Server installé et démarré sur localhost:3306
- Accès administrateur MySQL (utilisateur root)

## Configuration

### 1. Création de la base de données

```sql
-- Créer la base de données
CREATE DATABASE news_scraper
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Vérifier la création
SHOW DATABASES;
```

### 2. Création d'un utilisateur dédié

```sql
-- Créer un utilisateur pour l'application
CREATE USER 'news_scraper_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Accorder les privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON news_scraper.* TO 'news_scraper_user'@'localhost';

-- Appliquer les modifications
FLUSH PRIVILEGES;
```

### 3. Exécution du script de création des tables

Executer le script database/create_tables.sql

### 5. Vérification de l'installation

```sql
-- Vérifier que la table existe
USE news_scraper;
SHOW TABLES;

-- Vérifier la structure de la table
DESCRIBE articles;

-- Vérifier les index
SHOW INDEX FROM articles;
```

## Structure de la Table `articles`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id`    | INT  | AUTO_INCREMENT, PRIMARY KEY | Identifiant unique |
| `title` | VARCHAR(500) | NOT NULL | Titre de l'article |
| `url`   | VARCHAR(700) | NOT NULL, UNIQUE | URL de l'article |
| `publication_date` | DATETIME | NULL | Date de publication |
| `source` | VARCHAR(100) | NOT NULL | Site source (ex: "BBC News") |

## Index Créés

- **PRIMARY KEY** sur `id`
- **UNIQUE KEY** sur `url` (évite les doublons)
- **INDEX** sur `publication_date` (optimise les requêtes par date de publication)

## Variables d'Environnement

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_scraper
DB_USER=news_scraper_user
DB_PASSWORD=your_secure_password
```
