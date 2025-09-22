# News Scraper

Un service backend NestJS pour scraper les articles de BBC News et les stocker dans une base de données MySQL.

## 🚀 Fonctionnalités

- **Scraping BBC News** : Extraction automatique des articles depuis BBC News
- **Stockage MySQL** : Sauvegarde des articles avec gestion des doublons
- **API REST** : Endpoints pour déclencher le scraping et récupérer les articles
- **Validation** : DTOs avec validation automatique des données
- **Gestion d'erreurs** : Exception filters globaux pour une gestion centralisée
- **Pagination** : Support de la pagination pour la récupération des articles

## 📋 Prérequis

- Node.js (v18+)
- MySQL (v8.0+)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd news-scraper
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
   - Créer une base de données MySQL nommée `news_scraper`
   - Configurer les variables d'environnement (optionnel) :
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=news_scraper_user
   DB_PASSWORD=your_password
   DB_NAME=news_scraper
   ```

4. **Créer la table articles**
```sql
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(700) NOT NULL UNIQUE,
  publication_date DATETIME NULL,
  source VARCHAR(100) NOT NULL
);
```

## 🎯 Utilisation

### Démarrage du serveur

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le serveur démarre sur `http://localhost:3000`

### API Endpoints

#### 1. Scraper les articles
```bash
POST /scrape
```

**Réponse :**
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

#### 2. Récupérer les articles
```bash
GET /articles?page=1&limit=10&source=BBC
```

**Paramètres :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'articles par page (défaut: 10, max: 100)
- `source` (optionnel) : Filtrer par source

**Réponse :**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "url": "https://...",
      "source": "BBC",
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

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🔧 Scripts disponibles

```bash
npm run start:dev     # Démarrage en mode développement
npm run start:debug   # Démarrage en mode debug
npm run build         # Build pour production
npm run lint          # Vérification du code avec ESLint
npm run format        # Formatage avec Prettier
```

## 📁 Structure du projet

```
src/
├── articles/           # Module articles
│   ├── dto/           # DTOs de validation
│   ├── articles.controller.ts
│   ├── articles.service.ts
│   └── articles.module.ts
├── scraping/          # Module scraping
│   ├── dto/
│   ├── bbc-scraper.service.ts
│   ├── scraping.controller.ts
│   ├── scraping.service.ts
│   └── scraping.module.ts
├── database/          # Configuration et modèles
│   └── models/
│       └── article.model.ts
├── common/            # Utilitaires partagés
│   ├── filters/       # Exception filters
│   └── interfaces/    # Interfaces communes
└── app.module.ts      # Module principal
```

## 🛡️ Gestion d'erreurs

Le projet inclut un système de gestion d'erreurs centralisé qui :

- Mappe les erreurs Sequelize vers des codes HTTP appropriés
- Gère les erreurs de scraping avec des messages utilisateur-friendly
- Log toutes les erreurs pour le débogage
- Retourne des réponses JSON standardisées

## 🔄 Architecture

**Architecture NestJS standard** avec :

- **Controllers** : Gestion des routes HTTP
- **Services** : Logique métier
- **DTOs** : Validation et transformation des données
- **Models** : Modèles Sequelize pour la base de données
- **Filters** : Gestion centralisée des exceptions
