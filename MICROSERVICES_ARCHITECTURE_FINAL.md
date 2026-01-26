# Architecture Microservices - Collector.shop

> Migration vers architecture microservices avec **Apache Kafka, Google OAuth, Kubernetes, Prometheus + Grafana, Redis, ELK (Elasticsearch, Filebeat, Kibana)**

---

## 📋 Stack Technologique

| Technologie | Statut | Justification |
|-------------|--------|---------------|
| **Apache Kafka** | 🔴 ESSENTIEL ✅ | Event-driven, découplage services |
| **Google OAuth 2.0** | 🔴 ESSENTIEL ✅ | SSO, MFA (remplace bcrypt) |
| **Kubernetes** | 🔴 ESSENTIEL ✅ | Orchestration moderne |
| **Prometheus + Grafana** | 🟡 IMPORTANT ✅ | Monitoring métrics |
| **Redis** | 🟡 IMPORTANT ✅ | Cache, panier, sessions |
| **ELK Stack** | 🟡 IMPORTANT ✅ | Elasticsearch + Filebeat + Kibana (logs) |

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│                    (Web SPA, Mobile, Third-party)                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (NGINX/Kong)                          │
│              Rate Limiting • SSL/TLS • Load Balancing                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Auth Service │      │   Articles   │      │   Orders     │
│   (NestJS)   │      │   Service    │      │   Service    │
│   Port 8001  │      │   Port 8002  │      │   Port 8003  │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  ┌──────────────────┼──────────────────┐  │
       │  │                  │                  │  │
       ▼  ▼                  ▼                  ▼  ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Payment    │      │     Cart     │      │    Shops     │
│   Service    │      │   Service    │      │   Service    │
│   Port 8006  │      │   Port 8004  │      │   Port 8005  │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
        ┌──────────────────────────────────────────────────┐
        │        APACHE KAFKA (KRaft Mode)                 │
        │  Topics: user, article, order, payment, shop     │
        │  3 Brokers (NO Zookeeper - KRaft integrated)     │
        └──────────────────┬───────────────────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │    Search    │
                  │   Service    │
                  │(Elasticsearch)│
                  └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH 2.0 SERVER                           │
│          Client ID + Secret • Social Login • MFA                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  DATABASES (Database-per-Service)                    │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Auth) • PostgreSQL (Articles) • PostgreSQL (Orders)     │
│  PostgreSQL (Shops) • PostgreSQL (Payments) • Redis (Cart)          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY STACK                               │
├─────────────────────────────────────────────────────────────────────┤
│  📊 LOGS: Filebeat → Elasticsearch → Kibana                         │
│  📈 METRICS: Prometheus → Grafana                                   │
│  🔍 TRACING: Jaeger (OpenTelemetry) [Optionnel]                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                                │
│     Deployments • Services • HPA • ConfigMaps • Secrets              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Microservices (7 services)

### 1. Auth Service (Port 8001)
**Responsabilités:**
- Intégration Google OAuth 2.0
- Gestion utilisateurs (CRUD)
- Validation tokens JWT
- RBAC (ADMIN, SELLER, BUYER)

**Stack:** NestJS + PostgreSQL + Redis (cache tokens)

**API Endpoints:**
```
POST   /api/auth/google/login      → Redirect vers Google OAuth
GET    /api/auth/google/callback   → Exchange code → JWT token
POST   /api/auth/refresh           → Refresh access token
GET    /api/auth/profile           → User profile
DELETE /api/auth/logout            → Revoke tokens
```

**Database Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,  -- Google user ID
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  role VARCHAR(20) DEFAULT 'BUYER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Kafka Events Published:**
```javascript
Topic: user.events
{
  eventType: 'USER_REGISTERED',
  userId: 'uuid',
  email: 'user@example.com',
  role: 'BUYER'
}
```

---

### 2. Articles Service (Port 8002)
**Responsabilités:**
- CRUD articles
- Modération (PENDING → APPROVED/REJECTED)
- Upload images (S3/MinIO)
- Indexation Elasticsearch

