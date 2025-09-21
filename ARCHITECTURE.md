# Architecture Hexagonale - News Scraper

## Vue d'ensemble

Ce projet implémente une **architecture hexagonale** (aussi appelée Ports & Adapters) pour un service de scraping d'articles de news. Cette architecture garantit une séparation claire des responsabilités, une haute testabilité et une flexibilité maximale pour les changements futurs.

## Principes de l'Architecture Hexagonale

### Concept Clé : Inversion de Dépendances
- Le **domaine métier** ne dépend d'aucune technologie externe
- Les **couches externes** dépendent des **couches internes**
- Les **ports** définissent les contrats d'interface
- Les **adapters** implémentent ces contrats pour des technologies spécifiques

## Structure des Couches

```
src/
├── domain/                    # 🟢 COUCHE DOMAINE
│   ├── entities/             # Entités métier pures
│   ├── value-objects/        # Objets valeur avec validation
│   ├── repositories/         # Interfaces (ports)
│   └── errors/              # Erreurs domaine spécifiques
├── application/              # 🔵 COUCHE APPLICATION
│   ├── use-cases/           # Cas d'usage métier
│   ├── dtos/                # Objets de transfert
│   └── common/              # Utilitaires (Result pattern)
├── infrastructure/          # 🟡 COUCHE INFRASTRUCTURE
│   ├── repositories/        # Implémentations Sequelize
│   └── mappers/             # Conversion Entités ↔ Modèles DB
└── interface/              # 🔴 COUCHE INTERFACE
    └── http/               # Controllers, DTOs, Filters
```

## Description des Couches

### 🟢 Couche Domaine (Domain Layer)

**Responsabilité** : Contenir la logique métier pure, indépendante de toute technologie.

#### Entités (`entities/`)
```typescript
// ArticleEntity : Représente un article de news
export class ArticleEntity {
  private readonly _id?: number;
  private readonly _title: Title;
  private readonly _url: Url;
  private readonly _source: Source;

  // Logique métier pure, sans dépendances externes
}
```

#### Value Objects (`value-objects/`)
```typescript
// Title : Encapsule et valide les titres d'articles
export class Title {
  private readonly _value: string;

  public static create(value: string): Title {
    if (!value || value.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    // Validation métier intégrée
  }
}
```

#### Repositories Interfaces (`repositories/`)
```typescript
// Contrat d'accès aux données (port)
export interface ArticleRepository {
  save(article: ArticleEntity): Promise<ArticleEntity>;
  findAll(options: FindArticlesOptions): Promise<FindArticlesResult>;
  // Définit QUOI faire, pas COMMENT
}
```

#### Erreurs Domaine (`errors/`)
```typescript
// Erreurs métier spécifiques
export class ArticleAlreadyExistsError extends DomainError {
  constructor(url: string) {
    super(`Article with URL '${url}' already exists`);
  }
}
```

### 🔵 Couche Application (Application Layer)

**Responsabilité** : Orchestrer les cas d'usage métier et coordonner les interactions.

#### Use Cases (`use-cases/`)
```typescript
// ScrapeNewsUseCase : Orchestrer le scraping et la sauvegarde
@Injectable()
export class ScrapeNewsUseCase {
  constructor(
    @Inject(ARTICLE_REPOSITORY) private articleRepository: ArticleRepository,
    @Inject(NewsScraperPort) private newsScraper: NewsScraperPort,
  ) {}

  async execute(): Promise<Result<ScrapeNewsResultDto, Error>> {
    // 1. Scraper les articles
    // 2. Valider avec les entités domaine
    // 3. Sauvegarder via le repository
    // 4. Retourner le résultat
  }
}
```

#### DTOs (`dtos/`)
```typescript
// Objets de transfert entre couches
export interface ScrapeNewsResultDto {
  articles: ArticleDto[];
  count: number;
  saved: number;
  duplicates: number;
  status: 'success' | 'error';
}
```

#### Result Pattern (`common/`)
```typescript
// Gestion d'erreurs sans exceptions
export class Result<T, E = Error> {
  public static ok<T>(value: T): Result<T, E>
  public static fail<T, E>(error: E): Result<T, E>
  public match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U
}
```

### 🟡 Couche Infrastructure (Infrastructure Layer)

**Responsabilité** : Implémenter les contrats définis par le domaine avec des technologies concrètes.

#### Repository Implementations (`repositories/`)
```typescript
// Implémentation Sequelize du contrat ArticleRepository
@Injectable()
export class SequelizeArticleRepository implements ArticleRepository {
  constructor(
    @InjectModel(ArticleModel) private articleModel: typeof ArticleModel,
  ) {}

  async save(article: ArticleEntity): Promise<ArticleEntity> {
    // Conversion entité → modèle Sequelize → sauvegarde → entité
  }
}
```

#### Mappers (`mappers/`)
```typescript
// Conversion entre domaine et infrastructure
export class ArticleMapper {
  public static toDomain(model: ArticleModel): ArticleEntity {
    // Sequelize Model → Domain Entity
  }

  public static toPersistence(entity: ArticleEntity): Partial<ArticleModel> {
    // Domain Entity → Sequelize Model
  }
}
```

### 🔴 Couche Interface (Interface Layer)

