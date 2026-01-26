# Cart Service

Microservice de gestion de panier d'achat utilisant Redis pour le stockage avec TTL de 7 jours.

## Port
- **8004**

## Technologies
- NestJS
- Redis (ioredis)
- Kafka
- JWT Authentication

## Structure Redis
- **Clé**: `cart:{userId}`
- **TTL**: 7 jours (604800 secondes)
- **Format**: JSON stringifié de l'objet Cart

## Endpoints

### GET /cart
Récupère le panier de l'utilisateur authentifié.

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "userId": "user-id",
  "items": [
    {
      "id": "item-id",
      "articleId": "article-id",
      "quantity": 2,
      "price": 29.99,
      "articleData": {
        "title": "Article Title",
        "image": "image-url",
        "sellerId": "seller-id"
      }
    }
  ],
  "totalPrice": 59.98,
  "updatedAt": "2025-12-19T10:00:00.000Z"
}
```

### POST /cart/add
Ajoute un article au panier.

**Headers**:
- `Authorization: Bearer <token>`

**Body**:
```json
{
  "articleId": "article-id",
  "quantity": 1,
  "price": 29.99,
  "articleData": {
    "title": "Article Title",
    "image": "image-url",
    "sellerId": "seller-id"
  }
}
```

### PUT /cart/items/:itemId
Met à jour la quantité d'un article dans le panier.

**Headers**:
- `Authorization: Bearer <token>`

**Body**:
```json
{
  "quantity": 3
}
```

### DELETE /cart/items/:itemId
Supprime un article du panier.

**Headers**:
- `Authorization: Bearer <token>`

### DELETE /cart/clear
Vide complètement le panier.

**Headers**:
- `Authorization: Bearer <token>`

## Événements Kafka

### Topic: `cart.events`

**CART_ITEM_ADDED**:
```json
{
  "eventType": "CART_ITEM_ADDED",
  "userId": "user-id",
  "articleId": "article-id",
  "quantity": 1,
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

**CART_ITEM_REMOVED**:
```json
{
  "eventType": "CART_ITEM_REMOVED",
  "userId": "user-id",
  "articleId": "article-id",
  "itemId": "item-id",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

**CART_CLEARED**:
```json
{
  "eventType": "CART_CLEARED",
  "userId": "user-id",
  "timestamp": "2025-12-19T10:00:00.000Z"
}
```

## Variables d'environnement

Voir `.env.example` pour la configuration complète.

## Installation

```bash
npm install
```

## Démarrage

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Docker

```bash
docker build -t cart-service .
docker run -p 8004:8004 cart-service
```
