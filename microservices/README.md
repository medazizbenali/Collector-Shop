# Microservices - Collector.shop

## 📁 Structure

```
microservices/
├── auth-service/          ✅ COMPLET - Google OAuth 2.0 + Kafka
├── articles-service/      🚧 Structure créée
├── orders-service/        🚧 Structure créée
├── payment-service/       🚧 Structure créée
├── cart-service/          🚧 Structure créée
├── shops-service/         🚧 Structure créée
└── search-service/        🚧 Structure créée
```

## ✅ Auth Service (COMPLET)

Le service d'authentification est **entièrement fonctionnel** avec:

- ✅ Google OAuth 2.0 (Authorization Code + PKCE)
- ✅ JWT Tokens (access + refresh)
- ✅ User Entity (TypeORM + PostgreSQL)
- ✅ Kafka Producer (événements USER_REGISTERED, USER_UPDATED)
- ✅ Redis Cache (tokens)
- ✅ RBAC (ADMIN, SELLER, BUYER)

**Endpoints:**
- `GET /auth/google/login` - Redirect vers Google OAuth
- `GET /auth/google/callback` - Callback Google
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `GET /health` - Health check

## 🚧 Services à compléter

Les autres services ont leur structure de base (package.json, Dockerfile, tsconfig.json) mais nécessitent le code applicatif.

### Articles Service (Port 8002)
**À implémenter:**
- CRUD articles
- Modération (PENDING → APPROVED/REJECTED)
- Upload images
- Indexation Elasticsearch
- Kafka events: ARTICLE_CREATED, ARTICLE_UPDATED, ARTICLE_DELETED

### Orders Service (Port 8003)
**À implémenter:**
- Création commandes
- Workflow: PENDING → PAID → SHIPPED → DELIVERED
- Calcul commission
- Kafka events: ORDER_CREATED, ORDER_PAID, ORDER_SHIPPED

### Payment Service (Port 8006)
**À implémenter:**
- Stripe checkout sessions
- Webhook handling
- Refunds
- Kafka events: PAYMENT_INITIATED, PAYMENT_COMPLETED, PAYMENT_FAILED

### Cart Service (Port 8004)
**À implémenter:**
- Redis storage (100%)
- TTL 30 jours
- CRUD cart items
- Kafka consumer: ARTICLE_DELETED, ORDER_CREATED

### Shops Service (Port 8005)
**À implémenter:**
- CRUD shops
- Vérification (Admin)
- Statistiques
- Kafka events: SHOP_CREATED, SHOP_VERIFIED

### Search Service (Port 8007)
**À implémenter:**
- Elasticsearch wrapper
- Full-text search
- Auto-completion
- Kafka consumer: ARTICLE_CREATED, ARTICLE_UPDATED, ARTICLE_DELETED

---

## 🛠️ Développement local

### 1. Installer les dépendances

```bash
# Auth Service (déjà fait)
cd auth-service
npm install
cd ..

# Ou pour tous les services à la fois (Windows)
../build-all-services.bat
```

### 2. Lancer un service en développement

```bash
cd auth-service
npm run start:dev
```

### 3. Build un service

```bash
cd auth-service
npm run build
```

---

## 🐳 Docker

Chaque service a son Dockerfile:

```bash
# Build un service
docker build -t auth-service ./auth-service

# Ou via docker-compose
docker-compose -f ../docker-compose.microservices.yml build auth-service
```

---

## 📊 Dépendances communes

Tous les services utilisent:
- **NestJS** 10.3.0
- **TypeScript** 5.3.3
- **Kafkajs** 2.2.4
- **class-validator** & **class-transformer**

Spécifiques:
- **TypeORM + PostgreSQL**: auth, articles, orders, payment, shops
- **Redis**: auth (cache), cart (storage)
- **Elasticsearch**: articles, search
- **Stripe SDK**: payment

---

## 🚀 Template pour nouveau service

Chaque service suit cette structure:

```
service-name/
├── src/
│   ├── entities/          # TypeORM entities (si PostgreSQL)
│   ├── dto/               # Data Transfer Objects
│   ├── kafka/             # Kafka producer/consumer
│   ├── main.ts            # Bootstrap
│   ├── app.module.ts      # Module principal
│   ├── app.controller.ts  # Endpoints
│   └── app.service.ts     # Business logic
├── Dockerfile
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env
```

---

## 🔗 Communication

### Kafka Topics

Chaque service publie/consomme des événements via Kafka:

| Service | Publie | Consomme |
|---------|--------|----------|
| auth | user.events | - |
| articles | article.events | user.events |
| orders | order.events | article.events, payment.events |
| payment | payment.events | order.events |
| cart | cart.events | article.events, order.events |
| shops | shop.events | order.events |
| search | - | article.events |

---

## 📝 TODO

- [ ] Compléter Articles Service
- [ ] Compléter Orders Service
- [ ] Compléter Payment Service
- [ ] Compléter Cart Service
- [ ] Compléter Shops Service
- [ ] Compléter Search Service
- [ ] Tests unitaires par service
- [ ] Tests E2E
- [ ] Documentation API (Swagger)

---

**Auth Service est prêt à l'emploi ! 🚀**
**Les autres services attendent d'être complétés.**
