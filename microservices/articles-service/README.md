# Articles Service - Port 8002

Service de gestion des articles et des catégories pour la plateforme CollectorShop.

## Fonctionnalités

### Articles
- CRUD complet des articles
- Filtrage et recherche avancés
- Gestion des statuts (draft, pending_approval, approved, rejected, sold, archived)
- Support des images multiples
- Tags et attributs personnalisés
- Compteurs de vues et favoris
- Modération (approval/rejection workflow)

### Catégories
- CRUD des catégories
- Système de slugs
- Activation/désactivation

## Architecture

### Stack Technique
- **Framework**: NestJS 10.x
- **Base de données**: PostgreSQL (Port 5438)
- **ORM**: TypeORM
- **Messaging**: Kafka (topics: article.events)
- **Authentification**: JWT (partagé avec Auth Service)
- **Validation**: class-validator

### Entités

#### Article
```typescript
{
  id: uuid
  title: string
  description: text
  price: decimal(10,2)
  shippingCost: decimal(10,2)
  condition: enum(new, like_new, very_good, good, acceptable)
  status: enum(draft, pending_approval, approved, rejected, sold, archived)
  images: json[]
  tags: json[]
  brand: string
  year: number
  quantity: number
  viewCount: number
  favoriteCount: number
  categoryId: uuid
  sellerId: uuid
  shopId: uuid (nullable)
  buyerId: uuid (nullable)
  rejectionReason: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Category
```typescript
{
  id: uuid
  name: string
  slug: string (unique)
  description: text
  imageUrl: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

### Health Check
```
GET /health
```

### Articles

#### Lister les articles (public)
```
GET /articles?search=&categoryId=&condition=&minPrice=&maxPrice=&page=1&limit=20
```

#### Obtenir un article
```
GET /articles/:id
```

#### Créer un article (authentifié)
```
POST /articles
Authorization: Bearer <token>
{
  "title": "Figurine Naruto",
  "description": "Figurine en excellent état",
  "price": 49.99,
  "shippingCost": 5.00,
  "condition": "like_new",
  "categoryId": "uuid",
  "images": ["url1", "url2"],
  "tags": ["anime", "naruto"],
  "brand": "Banpresto",
  "year": 2020,
  "quantity": 1
}
```

#### Mettre à jour un article (authentifié, propriétaire uniquement)
```
PATCH /articles/:id
Authorization: Bearer <token>
{ ...champs à modifier }
```

#### Supprimer un article (authentifié, propriétaire uniquement)
```
DELETE /articles/:id
Authorization: Bearer <token>
```

#### Soumettre pour approbation (authentifié, propriétaire uniquement)
```
POST /articles/:id/submit
Authorization: Bearer <token>
```

#### Approuver un article (authentifié, ADMIN uniquement)
```
POST /articles/:id/approve
Authorization: Bearer <token>
```

#### Rejeter un article (authentifié, ADMIN uniquement)
```
POST /articles/:id/reject
Authorization: Bearer <token>
{
  "reason": "Raison du rejet"
}
```

#### Marquer comme vendu (système)
```
POST /articles/:id/sold
{
  "buyerId": "uuid"
}
```

### Catégories

#### Lister les catégories
```
GET /categories?isActive=true
```

#### Obtenir une catégorie
```
GET /categories/:id
GET /categories/slug/:slug
```

#### Créer une catégorie (authentifié, ADMIN)
```
POST /categories
Authorization: Bearer <token>
{
  "name": "Figurines",
  "slug": "figurines",
  "description": "Figurines de collection",
  "isActive": true
}
```

#### Mettre à jour une catégorie (authentifié, ADMIN)
```
PATCH /categories/:id
Authorization: Bearer <token>
{ ...champs }
```

#### Supprimer une catégorie (authentifié, ADMIN)
```
DELETE /categories/:id
Authorization: Bearer <token>
```

## Événements Kafka

Le service publie sur le topic `article.events`:

- `ARTICLE_CREATED`: Nouvel article créé
- `ARTICLE_UPDATED`: Article mis à jour
- `ARTICLE_DELETED`: Article supprimé
- `ARTICLE_SUBMITTED_FOR_APPROVAL`: Article soumis pour modération
- `ARTICLE_APPROVED`: Article approuvé
- `ARTICLE_REJECTED`: Article rejeté
- `ARTICLE_SOLD`: Article vendu

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env`:

```env
PORT=8002
SERVICE_NAME=articles-service
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5438
DATABASE_USER=articles_user
DATABASE_PASSWORD=articles_password
DATABASE_NAME=articles_db

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

KAFKA_BROKERS=localhost:9092,localhost:9093,localhost:9094
KAFKA_CLIENT_ID=articles-service

FRONTEND_URL=http://localhost:3000
```

## Démarrage

### Développement
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker build -t articles-service .
docker run -p 8002:8002 articles-service
```

## Tests

```bash
# Test des endpoints
curl http://localhost:8002/health
curl http://localhost:8002/articles
curl http://localhost:8002/categories
```

## Seed des catégories

Pour initialiser les catégories de base:

```bash
node seed-categories.js
```

Catégories créées:
- Figurines
- Cartes à collectionner
- Mangas & BD
- Jeux vidéo rétro
- Goodies
- Vinyles & CD

## Structure du projet

```
src/
├── articles/
│   ├── entities/
│   │   └── article.entity.ts
│   ├── dto/
│   │   ├── create-article.dto.ts
│   │   ├── update-article.dto.ts
│   │   └── filter-article.dto.ts
│   ├── articles.service.ts
│   ├── articles.controller.ts
│   └── articles.module.ts
├── categories/
│   ├── entities/
│   │   └── category.entity.ts
│   ├── dto/
│   │   ├── create-category.dto.ts
│   │   └── update-category.dto.ts
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   └── categories.module.ts
├── auth/
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── kafka/
│   └── kafka.service.ts
├── app.module.ts
├── main.ts
└── health.controller.ts
```

## Intégration avec les autres services

- **Auth Service (8001)**: Validation JWT, informations utilisateur
- **Search Service (8007)**: Indexation Elasticsearch des articles
- **Orders Service (8003)**: Mise à jour du statut "sold"
- **Shops Service (8005)**: Association articles-boutiques

## Notes de développement

- TypeORM synchronize est activé en dev (désactiver en prod)
- Les guards d'authentification nécessitent le JWT_SECRET identique à l'Auth Service
- Le statut par défaut des articles est "draft"
- Seuls les articles "approved" sont visibles publiquement
- La validation class-validator est activée globalement

## TODO

- [ ] Implémenter le rôle ADMIN pour les guards
- [ ] Ajouter upload d'images
- [ ] Ajouter système de favoris
- [ ] Implémenter la pagination côté TypeORM
- [ ] Ajouter tests unitaires et e2e
- [ ] Ajouter rate limiting
- [ ] Implémenter soft delete