**Stack:** NestJS + PostgreSQL + Elasticsearch

**API:**
```
POST   /api/articles          → Create article
GET    /api/articles          → List articles
PATCH  /api/articles/:id      → Update article
POST   /api/articles/:id/approve → Approve (Admin)
GET    /api/articles/search   → Search (Elasticsearch)
```

**Kafka Events:**
```javascript
Topic: article.events
- ARTICLE_CREATED
- ARTICLE_APPROVED
- ARTICLE_DELETED
- ARTICLE_VIEWED
```

---

### 3. Orders Service (Port 8003)
**Responsabilités:**
- Création commandes
- Workflow statuts (PENDING → PAID → SHIPPED → DELIVERED)
- Calcul commission (5%)
- Génération factures

**Stack:** NestJS + PostgreSQL + gRPC client (Payment)

**API:**
```
POST   /api/orders              → Create order
GET    /api/orders              → List user orders
PATCH  /api/orders/:id/status   → Update status
POST   /api/orders/:id/checkout → Initiate payment
```

**Kafka Events:**
```javascript
Topic: order.events
- ORDER_CREATED
- ORDER_PAID
- ORDER_SHIPPED
- ORDER_DELIVERED
```

---

### 4. Payment Service (Port 8006)
**Responsabilités:**
- Intégration Stripe
- Checkout sessions
- Webhooks Stripe
- Remboursements

**Stack:** NestJS + PostgreSQL + Stripe SDK + gRPC server

**API:**
```
POST   /api/payments/checkout       → Create Stripe session
POST   /api/payments/verify/:id     → Verify payment
POST   /api/payments/webhook        → Stripe webhooks
POST   /api/payments/refund/:id     → Refund
```

**Kafka Events:**
```javascript
Topic: payment.events
- PAYMENT_INITIATED
- PAYMENT_COMPLETED
- PAYMENT_FAILED
```

---

### 5. Cart Service (Port 8004)
**Responsabilités:**
- Gestion panier temps réel
- TTL automatique (30 jours)
- Calcul totaux

**Stack:** NestJS + **Redis** (primary storage)

**API:**
```
GET    /api/cart               → Get cart
POST   /api/cart/items         → Add item
DELETE /api/cart/items/:id     → Remove item
DELETE /api/cart               → Clear cart
```

**Redis Schema:**
```javascript
Key: cart:{userId}
Value: {
  items: [{ articleId, quantity, price }],
  totalPrice: 30.00
}
TTL: 2592000 (30 days)
```

---

### 6. Shops Service (Port 8005)
**Responsabilités:**
- CRUD boutiques
- Vérification boutiques (Admin)
- Statistiques ventes

**Stack:** NestJS + PostgreSQL

**Kafka Events:**
```javascript
Topic: shop.events
- SHOP_CREATED
- SHOP_VERIFIED
```

---

### 7. Search Service (Elasticsearch)
**Responsabilités:**
- Full-text search articles
- Auto-completion
- Filtres avancés

**Stack:** Elasticsearch 8.x + Node.js wrapper

**Kafka Consumers:**
```javascript
- ARTICLE_CREATED → Index article
- ARTICLE_UPDATED → Update index
- ARTICLE_DELETED → Remove index
```

---

## 🔐 Google OAuth 2.0 Implementation

### Flux OAuth 2.0 Authorization Code + PKCE

