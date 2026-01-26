# Exemples d'utilisation de l'API Orders Service

## Configuration de base

**Base URL**: `http://localhost:8003`

**Headers requis pour les endpoints authentifiés**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 1. Health Check

### GET /health

**Description**: Vérifier que le service est en ligne

**Authentification**: Non requise

```bash
curl http://localhost:8003/health
```

**Réponse**:
```json
{
  "status": "ok",
  "service": "orders-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Créer une commande

### POST /orders

**Description**: Créer une nouvelle commande à partir du panier

**Authentification**: Requise

```bash
curl -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "card",
    "shippingAddress": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France",
      "phone": "+33612345678"
    },
    "items": [
      {
        "articleId": "550e8400-e29b-41d4-a716-446655440001",
        "sellerId": "550e8400-e29b-41d4-a716-446655440002",
        "shopId": "550e8400-e29b-41d4-a716-446655440003",
        "quantity": 1,
        "price": 99.99,
        "shippingCost": 5.00,
        "articleData": {
          "title": "Figurine Dragon Ball Z Goku SSJ",
          "description": "Figurine de collection en parfait état",
          "images": ["https://example.com/image1.jpg"],
          "condition": "like_new"
        }
      },
      {
        "articleId": "550e8400-e29b-41d4-a716-446655440004",
        "sellerId": "550e8400-e29b-41d4-a716-446655440002",
        "quantity": 2,
        "price": 49.99,
        "shippingCost": 3.00,
        "articleData": {
          "title": "Manga One Piece Tome 1",
          "description": "Premier tome en très bon état",
          "images": ["https://example.com/image2.jpg"],
          "condition": "very_good"
        }
      }
    ],
    "notes": "Merci de bien emballer les articles fragiles"
  }'
```

**Réponse**:
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440005",
    "buyerId": "550e8400-e29b-41d4-a716-446655440006",
    "status": "pending",
    "paymentMethod": "card",
    "totalPrice": "205.97",
    "shippingCost": "11.00",
    "shippingAddress": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France",
      "phone": "+33612345678"
    },
    "notes": "Merci de bien emballer les articles fragiles",
    "stripeSessionId": null,
    "paidAt": null,
    "shippedAt": null,
    "deliveredAt": null,
    "items": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440007",
        "orderId": "650e8400-e29b-41d4-a716-446655440005",
        "articleId": "550e8400-e29b-41d4-a716-446655440001",
        "sellerId": "550e8400-e29b-41d4-a716-446655440002",
        "shopId": "550e8400-e29b-41d4-a716-446655440003",
        "quantity": 1,
        "price": "99.99",
        "shippingCost": "5.00",
        "articleData": {
          "title": "Figurine Dragon Ball Z Goku SSJ",
          "description": "Figurine de collection en parfait état",
          "images": ["https://example.com/image1.jpg"],
          "condition": "like_new"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "750e8400-e29b-41d4-a716-446655440008",
        "orderId": "650e8400-e29b-41d4-a716-446655440005",
        "articleId": "550e8400-e29b-41d4-a716-446655440004",
        "sellerId": "550e8400-e29b-41d4-a716-446655440002",
        "quantity": 2,
        "price": "49.99",
        "shippingCost": "3.00",
        "articleData": {
          "title": "Manga One Piece Tome 1",
          "description": "Premier tome en très bon état",
          "images": ["https://example.com/image2.jpg"],
          "condition": "very_good"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Récupérer les commandes

### GET /orders

**Description**: Récupérer les commandes de l'utilisateur connecté

**Authentification**: Requise

### 3.1 Toutes mes commandes (acheteur)

```bash
curl "http://localhost:8003/orders?buyerId=550e8400-e29b-41d4-a716-446655440006&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.2 Commandes où je suis vendeur

