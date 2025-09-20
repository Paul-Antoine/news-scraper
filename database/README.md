# Configuration Base de Données - News Scraper

Ce document explique comment configurer la base de données MySQL pour le projet News Scraper.

## Prérequis

- MySQL Server installé et démarré sur localhost:3306
- Accès administrateur MySQL (utilisateur root)

## Configuration Étape par Étape

### 1. Connexion à MySQL

```bash
# Connexion en tant qu'administrateur
mysql -u root -p
```

### 2. Création de la base de données

```sql
-- Créer la base de données
CREATE DATABASE news_scraper
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Vérifier la création
SHOW DATABASES;
```

### 3. Création d'un utilisateur dédié (Recommandé)

```sql
-- Créer un utilisateur pour l'application
CREATE USER 'news_scraper_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Accorder les privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON news_scraper.* TO 'news_scraper_user'@'localhost';

-- Appliquer les modifications
FLUSH PRIVILEGES;
```

### 4. Exécution du script de création des tables

```bash
# Option 1: Depuis la ligne de commande
mysql -u news_scraper_user -p news_scraper < database/create_tables.sql

# Option 2: Depuis MySQL CLI
mysql -u news_scraper_user -p
USE news_scraper;
SOURCE database/create_tables.sql;
```

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
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Identifiant unique |
| `title` | VARCHAR(500) | NOT NULL | Titre de l'article |
| `url` | VARCHAR(700) | NOT NULL, UNIQUE | URL de l'article |
| `publication_date` | DATETIME | NULL | Date de publication |
| `source` | VARCHAR(100) | NOT NULL | Site source (ex: "BBC News") |

## Index Créés

- **PRIMARY KEY** sur `id`
- **UNIQUE KEY** sur `url` (évite les doublons)
- **INDEX** sur `source` (optimise les requêtes par source)
- **INDEX** sur `publication_date` (optimise les requêtes temporelles)

## Variables d'Environnement

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_scraper
DB_USER=news_scraper_user
DB_PASSWORD=your_secure_password
```

## Test de Connexion

```sql
-- Test d'insertion
INSERT INTO articles (title, url, source)
VALUES ('Test Article', 'https://example.com/test', 'Test Source');

-- Vérification
SELECT * FROM articles;

-- Nettoyage du test
DELETE FROM articles WHERE title = 'Test Article';
```

## Dépannage

### Erreur de connexion
- Vérifiez que MySQL est démarré : `sudo service mysql status`
- Vérifiez le port : `netstat -tlnp | grep :3306`

### Erreur de privilèges
- Reconnectez-vous en tant que root
- Vérifiez les privilèges : `SHOW GRANTS FOR 'news_scraper_user'@'localhost';`

### Erreur d'encodage
- Vérifiez l'encodage : `SHOW VARIABLES LIKE 'character_set%';`

## Prochaine Étape

Une fois la base de données configurée, vous pouvez passer à l'**Étape 4** : Intégration Sequelize pour la persistance des données.