```
1. Frontend → Redirect to Google OAuth
   URL: https://accounts.google.com/o/oauth2/v2/auth?
        client_id=YOUR_CLIENT_ID&
        redirect_uri=https://collector.shop/auth/callback&
        response_type=code&
        scope=openid email profile&
        code_challenge=BASE64URL(SHA256(verifier))&
        code_challenge_method=S256

2. User → Login with Google account

3. Google → Redirect to callback with code
   https://collector.shop/auth/callback?code=AUTHORIZATION_CODE

4. Backend → Exchange code for tokens
   POST https://oauth2.googleapis.com/token
   Body: {
     code: "AUTHORIZATION_CODE",
     client_id: "YOUR_CLIENT_ID",
     client_secret: "YOUR_SECRET",
     redirect_uri: "https://collector.shop/auth/callback",
     grant_type: "authorization_code",
     code_verifier: "ORIGINAL_VERIFIER"
   }

5. Google → Returns access_token + id_token

6. Backend → Verify id_token signature (JWT RS256)
   → Extract user info (sub, email, name, picture)
   → Create/update user in database
   → Generate internal JWT token
   → Return to frontend

7. Frontend → Store JWT token (localStorage/cookie)

8. API Requests → Authorization: Bearer JWT_TOKEN
```

### Configuration Google OAuth (Auth Service)

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'google' })],
  providers: [GoogleStrategy],
})
export class AuthModule {}

// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatarUrl: photos[0].value,
    };

    done(null, user);
  }
}

// auth.controller.ts
@Controller('auth')
export class AuthController {
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;

    // Create or update user in database
    const dbUser = await this.authService.findOrCreateGoogleUser(user);

