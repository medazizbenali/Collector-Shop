# Cart Service - Quick Start Guide

## Prérequis

1. **Node.js** 20+ installé
2. **Redis** disponible sur `localhost:6379`
3. **Kafka** disponible sur `localhost:9092,9093,9094`
4. **Auth Service** en cours d'exécution (pour obtenir des tokens JWT)

## Installation

```bash
cd microservices/cart-service
npm install
```

## Configuration

1. Copier le fichier d'environnement:
```bash
cp .env.example .env
```

2. Modifier `.env` si nécessaire (les valeurs par défaut fonctionnent pour le développement local)

## Démarrage

### Mode Développement (avec hot-reload)
```bash
npm run start:dev
```

### Mode Production
```bash
npm run build
npm run start:prod
```

Le service démarre sur **http://localhost:8004**

## Vérification

### 1. Health Check
```bash
curl http://localhost:8004/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "service": "cart-service",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

### 2. Obtenir un token JWT

Depuis l'Auth Service (port 8001):
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

Copier le `access_token` de la réponse.

### 3. Tester les endpoints

#### Récupérer le panier (vide initialement)
```bash
curl http://localhost:8004/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Ajouter un article
```bash
curl -X POST http://localhost:8004/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "article-123",
    "quantity": 2,
    "price": 29.99,
    "articleData": {
      "title": "Vintage Comic Book",
      "image": "https://example.com/image.jpg",
      "sellerId": "seller-456"
    }
  }'
```

#### Récupérer le panier (avec l'article ajouté)
```bash
curl http://localhost:8004/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Réponse attendue:
```json
{
  "userId": "user-id",
  "items": [
    {
      "id": "generated-uuid",
      "articleId": "article-123",
      "quantity": 2,
      "price": 29.99,
      "articleData": {
        "title": "Vintage Comic Book",
        "image": "https://example.com/image.jpg",
        "sellerId": "seller-456"
      }
    }
  ],
  "totalPrice": 59.98,
  "updatedAt": "2025-12-19T10:30:00.000Z"
}
```

#### Mettre à jour la quantité
```bash
curl -X PUT http://localhost:8004/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

#### Supprimer un article
```bash
curl -X DELETE http://localhost:8004/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Vider le panier
```bash
curl -X DELETE http://localhost:8004/cart/clear \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Vérifier Redis

### Connexion à Redis
```bash
redis-cli
```

### Voir les paniers stockés
```redis
# Lister toutes les clés de panier
KEYS cart:*

# Voir un panier spécifique
GET cart:USER_ID

# Voir le TTL (temps restant avant expiration)
TTL cart:USER_ID
```

## Vérifier Kafka

### Voir les événements publiés

En mode développement, les logs du service affichent:
```
📤 Event published to cart.events: CART_ITEM_ADDED
📤 Event published to cart.events: CART_ITEM_REMOVED
📤 Event published to cart.events: CART_CLEARED
```

### Consumer Kafka (pour debug)
```bash
# Windows (avec Kafka installé localement)
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic cart.events --from-beginning

# Linux/Mac
kafka-console-consumer --bootstrap-server localhost:9092 --topic cart.events --from-beginning
```

## Utiliser avec VSCode REST Client

Le fichier `api-tests.http` contient des exemples de requêtes.

1. Installer l'extension **REST Client** dans VSCode
2. Ouvrir `api-tests.http`
3. Remplacer `YOUR_JWT_TOKEN_HERE` par un vrai token
4. Cliquer sur "Send Request" au-dessus de chaque requête

## Logs du service

Le service affiche:
```
✅ Redis connected
✅ Kafka Producer connected
🛒 Cart Service started on port 8004
```

En cas d'erreur:
```
❌ Redis error: [error details]
❌ Kafka connection error: [error details]
```

## Troubleshooting

### Erreur: Redis connection refused
```bash
# Vérifier que Redis est en cours d'exécution
redis-cli ping
# Doit retourner: PONG

# Si Redis n'est pas démarré (Windows avec Docker):
docker run -d -p 6379:6379 redis:7-alpine

# Ou avec docker-compose:
docker-compose up -d redis
```

### Erreur: Kafka connection error
```bash
# Vérifier que Kafka est en cours d'exécution
docker-compose ps | grep kafka

# Démarrer Kafka si nécessaire
docker-compose up -d kafka1 kafka2 kafka3 zookeeper
```

### Erreur: Unauthorized (401)
- Vérifier que le token JWT est valide
- Vérifier que `JWT_SECRET` est identique entre Auth Service et Cart Service
- Obtenir un nouveau token si le précédent a expiré (1h par défaut)

### Le panier ne persiste pas
- Vérifier que Redis stocke bien les données: `redis-cli KEYS cart:*`
- Vérifier que le TTL n'est pas expiré: `redis-cli TTL cart:USER_ID`
- Le TTL est de 7 jours (604800 secondes) et se renouvelle à chaque opération

## Docker

### Build
```bash
docker build -t cart-service .
```

### Run
```bash
docker run -p 8004:8004 \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret \
  -e KAFKA_BROKERS=host.docker.internal:9092 \
  cart-service
```

### Avec docker-compose
```bash
# Depuis la racine du projet
docker-compose up -d cart-service
```

## Prochaines étapes

1. Intégrer avec le frontend pour afficher le panier
2. Connecter avec Articles Service pour récupérer les détails des articles
3. Utiliser les événements Kafka pour synchroniser avec d'autres services
4. Implémenter Orders Service pour transformer le panier en commande

## Support

En cas de problème:
1. Vérifier les logs du service: `npm run start:dev` (mode verbose)
2. Vérifier Redis: `redis-cli ping`
3. Vérifier Kafka: `docker-compose logs kafka1`
4. Consulter `ARCHITECTURE.md` pour plus de détails