**Responsabilité** : Exposer l'application au monde extérieur (HTTP, CLI, etc.).

#### Controllers HTTP (`http/controllers/`)
```typescript
// Point d'entrée HTTP, délègue aux use cases
@Controller('articles')
export class ArticlesController {
  constructor(private getArticlesUseCase: GetArticlesUseCase) {}

  @Get()
  async getArticles(@Query() query: GetArticlesQueryDto) {
    const result = await this.getArticlesUseCase.execute(query);
    return result.match(
      (data) => plainToClass(GetArticlesResponseDto, data),
      (error) => { throw error; }
    );
  }
}
```

#### DTOs HTTP (`http/dtos/`)
```typescript
// Validation des entrées HTTP
export class GetArticlesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  source?: string;
}
```

#### Exception Filters (`http/filters/`)
```typescript
// Conversion erreurs domaine → codes HTTP
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const status = this.getHttpStatus(exception);
    // ArticleAlreadyExistsError → 409 Conflict
    // InvalidArticleDataError → 400 Bad Request
  }
}
```

## Flux de Données

### Exemple : Scraping d'Articles

```
1. 🔴 HTTP POST /scrape
   ↓
2. 🔴 ScrapingController.scrapeNews()
   ↓
3. 🔵 ScrapeNewsUseCase.execute()
   ↓
4. 🟡 BbcNewsScraperAdapter.scrapeArticles() (via Port)
   ↓
5. 🔵 ArticleEntity.createFromScraping() (validation métier)
   ↓
6. 🟡 SequelizeArticleRepository.save() (via Interface)
   ↓
7. 🟡 ArticleMapper.toPersistence()
   ↓
8. 🟡 Sequelize Model.create()
   ↓
9. 🔵 Result<ScrapeNewsResultDto> (succès/échec)
   ↓
10. 🔴 HTTP Response (JSON)
```

## Avantages de cette Architecture

### ✅ Testabilité
- **Domaine isolé** : Tests unitaires sans dépendances externes
- **Mocking facile** : Injection de dépendances via interfaces
- **Tests d'intégration** : Remplacement des adapters par des mocks

### ✅ Flexibilité
- **Changement d'ORM** : Remplacer Sequelize par TypeORM sans impact domaine
- **Nouvelles interfaces** : Ajouter GraphQL, gRPC sans modifier le métier
- **Sources de données** : Scraper d'autres sites sans changer l'application

### ✅ Maintenabilité
- **Séparation claire** : Chaque couche a une responsabilité unique
- **Couplage faible** : Changements isolés dans chaque couche
- **Code métier pur** : Logique business indépendante de la technologie

### ✅ Évolutivité
- **Ajout de fonctionnalités** : Nouveaux use cases sans impact existant
- **Scaling** : Remplacement d'adapters par des versions distribuées
- **Migration technologique** : Changements progressifs couche par couche

## Patterns Utilisés

### 🎯 Dependency Injection
- **Inversion de contrôle** via NestJS
- **Interfaces** définissent les contrats
- **Implémentations** injectées dynamiquement

### 🎯 Repository Pattern
- **Abstraction** de l'accès aux données
- **Interface** dans le domaine
- **Implémentation** dans l'infrastructure

### 🎯 Result Pattern
- **Gestion d'erreurs explicite** sans exceptions
- **Composition fonctionnelle** avec `match()`
- **Type safety** complète

### 🎯 Value Objects
- **Encapsulation** des données métier
- **Validation** intégrée
- **Immutabilité** garantie

### 🎯 Mapper Pattern
- **Conversion** entre couches
- **Isolation** des formats de données
- **Centralisation** de la logique de transformation

## Injection de Dépendances

```typescript
// Configuration NestJS
@Module({
  providers: [
    ScrapeNewsUseCase,
    {
      provide: NewsScraperPort,           // Port (interface)
      useClass: BbcNewsScraperAdapter,    // Adapter (implémentation)
    },
    {
      provide: ARTICLE_REPOSITORY,        // Port (interface)
      useClass: SequelizeArticleRepository, // Adapter (implémentation)
    },
  ],
})
export class ScrapingModule {}
```

## Standards de Qualité

### 🔧 Type Safety
- **TypeScript strict** avec validation complète
- **DTOs typés** pour toutes les interfaces
- **Interfaces explicites** pour tous les contrats

### 🔧 Validation
- **Value Objects** avec règles métier
- **class-validator** pour les entrées HTTP
- **Sanitization** des données corrompues

### 🔧 Error Handling
- **Erreurs domaine** typées et spécifiques
- **Result pattern** pour la composition
- **Exception filters** pour la conversion HTTP

### 🔧 Logging
- **Logs structurés** avec contexte
- **Niveaux appropriés** (debug, info, error)
- **Pas de logs sensibles** (mots de passe, etc.)

## Bonnes Pratiques Appliquées

1. **Single Responsibility** : Chaque classe a une seule raison de changer
2. **Open/Closed** : Ouvert à l'extension, fermé à la modification
3. **Liskov Substitution** : Les implémentations respectent leurs contrats
4. **Interface Segregation** : Interfaces spécifiques et focalisées
5. **Dependency Inversion** : Dépendance sur les abstractions, pas les implémentations

Cette architecture garantit un code maintenable, testable et évolutif pour le long terme.