    // Generate JWT token
    const jwt = this.authService.generateJWT({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    // Redirect to frontend with token
    res.redirect(`https://collector.shop?token=${jwt}`);
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
```

### Environment Variables (.env)

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://api.collector.shop/auth/google/callback

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 📊 Observabilité - ELK Stack (Elasticsearch, Filebeat, Kibana)

### Architecture ELK simplifié (sans Logstash)

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGS COLLECTION                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Microservices (stdout/stderr logs)                         │
│         │                                                    │
│         ▼                                                    │
│  Docker containers                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐          ┌──────────────┐                │
│  │   Filebeat   │─────────>│Elasticsearch │                │
│  │  (Shipper)   │          │  (Storage)   │                │
│  └──────────────┘          └───────┬──────┘                │
│                                    │                        │
│                                    ▼                        │
│                            ┌──────────────┐                │
│                            │    Kibana    │                │
│                            │(Visualization)                │
│                            └──────────────┘                │
│                                                              │
│  Avantages sans Logstash:                                  │
│  ✓ Architecture simplifiée                                 │
│  ✓ Moins de ressources                                     │
│  ✓ Latence réduite                                         │
│  ✓ Filebeat peut parser les logs directement              │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Filebeat

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
  # Collecte logs Docker containers
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'

    processors:
      # Ajoute metadata Docker
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

      # Parse JSON logs
      - decode_json_fields:
          fields: ["message"]
          target: ""
          overwrite_keys: true

      # Ajoute champs custom
      - add_fields:
          target: ''
          fields:
            environment: production
            cluster: collector-shop

# Output direct vers Elasticsearch
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  indices:
    - index: "logs-auth-service-%{+yyyy.MM.dd}"
      when.contains:
        container.name: "auth-service"

    - index: "logs-articles-service-%{+yyyy.MM.dd}"
      when.contains:
        container.name: "articles-service"

    - index: "logs-orders-service-%{+yyyy.MM.dd}"
      when.contains:
        container.name: "orders-service"

    - index: "logs-payment-service-%{+yyyy.MM.dd}"
      when.contains:
        container.name: "payment-service"

# Logging
logging.level: info
logging.to_files: true
```

### Logging dans les microservices (NestJS)

```typescript
// logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // Important: JSON format pour Filebeat
        winston.format.errors({ stack: true }),
      ),
    }),
  ],
});

// Usage dans un service
import { Logger } from '@nestjs/common';

export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  async createArticle(data: CreateArticleDto) {
    this.logger.log({
      message: 'Creating article',
      userId: data.sellerId,
      title: data.title,
      price: data.price,
    });

    try {
      const article = await this.save(data);

      this.logger.log({
        message: 'Article created successfully',
        articleId: article.id,
        sellerId: data.sellerId,
      });

      return article;
    } catch (error) {
      this.logger.error({
        message: 'Failed to create article',
        error: error.message,
        stack: error.stack,
        userId: data.sellerId,
      });
      throw error;
    }
  }
}
```

---

## 📈 Monitoring - Prometheus + Grafana

### Architecture Prometheus

```
Microservices (/metrics endpoint)
        │
        ▼
  ┌────────────┐
  │ Prometheus │ ← Scrape metrics every 15s
  │  (Storage) │
  └─────┬──────┘
        │
        ▼
  ┌────────────┐
  │  Grafana   │ ← Dashboards + Alerting
  │(Visualization)
  └────────────┘
```

### Configuration Prometheus

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:8001']
    metrics_path: '/metrics'

  - job_name: 'articles-service'
    static_configs:
      - targets: ['articles-service:8002']

  - job_name: 'orders-service'
    static_configs:
      - targets: ['orders-service:8003']

  - job_name: 'payment-service'
    static_configs:
      - targets: ['payment-service:8006']

  - job_name: 'cart-service'
    static_configs:
      - targets: ['cart-service:8004']

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Exposition métriques (NestJS)

```typescript
// Install: npm install @willsoto/nestjs-prometheus prom-client

// app.module.ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
    }),
  ],
})
export class AppModule {}

// Custom metrics
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  incrementRequest(method: string, path: string, status: number) {
    this.requestCounter.inc({ method, path, status });
  }

  recordDuration(method: string, path: string, duration: number) {
    this.requestDuration.observe({ method, path }, duration);
  }
}
```

### Dashboards Grafana recommandés

1. **Service Health Dashboard**
   - Uptime par service
   - Request rate (req/s)
   - Error rate (%)
   - P50, P95, P99 latency

2. **Business Metrics Dashboard**
   - Orders created/hour
   - Revenue/day
   - Active users
   - Articles published

3. **Infrastructure Dashboard**
   - CPU usage per pod
   - Memory usage
   - Kafka lag
   - Database connections

---

## 🚢 Kubernetes Deployment

### Namespace + ConfigMap + Secrets

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: collector-shop

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: collector-shop
data:
  NODE_ENV: "production"
  KAFKA_BROKERS: "kafka-broker-1:9092,kafka-broker-2:9092"
  REDIS_HOST: "redis-cluster"
  ELASTICSEARCH_URL: "http://elasticsearch:9200"

---
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: collector-shop
type: Opaque
stringData:
  GOOGLE_CLIENT_ID: "your-client-id"
  GOOGLE_CLIENT_SECRET: "your-secret"
  STRIPE_SECRET_KEY: "sk_live_xxx"
  JWT_SECRET: "super-secret-key"
  DATABASE_PASSWORD: "secure-password"
```

### Deployment Example (Auth Service)

```yaml
# k8s/deployment-auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: collector-shop
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        version: v1
    spec:
      containers:
      - name: auth-service
        image: collector-shop/auth-service:1.0.0
        ports:
        - containerPort: 8001
          name: http
        - containerPort: 9001
          name: metrics
        env:
        - name: SERVICE_NAME
          value: "auth-service"
        - name: PORT
          value: "8001"
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service-auth.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: collector-shop
spec:
  selector:
    app: auth-service
  ports:
  - name: http
    port: 8001
    targetPort: 8001
  - name: metrics
    port: 9001
    targetPort: 9001
  type: ClusterIP

---
# k8s/hpa-auth.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: collector-shop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Ingress (API Gateway)

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  namespace: collector-shop
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.collector.shop
    secretName: api-tls-secret
  rules:
  - host: api.collector.shop
    http:
      paths:
      - path: /api/auth(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 8001

      - path: /api/articles(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: articles-service
            port:
              number: 8002

      - path: /api/orders(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: orders-service
            port:
              number: 8003

      - path: /api/payments(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: payment-service
            port:
              number: 8006
```

---

## 📡 Apache Kafka Configuration

### Kafka Cluster Setup (KRaft Mode - NO Zookeeper)

```yaml
# docker-compose.kafka.yml
version: '3.8'
services:
  # Kafka Broker 1 (KRaft Controller + Broker)
  kafka-broker-1:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-1
    container_name: kafka-broker-1
    ports:
      - "9092:9092"
      - "19092:19092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-1:29092,CONTROLLER://kafka-broker-1:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-1:29092,PLAINTEXT_HOST://localhost:9092'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-1-data:/tmp/kraft-combined-logs

  # Kafka Broker 2 (KRaft Controller + Broker)
  kafka-broker-2:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-2
    container_name: kafka-broker-2
    ports:
      - "9093:9093"
      - "19093:19093"
    environment:
      KAFKA_NODE_ID: 2
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-2:29092,CONTROLLER://kafka-broker-2:29093,PLAINTEXT_HOST://0.0.0.0:9093'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-2:29092,PLAINTEXT_HOST://localhost:9093'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-2-data:/tmp/kraft-combined-logs

  # Kafka Broker 3 (KRaft Controller + Broker)
  kafka-broker-3:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-3
    container_name: kafka-broker-3
    ports:
      - "9094:9094"
      - "19094:19094"
    environment:
      KAFKA_NODE_ID: 3
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-3:29092,CONTROLLER://kafka-broker-3:29093,PLAINTEXT_HOST://0.0.0.0:9094'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-3:29092,PLAINTEXT_HOST://localhost:9094'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 2
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-3-data:/tmp/kraft-combined-logs

  # Kafka UI (optionnel - pour visualiser les topics)
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: collector-shop
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-broker-1:29092,kafka-broker-2:29092,kafka-broker-3:29092
    depends_on:
      - kafka-broker-1
      - kafka-broker-2
      - kafka-broker-3

volumes:
  kafka-broker-1-data:
  kafka-broker-2-data:
  kafka-broker-3-data:
```

**Avantages Kafka KRaft (sans Zookeeper):**
- ✅ Architecture simplifiée (moins de composants)
- ✅ Déploiement plus rapide
- ✅ Moins de ressources CPU/mémoire
- ✅ Meilleure scalabilité (pas de limite Zookeeper)
- ✅ Métadonnées plus rapides
- ✅ Officiellement recommandé par Apache Kafka depuis 3.3+

### Kafka Topics

```bash
# Create topics
kafka-topics --create --topic user.events --partitions 3 --replication-factor 2
kafka-topics --create --topic article.events --partitions 5 --replication-factor 2
kafka-topics --create --topic order.events --partitions 3 --replication-factor 2
kafka-topics --create --topic payment.events --partitions 3 --replication-factor 2
kafka-topics --create --topic shop.events --partitions 2 --replication-factor 2
```

### Kafka Producer (NestJS)

```typescript
// kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: process.env.SERVICE_NAME,
      brokers: process.env.KAFKA_BROKERS.split(','),
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async publishEvent(topic: string, event: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.entityId,
          value: JSON.stringify(event),
          headers: {
            'event-type': event.eventType,
            'correlation-id': event.correlationId,
            'timestamp': new Date().toISOString(),
          },
        },
      ],
    });
  }
}
```

### Kafka Consumer (NestJS)

```typescript
// kafka-consumer.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: process.env.SERVICE_NAME,
      brokers: process.env.KAFKA_BROKERS.split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: `${process.env.SERVICE_NAME}-consumers`,
    });

    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['order.events', 'article.events'],
      fromBeginning: false
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());

        console.log({
          topic,
          partition,
          eventType: event.eventType,
          value: event,
        });

        // Route event to appropriate handler
        await this.handleEvent(topic, event);
      },
    });
  }

  private async handleEvent(topic: string, event: any) {
    switch (topic) {
      case 'order.events':
        await this.handleOrderEvent(event);
        break;
      case 'article.events':
        await this.handleArticleEvent(event);
        break;
    }
  }
}
```

---

## 🗄️ Redis Configuration

### Redis Cluster Setup

```yaml
# docker-compose.redis.yml
version: '3.8'
services:
  redis-cluster:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    environment:
      REDIS_PASSWORD: secure-password

