# PRD - News Scraper Service

## 1. Vue d'ensemble du projet

### Objectif
Développer un service backend de scraping d'articles de news depuis BBC News, permettant de collecter et stocker les informations d'articles dans une base de données MySQL.

### Contexte
Exercice de codage démontrant un code de qualité, respectant les bonnes pratiques, facile à lire et à comprendre, écrit selon les standards d'un développeur senior.

## 2. Architecture technique

### Stack technologique
- **Backend** : NestJS (Framework Node.js)
- **Base de données** : MySQL (localhost:3306)
- **ORM** : Sequelize

### Contraintes techniques
- MySQL pré-installé localement
- Code simple sans over-engineering
- Respect des bonnes pratiques NestJS

## 3. Spécifications fonctionnelles

### Source de données
- **Site cible** : https://www.bbc.com/news
- **Type de contenu** : Articles de news

### Modèle de données
Table `articles` :
```sql
id (AUTO_INCREMENT, PRIMARY KEY)
title (VARCHAR - titre de l'article)
url (VARCHAR - lien vers l'article)
publication_date (DATETIME - date de publication si disponible)
source (VARCHAR - nom du site d'actualité)
```

### Endpoints API

#### POST /scrape
- **Fonction** : Lance manuellement le scraping du site BBC News
- **Action** : Collecte et sauvegarde les articles en base
- **Réponse** : Confirmation du nombre d'articles traités

#### GET /articles
- **Fonction** : Récupère tous les articles stockés
- **Réponse** : Liste complète des articles en base

## 4. Plan de développement par étapes

### Étape 1 : Initialisation du projet
- Création du projet NestJS via CLI
- Configuration de base
- **Validation manuelle requise**

### Étape 2 : Endpoint de scraping basique
- Implémentation de POST /scrape
- Extraction des articles BBC News
- Retour des données sans sauvegarde
- **Validation manuelle requise**

### Étape 3 : Schéma de base de données
- Création du script SQL pour la table `articles`
- Documentation pour exécution manuelle
- **Validation manuelle requise**

### Étape 4 : Persistance des données
- Intégration Sequelize
- Sauvegarde des articles lors du scraping
- **Validation manuelle requise**

### Étape 5 : Endpoint de consultation
- Implémentation de GET /articles
- Récupération des données depuis MySQL
- **Validation manuelle requise**

## 5. Critères de qualité

### Architecture
- Séparation claire des responsabilités
- Inversion de dépendances

### Code
- Bonnes pratiques NestJS (modules, services, controllers)
- Code lisible et maintenable
- Gestion d'erreurs appropriée
- Documentation du code

### Performance
- Gestion efficace des requêtes de scraping
- Optimisation des requêtes base de données

## 6. Documentation technique

### Utilisation de Context7
- Documentation NestJS à jour
- Références Sequelize actualisées
- Bonnes pratiques d'architecture