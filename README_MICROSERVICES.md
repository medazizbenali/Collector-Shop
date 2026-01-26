# Architecture Microservices - Collector.shop

## 🎯 Vue d'ensemble

Ce projet a migré d'une architecture monolithique vers une architecture microservices avec les technologies suivantes:

### Stack Technique

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Apache Kafka** | 7.6.0 (KRaft) | Event streaming (3 brokers, NO Zookeeper) |
| **Google OAuth 2.0** | - | Authentification SSO (remplace bcrypt) |
| **NestJS** | 10.3.0 | Framework des microservices |
| **PostgreSQL** | 15 | Bases de données (database-per-service) |
| **Redis** | 7 | Cache et cart service |
| **Elasticsearch** | 8.11.0 | Moteur de recherche |
| **Prometheus** | latest | Métriques |
| **Grafana** | latest | Dashboards monitoring |
| **Filebeat** | 8.11.0 | Collecte logs |
| **Kibana** | 8.11.0 | Visualisation logs |
| **NGINX** | alpine | API Gateway |
| **Docker** | - | Containerization |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                           │
│                    http://localhost:3000                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API GATEWAY (NGINX) - Port 8000                     │
│            /api/auth/*      →  auth-service:8001                 │
│            /api/articles/*  →  articles-service:8002             │
│            /api/orders/*    →  orders-service:8003               │
│            /api/payments/*  →  payment-service:8006              │
│            /api/cart/*      →  cart-service:8004                 │
│            /api/shops/*     →  shops-service:8005                │
│            /api/search/*    →  search-service:8007               │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │   Articles   │    │   Orders     │
│   :8001      │    │   Service    │    │   Service    │
│   Google     │    │   :8002      │    │   :8003      │
│   OAuth 2.0  │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │  ┌────────────────┼────────────────┐  │
       │  │                │                │  │
       ▼  ▼                ▼                ▼  ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Payment    │    │     Cart     │    │    Shops     │
│   Service    │    │   Service    │    │   Service    │
│   :8006      │    │   :8004      │    │   :8005      │
│   Stripe     │    │   Redis      │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────┐
        │    APACHE KAFKA (KRaft Mode)               │
        │    3 Brokers - NO Zookeeper                │
        │    Topics: user, article, order, payment   │
        └────────────────┬───────────────────────────┘
                         │
                         ▼
                ┌──────────────┐
                │    Search    │
                │   Service    │
                │   :8007      │
                │Elasticsearch │
                └──────────────┘
```

---

## 🔧 Microservices

### 1. Auth Service (Port 8001)
- **Technologie:** NestJS + TypeORM + PostgreSQL + Redis
- **Authentification:** Google OAuth 2.0 (Authorization Code + PKCE)
- **Responsabilités:**
  - Login/Logout via Google
  - Génération JWT tokens (access + refresh)
  - RBAC (ADMIN, SELLER, BUYER)
  - Cache tokens dans Redis
  - Publier événements Kafka (USER_REGISTERED, USER_UPDATED)

**Endpoints:**
```
GET  /auth/google/login      - Redirect vers Google OAuth
GET  /auth/google/callback   - Callback Google
POST /auth/refresh           - Refresh access token
GET  /auth/profile           - Get user profile (JWT protected)
GET  /health                 - Health check
```

### 2. Articles Service (Port 8002)
- **Technologie:** NestJS + PostgreSQL + Elasticsearch
- **Responsabilités:**
  - CRUD articles
  - Modération (PENDING → APPROVED/REJECTED)
  - Upload images
  - Indexation Elasticsearch
  - Publier événements Kafka

**Endpoints:**
```
POST   /articles              - Create article
GET    /articles              - List articles
GET    /articles/:id          - Get article
PATCH  /articles/:id          - Update article
DELETE /articles/:id          - Delete article
POST   /articles/:id/approve  - Approve (Admin)
GET    /search                - Search articles
```

### 3. Orders Service (Port 8003)
- **Technologie:** NestJS + PostgreSQL
- **Responsabilités:**
  - Création commandes
  - Workflow statuts (PENDING → PAID → SHIPPED → DELIVERED)
  - Calcul commission plateforme
  - Génération factures
  - Communication avec Payment Service

**Endpoints:**
```
POST   /orders               - Create order
GET    /orders               - List user orders
GET    /orders/:id           - Get order
PATCH  /orders/:id/status    - Update status
POST   /orders/:id/checkout  - Initiate payment
```

### 4. Payment Service (Port 8006)
- **Technologie:** NestJS + PostgreSQL + Stripe SDK
- **Responsabilités:**
  - Intégration Stripe
  - Checkout sessions
  - Webhooks Stripe
  - Remboursements
  - Publier événements paiement

**Endpoints:**
```
POST /payments/checkout         - Create Stripe session
POST /payments/verify/:id       - Verify payment
POST /payments/webhook          - Stripe webhooks
POST /payments/refund/:id       - Refund payment
```

### 5. Cart Service (Port 8004)
- **Technologie:** NestJS + Redis (primary storage)
- **Responsabilités:**
  - Gestion panier temps réel
  - TTL automatique (30 jours)
  - Calcul totaux
  - Aucune base de données PostgreSQL (100% Redis)

**Endpoints:**
```
GET    /cart               - Get user cart
POST   /cart/items         - Add item
PATCH  /cart/items/:id     - Update quantity
DELETE /cart/items/:id     - Remove item
DELETE /cart               - Clear cart
```

### 6. Shops Service (Port 8005)
- **Technologie:** NestJS + PostgreSQL
- **Responsabilités:**
  - CRUD boutiques
  - Vérification boutiques (Admin)
  - Statistiques ventes

**Endpoints:**
```
POST   /shops              - Create shop
GET    /shops              - List shops
GET    /shops/:id          - Get shop
PATCH  /shops/:id          - Update shop
DELETE /shops/:id          - Delete shop
POST   /shops/:id/verify   - Verify (Admin)
```

### 7. Search Service (Port 8007)
- **Technologie:** NestJS + Elasticsearch
- **Responsabilités:**
  - Full-text search articles
  - Auto-completion
  - Filtres avancés
  - Consumer Kafka (indexation automatique)

**Endpoints:**
```
GET /search?q=pokemon        - Full-text search
GET /search/suggest?q=poke   - Auto-complete
```

---

## 🚀 Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+ (pour développement local)
- Google OAuth Client ID & Secret
- Stripe API Keys

### 1. Configuration

```bash
# Copier le fichier d'environnement
cp .env.microservices .env

# Modifier avec vos clés
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-secret
STRIPE_SECRET_KEY=sk_test_votre_cle
```

### 2. Démarrage

```bash
# Démarrer TOUS les services
docker-compose -f docker-compose.microservices.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.microservices.yml logs -f

# Vérifier que tout est up
docker-compose -f docker-compose.microservices.yml ps
```

### 3. Créer les topics Kafka

```bash
# Se connecter au broker Kafka
docker exec -it kafka-broker-1 bash

# Créer les topics
kafka-topics --create --topic user.events --partitions 3 --replication-factor 2 --bootstrap-server localhost:9092
kafka-topics --create --topic article.events --partitions 5 --replication-factor 2 --bootstrap-server localhost:9092
kafka-topics --create --topic order.events --partitions 3 --replication-factor 2 --bootstrap-server localhost:9092
kafka-topics --create --topic payment.events --partitions 3 --replication-factor 2 --bootstrap-server localhost:9092
kafka-topics --create --topic shop.events --partitions 2 --replication-factor 2 --bootstrap-server localhost:9092

# Vérifier
kafka-topics --list --bootstrap-server localhost:9092
exit
```

### 4. Tests

```bash
# Health check API Gateway
curl http://localhost:8000/health

# Test Auth Service
# Ouvrir dans le navigateur: http://localhost:8001/auth/google/login

# Test Articles (avec token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/articles
```

---

## 📊 Monitoring & Observabilité

### Kafka UI
- **URL:** http://localhost:8080
- Visualiser les topics et les messages

### Prometheus
- **URL:** http://localhost:9090
- Métriques de tous les microservices

### Grafana
- **URL:** http://localhost:3001
- **Login:** admin / admin
- Dashboards de monitoring

### Kibana (Logs)
- **URL:** http://localhost:5601
- Logs centralisés de tous les services

---

## 🔄 Communication Kafka

### Topics

| Topic | Partitions | Replication | Producers | Consumers |
|-------|------------|-------------|-----------|-----------|
| `user.events` | 3 | 2 | auth-service | articles, orders, shops |
| `article.events` | 5 | 2 | articles-service | search, orders |
| `order.events` | 3 | 2 | orders-service | payment, shops |
| `payment.events` | 3 | 2 | payment-service | orders |
| `shop.events` | 2 | 2 | shops-service | - |

### Événements

**user.events:**
```json
{
  "eventType": "USER_REGISTERED",
  "userId": "uuid",
  "email": "user@example.com",
  "role": "BUYER",
  "timestamp": "2025-12-18T10:00:00Z"
}
```

**article.events:**
```json
{
  "eventType": "ARTICLE_CREATED",
  "articleId": "uuid",
  "sellerId": "uuid",
  "title": "Pokemon Card",
  "price": 150.00,
  "timestamp": "2025-12-18T10:00:00Z"
}
```

**order.events:**
```json
{
  "eventType": "ORDER_PAID",
  "orderId": "uuid",
  "buyerId": "uuid",
  "totalAmount": 150.00,
  "paidAt": "2025-12-18T10:00:00Z"
}
```

---

## 📦 Bases de données

Chaque microservice a sa propre base de données (database-per-service pattern):

| Service | Database | Port | User |
|---------|----------|------|------|
| auth-service | postgres-auth | 5433 | auth_user |
| articles-service | postgres-articles | 5434 | articles_user |
| orders-service | postgres-orders | 5435 | orders_user |
| payment-service | postgres-payments | 5436 | payments_user |
| shops-service | postgres-shops | 5437 | shops_user |
| cart-service | **Redis** | 6379 | - |

---

## 🧹 Nettoyage

```bash
# Arrêter tous les services
docker-compose -f docker-compose.microservices.yml down

# Supprimer les volumes (ATTENTION: perte de données)
docker-compose -f docker-compose.microservices.yml down -v

# Nettoyer les images
docker system prune -a
```

---

## 📚 Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guide détaillé de migration
- [MICROSERVICES_ARCHITECTURE_FINAL.md](./MICROSERVICES_ARCHITECTURE_FINAL.md) - Architecture complète

---

## 🚨 Ports utilisés

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 8000 | http://localhost:8000 |
| Auth Service | 8001 | http://localhost:8001 |
| Articles Service | 8002 | http://localhost:8002 |
| Orders Service | 8003 | http://localhost:8003 |
| Cart Service | 8004 | http://localhost:8004 |
| Shops Service | 8005 | http://localhost:8005 |
| Payment Service | 8006 | http://localhost:8006 |
| Search Service | 8007 | http://localhost:8007 |
| Kafka UI | 8080 | http://localhost:8080 |
| Kafka Broker 1 | 9092 | localhost:9092 |
| Kafka Broker 2 | 9093 | localhost:9093 |
| Kafka Broker 3 | 9094 | localhost:9094 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3001 | http://localhost:3001 |
| Kibana | 5601 | http://localhost:5601 |
| Elasticsearch | 9200 | http://localhost:9200 |
| Redis | 6379 | localhost:6379 |

---

**Bonne utilisation ! 🚀**