volumes:
  redis-data:
```

### Redis Usage (Cart Service)

```typescript
// redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    await this.client.connect();
  }

  async getCart(userId: string) {
    const cart = await this.client.get(`cart:${userId}`);
    return cart ? JSON.parse(cart) : null;
  }

  async setCart(userId: string, cart: any) {
    await this.client.set(
      `cart:${userId}`,
      JSON.stringify(cart),
      { EX: 2592000 } // TTL 30 days
    );
  }

  async deleteCart(userId: string) {
    await this.client.del(`cart:${userId}`);
  }
}
```

---

## 🔄 Stratégie de Migration (Strangler Fig Pattern)

### Phase 1: Préparation (4 semaines)
```
Semaine 1-2: Infrastructure
- Setup Kubernetes cluster (Minikube/K3s local)
- Déployer Kafka cluster (3 brokers)
- Déployer ELK Stack (Elasticsearch + Filebeat + Kibana)
- Déployer Prometheus + Grafana

Semaine 3-4: Refactoring monolithe
- Identifier bounded contexts
- Extraire modules NestJS
- Setup Google OAuth credentials
- Tests integration Kafka
```

### Phase 2: Migration progressive (8-12 semaines)
```
Semaine 1-2: Auth Service
✓ Premier microservice isolé
✓ Google OAuth 2.0 implémenté
✓ JWT tokens
✓ Déployé en production avec fallback monolithe

