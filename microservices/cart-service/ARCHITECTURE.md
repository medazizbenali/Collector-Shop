# Cart Service - Architecture

## Vue d'ensemble
Le Cart Service est un microservice NestJS qui gère les paniers d'achat des utilisateurs en utilisant Redis comme système de stockage avec TTL automatique de 7 jours.

## Stack Technique
- **Framework**: NestJS 10.x
- **Base de données**: Redis (ioredis 5.x)
- **Messaging**: Kafka (kafkajs 2.x)
- **Authentification**: JWT (passport-jwt)
- **Validation**: class-validator, class-transformer

## Structure du Projet

```
cart-service/
├── src/
│   ├── auth/                      # Authentification JWT
│   │   ├── jwt.strategy.ts        # Stratégie Passport JWT
│   │   └── jwt-auth.guard.ts      # Guard pour protéger les routes
│   │
│   ├── cart/                      # Module principal du panier
│   │   ├── dto/
│   │   │   ├── add-to-cart.dto.ts       # DTO pour ajouter un article
│   │   │   └── update-cart-item.dto.ts  # DTO pour mettre à jour
│   │   ├── interfaces/
│   │   │   └── cart.interface.ts        # Interfaces Cart et CartItem
│   │   ├── cart.controller.ts     # Contrôleur REST
│   │   ├── cart.service.ts        # Logique métier
│   │   └── cart.module.ts         # Module NestJS
│   │
│   ├── redis/                     # Module Redis
│   │   ├── redis.service.ts       # Service Redis avec ioredis
│   │   └── redis.module.ts        # Module Redis global
│   │
│   ├── kafka/                     # Module Kafka
│   │   └── kafka.service.ts       # Service Kafka Producer
│   │
│   ├── app.module.ts              # Module racine (SANS TypeORM)
│   ├── main.ts                    # Bootstrap (port 8004)
│   └── health.controller.ts       # Health check
│
├── .env.example                   # Variables d'environnement
├── Dockerfile                     # Container Docker
├── package.json                   # Dépendances (avec ioredis)
└── tsconfig.json                  # Configuration TypeScript
```

## Flux de Données

### 1. Ajout d'un article
```
Client → JWT Guard → CartController.addItem()
  → CartService.addItem()
    → RedisService.get(cart:userId)
    → Logique métier (ajout/mise à jour quantité)
    → RedisService.set(cart:userId, data, TTL=7j)
    → KafkaService.publishEvent(CART_ITEM_ADDED)
  → Response: Cart
```

### 2. Récupération du panier
```
Client → JWT Guard → CartController.getCart()
  → CartService.getCart()
    → RedisService.get(cart:userId)
    → Si vide: retourner panier vide
    → Sinon: JSON.parse et retourner
  → Response: Cart
```

### 3. Suppression d'un article
```
Client → JWT Guard → CartController.removeItem()
  → CartService.removeItem()
    → RedisService.get(cart:userId)
    → Filtrer items
    → RedisService.set(cart:userId, updatedCart, TTL=7j)
    → KafkaService.publishEvent(CART_ITEM_REMOVED)
  → Response: Cart
```

## Modèle de Données

### Interface Cart
```typescript
{
  userId: string;
  items: CartItem[];
  totalPrice: number;
  updatedAt: Date;
}
```

### Interface CartItem
```typescript
{
  id: string;              // UUID généré par randomUUID()
  articleId: string;       // Référence à l'article
  quantity: number;
  price: number;
  articleData: {
    title: string;
    image: string;
    sellerId: string;
  }
}
```

## Redis

### Stratégie de clés
- **Pattern**: `cart:{userId}`
- **Exemple**: `cart:user-123-456-789`

### TTL (Time To Live)
- **Durée**: 7 jours (604800 secondes)
- **Comportement**: Redis supprime automatiquement le panier après 7 jours d'inactivité
- **Mise à jour**: Le TTL est renouvelé à chaque opération sur le panier

### Configuration
```typescript
RedisService:
  - Host: localhost (configurable via REDIS_HOST)
  - Port: 6379 (configurable via REDIS_PORT)
  - Retry Strategy: Délai exponentiel (max 2s)
```

## Kafka Events

### Topic: `cart.events`

#### Event: CART_ITEM_ADDED
```json
{
  "eventType": "CART_ITEM_ADDED",
  "userId": "user-id",
  "articleId": "article-id",
  "quantity": 2,
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

#### Event: CART_ITEM_REMOVED
```json
{
  "eventType": "CART_ITEM_REMOVED",
  "userId": "user-id",
  "articleId": "article-id",
  "itemId": "item-id",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

#### Event: CART_CLEARED
```json
{
  "eventType": "CART_CLEARED",
  "userId": "user-id",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

## Authentification

### JWT Strategy
- **Header**: `Authorization: Bearer <token>`
- **Secret**: Partagé avec Auth Service (via JWT_SECRET)
- **Payload**:
  ```json
  {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "customer"
  }
  ```

### Protected Routes
Toutes les routes `/cart/*` sont protégées par `JwtAuthGuard`.

## Endpoints API

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | /health | Health check | Non |
| GET | /cart | Récupérer le panier | Oui |
| POST | /cart/add | Ajouter un article | Oui |
| PUT | /cart/items/:itemId | Mettre à jour la quantité | Oui |
| DELETE | /cart/items/:itemId | Supprimer un article | Oui |
| DELETE | /cart/clear | Vider le panier | Oui |

## Différences avec Articles Service

### Similitudes (Pattern suivi)
- ✅ Structure NestJS modulaire
- ✅ JWT authentication
- ✅ Kafka pour les événements
- ✅ Health check endpoint
- ✅ CORS configuration
- ✅ ValidationPipe global
- ✅ Dockerfile similaire

### Différences (Spécificités Redis)
- ❌ **PAS de TypeORM** → Redis direct
- ❌ **PAS d'entités** → Interfaces TypeScript
- ✅ **RedisModule** au lieu de TypeOrmModule
- ✅ **RedisService** pour les opérations CRUD
- ✅ **TTL automatique** sur les données
- ✅ **Stockage en JSON** dans Redis
- ✅ **UUID natif** (crypto.randomUUID)

## Déploiement

### Variables d'environnement requises
```env
PORT=8004
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
KAFKA_BROKERS=localhost:9092
```

### Docker
```bash
docker build -t cart-service .
docker run -p 8004:8004 cart-service
```

### Dépendances externes
- Redis (port 6379)
- Kafka (ports 9092, 9093, 9094)
- Auth Service (pour validation JWT)

## Monitoring

### Logs
- ✅ Connexion Redis
- ✅ Événements Kafka publiés
- ✅ Erreurs de connexion
- ✅ Démarrage du service

### Health Check
```bash
curl http://localhost:8004/health
```

Response:
```json
{
  "status": "ok",
  "service": "cart-service",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```