```bash
curl "http://localhost:8003/orders?sellerId=550e8400-e29b-41d4-a716-446655440002&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.3 Filtrer par statut

```bash
curl "http://localhost:8003/orders?buyerId=550e8400-e29b-41d4-a716-446655440006&status=paid&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3.4 Recherche avec tri

```bash
curl "http://localhost:8003/orders?search=Dragon&sortBy=createdAt&sortOrder=DESC&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Réponse**:
```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440005",
      "buyerId": "550e8400-e29b-41d4-a716-446655440006",
      "status": "pending",
      "paymentMethod": "card",
      "totalPrice": "205.97",
      "shippingCost": "11.00",
      "shippingAddress": { /* ... */ },
      "notes": "...",
      "items": [ /* ... */ ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

## 4. Récupérer une commande par ID

### GET /orders/:id

**Description**: Récupérer les détails d'une commande spécifique

**Authentification**: Requise

```bash
curl http://localhost:8003/orders/650e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Réponse**:
```json
{
  "message": "Order retrieved successfully",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440005",
    "buyerId": "550e8400-e29b-41d4-a716-446655440006",
    "status": "pending",
    "paymentMethod": "card",
    "totalPrice": "205.97",
    "shippingCost": "11.00",
    "shippingAddress": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France",
      "phone": "+33612345678"
    },
    "notes": "Merci de bien emballer les articles fragiles",
    "stripeSessionId": null,
    "paidAt": null,
    "shippedAt": null,
    "deliveredAt": null,
    "items": [ /* ... */ ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 5. Mettre à jour le statut d'une commande

### PUT /orders/:id/status

**Description**: Mettre à jour le statut d'une commande

**Authentification**: Requise

**Autorisation**: Acheteur ou vendeur de la commande

### 5.1 Marquer comme expédiée

```bash
curl -X PUT http://localhost:8003/orders/650e8400-e29b-41d4-a716-446655440005/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "FR123456789",
    "notes": "Expédié via Colissimo"
  }'
```

### 5.2 Marquer comme livrée

```bash
curl -X PUT http://localhost:8003/orders/650e8400-e29b-41d4-a716-446655440005/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "notes": "Livrée et signée par le client"
  }'
```

### 5.3 Annuler la commande

```bash
curl -X PUT http://localhost:8003/orders/650e8400-e29b-41d4-a716-446655440005/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "notes": "Annulée à la demande du client"
  }'
```

**Réponse**:
```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440005",
    "buyerId": "550e8400-e29b-41d4-a716-446655440006",
    "status": "shipped",
    "paymentMethod": "card",
    "totalPrice": "205.97",
    "shippingCost": "11.00",
    "shippingAddress": { /* ... */ },
    "notes": "Expédié via Colissimo",
    "paidAt": "2024-01-15T10:35:00.000Z",
    "shippedAt": "2024-01-15T11:00:00.000Z",
    "deliveredAt": null,
    "items": [ /* ... */ ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## 6. Générer l'URL de paiement

### POST /orders/:id/checkout

**Description**: Générer l'URL de checkout Stripe (placeholder actuellement)

**Authentification**: Requise

**Autorisation**: Acheteur uniquement

```bash
curl -X POST http://localhost:8003/orders/650e8400-e29b-41d4-a716-446655440005/checkout \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Réponse**:
```json
{
  "message": "Checkout URL generated",
  "data": {
    "checkoutUrl": "http://localhost:3000/checkout/650e8400-e29b-41d4-a716-446655440005"
  }
}
```

**Note**: Cette fonctionnalité est un placeholder. L'intégration complète avec Stripe nécessite:
1. Créer une session de checkout Stripe
2. Stocker stripeSessionId dans la commande
3. Configurer un webhook pour écouter les événements de paiement
4. Retourner l'URL de la session Stripe

---

## Statuts de commande

| Statut | Description | Transitions possibles |
|--------|-------------|----------------------|
| `pending` | En attente de paiement | ’ `paid`, `cancelled` |
| `paid` | Payée | ’ `shipped`, `cancelled` |
| `shipped` | Expédiée | ’ `delivered` |
| `delivered` | Livrée | (final) |
| `cancelled` | Annulée | (final) |

---

## Méthodes de paiement

| Valeur | Description |
|--------|-------------|
| `card` | Carte bancaire |
| `paypal` | PayPal |
| `bank_transfer` | Virement bancaire |

---

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token JWT manquant ou invalide |
| 403 | Forbidden | Non autorisé à effectuer cette action |
| 404 | Not Found | Commande introuvable |
| 500 | Internal Server Error | Erreur serveur |

---

## Événements Kafka

### Événements publiés sur order.events

#### ORDER_CREATED
```json
{
  "eventType": "ORDER_CREATED",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "buyerId": "550e8400-e29b-41d4-a716-446655440006",
  "totalPrice": "205.97",
  "items": [ /* ... */ ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### ORDER_PAID
```json
{
  "eventType": "ORDER_PAID",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "buyerId": "550e8400-e29b-41d4-a716-446655440006",
  "totalPrice": "205.97",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

#### ORDER_SHIPPED
```json
{
  "eventType": "ORDER_SHIPPED",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "buyerId": "550e8400-e29b-41d4-a716-446655440006",
  "oldStatus": "paid",
  "newStatus": "shipped",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

#### ORDER_DELIVERED
```json
{
  "eventType": "ORDER_DELIVERED",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "buyerId": "550e8400-e29b-41d4-a716-446655440006",
  "oldStatus": "shipped",
  "newStatus": "delivered",
  "timestamp": "2024-01-16T10:00:00.000Z"
}
```

#### ORDER_CANCELLED
```json
{
  "eventType": "ORDER_CANCELLED",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "buyerId": "550e8400-e29b-41d4-a716-446655440006",
  "oldStatus": "pending",
  "newStatus": "cancelled",
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

### Événements consommés depuis payment.events

#### PAYMENT_SUCCESS
```json
{
  "eventType": "PAYMENT_SUCCESS",
  "orderId": "650e8400-e29b-41d4-a716-446655440005",
  "paymentId": "pay_123456789",
  "amount": "205.97",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Action**: La commande est automatiquement marquée comme `paid` et un événement `ORDER_PAID` est publié.

---

## Scénarios d'utilisation

### Scénario 1: Achat simple

1. Client crée une commande via POST /orders
2. Status: PENDING
3. Client effectue le paiement (checkout)
4. Kafka reçoit PAYMENT_SUCCESS
5. Status: PAID (automatique)
6. Vendeur expédie la commande
7. Status: SHIPPED (via PUT /orders/:id/status)
8. Client reçoit la commande
9. Status: DELIVERED (via PUT /orders/:id/status)

### Scénario 2: Annulation

1. Client crée une commande via POST /orders
2. Status: PENDING
3. Client change d'avis
4. Annulation via PUT /orders/:id/status
5. Status: CANCELLED

### Scénario 3: Commande multi-vendeurs

1. Client ajoute des articles de plusieurs vendeurs au panier
2. Crée une commande unique
3. Chaque OrderItem contient le sellerId
4. Chaque vendeur peut voir ses items via GET /orders?sellerId=xxx
5. Chaque vendeur expédie ses articles individuellement

---

## Tests avec Postman

1. Importer les exemples ci-dessus dans Postman
2. Configurer une variable d'environnement `JWT_TOKEN`
3. Tester les endpoints dans l'ordre des scénarios
4. Vérifier les réponses et les codes HTTP

---

## Notes importantes

- Tous les UUID doivent être des UUIDs v4 valides
- Les prix sont des decimals(10,2) stockés comme strings dans les réponses JSON
- Les timestamps sont au format ISO 8601
- L'authentification JWT est requise pour tous les endpoints sauf /health
- Les erreurs de validation retournent des messages détaillés