Semaine 3-4: Payment Service
✓ Stripe isolé
✓ Webhook handling
✓ Kafka events (PAYMENT_COMPLETED)

Semaine 5-6: Articles Service
✓ CRUD articles
✓ Elasticsearch indexing
✓ Image upload S3

Semaine 7-8: Orders Service
✓ Order workflow
✓ Intégration Payment + Articles via Kafka
✓ Invoice generation

Semaine 9-10: Services secondaires
✓ Cart Service (Redis)
✓ Shops Service
✓ Notification Service

Semaine 11-12: Observabilité complète
✓ Dashboards Kibana (logs)
✓ Dashboards Grafana (metrics)
✓ Alerting rules
```

### Phase 3: Décommissionnement monolithe (4 semaines)
```
- Redirect progressif du trafic vers microservices
- Monitor performance + errors
- Rollback plan prêt
- Arrêt définitif monolithe
```

---

## 📦 Docker Compose ALL-IN-ONE

```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # === MICROSERVICES ===
  auth-service:
    build: ./services/auth-service
    ports:
      - "8001:8001"
    environment:
      DATABASE_URL: postgresql://user:password@postgres-auth:5432/auth
      KAFKA_BROKERS: kafka-broker-1:9092,kafka-broker-2:9092
      REDIS_URL: redis://redis-cluster:6379
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}

  articles-service:
    build: ./services/articles-service
    ports:
      - "8002:8002"
    environment:
      DATABASE_URL: postgresql://user:password@postgres-articles:5432/articles
      KAFKA_BROKERS: kafka-broker-1:9092,kafka-broker-2:9092
      ELASTICSEARCH_URL: http://elasticsearch:9200

  orders-service:
    build: ./services/orders-service
    ports:
      - "8003:8003"
    environment:
      DATABASE_URL: postgresql://user:password@postgres-orders:5432/orders
      KAFKA_BROKERS: kafka-broker-1:9092,kafka-broker-2:9092

  payment-service:
    build: ./services/payment-service
    ports:
      - "8006:8006"
    environment:
      DATABASE_URL: postgresql://user:password@postgres-payments:5432/payments
      KAFKA_BROKERS: kafka-broker-1:9092,kafka-broker-2:9092
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}

  cart-service:
    build: ./services/cart-service
    ports:
      - "8004:8004"
    environment:
      REDIS_URL: redis://redis-cluster:6379
      KAFKA_BROKERS: kafka-broker-1:9092,kafka-broker-2:9092

  # === DATABASES ===
  postgres-auth:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data

  postgres-articles:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: articles
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  postgres-orders:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  # === KAFKA CLUSTER (KRaft Mode - NO Zookeeper) ===
  kafka-broker-1:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-1
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-1:29092,CONTROLLER://kafka-broker-1:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-1:29092,PLAINTEXT_HOST://localhost:9092'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-1-data:/tmp/kraft-combined-logs

  kafka-broker-2:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-2
    ports:
      - "9093:9093"
    environment:
      KAFKA_NODE_ID: 2
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-2:29092,CONTROLLER://kafka-broker-2:29093,PLAINTEXT_HOST://0.0.0.0:9093'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-2:29092,PLAINTEXT_HOST://localhost:9093'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-2-data:/tmp/kraft-combined-logs

  kafka-broker-3:
    image: confluentinc/cp-kafka:7.6.0
    hostname: kafka-broker-3
    ports:
      - "9094:9094"
    environment:
      KAFKA_NODE_ID: 3
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-broker-1:29093,2@kafka-broker-2:29093,3@kafka-broker-3:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka-broker-3:29092,CONTROLLER://kafka-broker-3:29093,PLAINTEXT_HOST://0.0.0.0:9094'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka-broker-3:29092,PLAINTEXT_HOST://localhost:9094'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    volumes:
      - kafka-broker-3-data:/tmp/kraft-combined-logs

  # === ELK STACK ===
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch

  # === MONITORING ===
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana

  # === REDIS ===
  redis-cluster:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-auth-data:
  kafka-broker-1-data:
  kafka-broker-2-data:
  kafka-broker-3-data:
  elasticsearch-data:
  prometheus-data:
  grafana-data:
  redis-data:
