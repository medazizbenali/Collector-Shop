# Docker Compose Integration - Cart Service

## Ajout au docker-compose.yml

Ajouter ce service dans le fichier `docker-compose.yml` à la racine du projet:

```yaml
  cart-service:
    build: ./microservices/cart-service
    container_name: collector-cart-service
    ports:
      - "8004:8004"
    environment:
      - PORT=8004
      - SERVICE_NAME=cart-service
      - NODE_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - KAFKA_BROKERS=kafka1:9092,kafka2:9092,kafka3:9092
      - KAFKA_CLIENT_ID=cart-service
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - redis
      - kafka1
      - kafka2
      - kafka3
    networks:
      - collector-network
    restart: unless-stopped
```

## Notes importantes

### Redis
Le service utilise Redis qui doit déjà être configuré dans docker-compose.yml:
```yaml
  redis:
    image: redis:7-alpine
    container_name: collector-redis
    ports:
      - "6379:6379"
    networks:
      - collector-network
    volumes:
      - redis_data:/data
    restart: unless-stopped
```

### Kafka
Le service publie des événements sur le topic `cart.events`. Assurez-vous que Kafka est configuré dans docker-compose.yml.

### Réseau
Le service doit être sur le même réseau que:
- Redis (pour le stockage)
- Kafka (pour les événements)
- Auth Service (validation JWT partagée)

### Variables d'environnement partagées
- `JWT_SECRET`: Doit être identique à celui de l'Auth Service

## Ordre de démarrage recommandé

1. Redis
2. Kafka (kafka1, kafka2, kafka3, zookeeper)
3. Auth Service
4. Cart Service
5. Autres services

## Commandes Docker

### Build
```bash
cd microservices/cart-service
docker build -t cart-service .
```

### Run standalone
```bash
docker run -p 8004:8004 \
  -e REDIS_HOST=localhost \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret \
  -e KAFKA_BROKERS=localhost:9092 \
  cart-service
```

### Logs
```bash
docker logs -f collector-cart-service
```

### Restart
```bash
docker-compose restart cart-service
```

## Vérification du déploiement

### 1. Health Check
```bash
curl http://localhost:8004/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "cart-service",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

### 2. Vérifier la connexion Redis
Regarder les logs au démarrage:
```bash
docker logs collector-cart-service
```

Chercher:
- ✅ Redis connected
- ✅ Kafka Producer connected
- 🛒 Cart Service started on port 8004

### 3. Tester avec un token JWT
```bash
# Obtenir un token depuis Auth Service
TOKEN=$(curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Récupérer le panier
curl http://localhost:8004/cart \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

### Redis CLI
```bash
docker exec -it collector-redis redis-cli

# Voir toutes les clés de panier
KEYS cart:*

# Voir un panier spécifique
GET cart:user-id-here

# Voir le TTL d'un panier
TTL cart:user-id-here
```

### Kafka Consumer (debug)
```bash
docker exec -it collector-kafka1 kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic cart.events \
  --from-beginning
```

## Volumes recommandés

Ajouter dans docker-compose.yml:
```yaml
volumes:
  redis_data:
    driver: local
```

## Scaling

Pour scaler horizontalement:
```bash
docker-compose up -d --scale cart-service=3
```

Note: Avec Redis, plusieurs instances du Cart Service peuvent coexister sans problème car Redis gère la concurrence.
