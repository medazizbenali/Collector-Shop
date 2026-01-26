# Orders Service

Service de gestion des commandes pour Collector Shop.

## Port: 8003

## Base de données
- **PostgreSQL**: `orders_db`
- **Port externe**: 5440
- **Port interne**: 5432

## Fonctionnalités

### Entités
- **Order**: Commande principale
  - id, buyerId, status, paymentMethod, totalPrice, shippingCost
  - shippingAddress (JSON), notes, stripeSessionId
  - paidAt, shippedAt, deliveredAt, createdAt, updatedAt

- **OrderItem**: Articles dans une commande
  - id, orderId, articleId, sellerId, shopId
  - quantity, price, shippingCost, articleData (JSON)

### Status de commande
- PENDING: En attente de paiement
- PAID: Payée
- SHIPPED: Expédiée
- DELIVERED: Livrée
- CANCELLED: Annulée

### Méthodes de paiement
- CARD: Carte bancaire
- PAYPAL: PayPal
- BANK_TRANSFER: Virement bancaire

## API Endpoints

### POST /orders
Créer une nouvelle commande (authentification requise)
```json
{
  "paymentMethod": "card",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "phone": "+33612345678"
  },
  "items": [
    {
      "articleId": "uuid",
      "sellerId": "uuid",
      "quantity": 1,
      "price": 99.99,
      "shippingCost": 5.00,
      "articleData": {
        "title": "Article title",
        "description": "Description",
        "images": ["url"],
        "condition": "new"
      }
    }
  ],
  "notes": "Optional notes"
}
```

### GET /orders
Récupérer les commandes (authentification requise)
Query params: buyerId, sellerId, status, search, page, limit, sortBy, sortOrder

### GET /orders/:id
Récupérer une commande par ID (authentification requise)

### PUT /orders/:id/status
Mettre à jour le statut d'une commande (authentification requise)
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123",
  "notes": "Optional notes"
}
```

### POST /orders/:id/checkout
Générer l'URL de paiement Stripe (authentification requise)

## Événements Kafka

### Topic: order.events

#### Événements publiés:
- ORDER_CREATED: Commande créée
- ORDER_PAID: Commande payée
- ORDER_SHIPPED: Commande expédiée
- ORDER_DELIVERED: Commande livrée
- ORDER_CANCELLED: Commande annulée
- ORDER_STATUS_UPDATED: Statut mis à jour

#### Événements consommés:
- Topic: payment.events
  - PAYMENT_SUCCESS: Marque la commande comme PAID

## Installation

```bash
npm install
```

## Développement

```bash
npm run start:dev
```

## Production

```bash
npm run build
npm run start:prod
```

## Docker

```bash
docker build -t orders-service .
docker run -p 8003:8003 --env-file .env orders-service
```

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Intégration Stripe

Le service est préparé pour l'intégration Stripe (placeholder actuellement).
Les variables STRIPE_* doivent être configurées pour activer les paiements réels.