```

---

## 📊 Comparaison Avant/Après

| Aspect | Monolithe (Avant) | Microservices (Après) |
|--------|-------------------|------------------------|
| **Architecture** | 1 app NestJS | 7 microservices |
| **Auth** | bcrypt + JWT local | Google OAuth 2.0 |
| **Communication** | Synchrone (HTTP) | Async (Kafka) + Sync (gRPC) |
| **Database** | PostgreSQL unique | Database-per-service |
| **Cache** | Aucun | Redis (cart, sessions) |
| **Logs** | Console | ELK (Elasticsearch + Filebeat + Kibana) |
| **Metrics** | Aucun | Prometheus + Grafana |
| **Orchestration** | Docker Compose | Kubernetes |
| **Scaling** | Vertical uniquement | Horizontal (HPA) |
| **Deployment** | All-or-nothing | Service indépendant |

---

## 🚀 Commandes de déploiement

### Local Development (Docker Compose)
```bash
# Start all services
docker-compose -f docker-compose.microservices.yml up -d

# Check logs
docker-compose logs -f auth-service

# Stop all
docker-compose down
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply secrets & config
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy services
kubectl apply -f k8s/deployment-auth-service.yaml
kubectl apply -f k8s/deployment-articles-service.yaml
kubectl apply -f k8s/deployment-orders-service.yaml

# Check pods
kubectl get pods -n collector-shop

# Check services
kubectl get svc -n collector-shop

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Scale service
kubectl scale deployment auth-service --replicas=5 -n collector-shop
```

---

## 📚 Documentation Complémentaire Recommandée

Pour une implémentation complète, créer ces documents supplémentaires:

1. **KAFKA_EVENTS.md** - Catalogue complet des événements Kafka
2. **API_DOCUMENTATION.md** - Swagger/OpenAPI pour chaque service
3. **DEPLOYMENT_GUIDE.md** - Guide déploiement production
4. **RUNBOOK.md** - Procédures incidents + troubleshooting
5. **SECURITY.md** - Audit sécurité + best practices

---

**Collector.shop - Architecture Microservices**
Version 2.0 - Migration avec Apache Kafka, Google OAuth, Kubernetes, Prometheus + Grafana, Redis, ELK
Décembre 2025
