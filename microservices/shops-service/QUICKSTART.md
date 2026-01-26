# Quick Start - Shops Service

## Installation rapide

### 1. Installer les dépendances
```bash
cd microservices/shops-service
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres:
```env
PORT=8005
DATABASE_HOST=localhost
DATABASE_PORT=5439
DATABASE_NAME=shops_db
DATABASE_USER=shops_user
DATABASE_PASSWORD=shops_password
JWT_SECRET=your-secret-key
KAFKA_BROKERS=localhost:9092,localhost:9093,localhost:9094
```

### 3. Préparer la base de données PostgreSQL
```sql
CREATE DATABASE shops_db;
CREATE USER shops_user WITH PASSWORD 'shops_password';
GRANT ALL PRIVILEGES ON DATABASE shops_db TO shops_user;
```

### 4. Démarrer le service
```bash
# Mode développement avec hot-reload
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le service démarre sur **http://localhost:8005**

## Test rapide

### Health Check
```bash
curl http://localhost:8005/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "service": "shops-service",
  "timestamp": "2025-12-19T..."
}
```

### Créer une boutique (nécessite un JWT token)
```bash
curl -X POST http://localhost:8005/shops \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ma Super Boutique",
    "description": "Boutique spécialisée dans les objets de collection",
    "contactEmail": "contact@masuperboutique.com",
    "address": "123 Rue du Commerce",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }'
```

### Lister toutes les boutiques
```bash
curl http://localhost:8005/shops
```

### Rechercher des boutiques
```bash
# Par ville
curl "http://localhost:8005/shops?city=Paris"

# Par pays
curl "http://localhost:8005/shops?country=France"

# Recherche textuelle
curl "http://localhost:8005/shops?search=collection"

# Boutiques vérifiées uniquement
curl "http://localhost:8005/shops?isVerified=true"

# Avec pagination
curl "http://localhost:8005/shops?page=1&limit=10"
```

### Récupérer une boutique par slug
```bash
curl http://localhost:8005/shops/slug/ma-super-boutique
```

### Récupérer les statistiques d'une boutique
```bash
curl http://localhost:8005/shops/SHOP_UUID/stats
```

## Docker

### Build l'image
```bash
docker build -t shops-service .
```

### Run le container
```bash
docker run -p 8005:8005 --env-file .env shops-service
```

## Vérification de l'implémentation

### Checklist
- ✅ Port 8005 accessible
- ✅ Base de données shops_db connectée (port 5439)
- ✅ Kafka connecté (brokers 9092-9094)
- ✅ Health endpoint répond
- ✅ Endpoints CRUD fonctionnels
- ✅ JWT authentication active
- ✅ Événements Kafka émis

### Logs attendus au démarrage
```
✅ Kafka Producer connecté
🚀 Shops Service démarré sur le port 8005
```

## Endpoints disponibles

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | /health | Non | Health check |
| GET | /shops | Non | Liste des boutiques |
| GET | /shops/:id | Non | Détails d'une boutique |
| GET | /shops/slug/:slug | Non | Boutique par slug |
| GET | /shops/:id/stats | Non | Statistiques |
| POST | /shops | JWT | Créer une boutique |
| PATCH | /shops/:id | JWT | Modifier une boutique |
| DELETE | /shops/:id | JWT | Supprimer une boutique |
| POST | /shops/:id/verify | JWT | Vérifier (admin) |
| POST | /shops/:id/activate | JWT | Activer |
| POST | /shops/:id/deactivate | JWT | Désactiver |

## Troubleshooting

### Le service ne démarre pas
- Vérifier que le port 8005 est libre
- Vérifier la connexion à PostgreSQL (port 5439)
- Vérifier les variables d'environnement

### Erreur de connexion à la base de données
```bash
# Tester la connexion PostgreSQL
psql -h localhost -p 5439 -U shops_user -d shops_db
```

### Erreur Kafka
- Vérifier que Kafka est démarré
- Vérifier les brokers dans KAFKA_BROKERS

### Erreur JWT
- Vérifier que JWT_SECRET correspond à celui de l'Auth Service
- Vérifier le format du token: `Bearer <token>`

## Intégration avec d'autres services

### Articles Service
Les articles peuvent référencer une boutique via `shopId`

### Orders Service
Les commandes peuvent mettre à jour les statistiques de la boutique:
```typescript
// Après une vente
await shopsService.updateStats(shopId, 1, orderAmount);
```

### Reviews Service
Les avis peuvent mettre à jour la note de la boutique:
```typescript
// Après un nouvel avis
await shopsService.updateRating(shopId, rating);
```

## Prochaines étapes

1. Implémenter le RoleGuard pour la vérification admin
2. Ajouter des migrations TypeORM
3. Ajouter des tests unitaires et e2e
4. Configurer le monitoring (Prometheus/Grafana)
5. Ajouter la recherche full-text (Elasticsearch)
6. Implémenter le cache (Redis)

## Documentation complète

Pour plus de détails, consulter:
- `README.md` - Documentation complète
- `IMPLEMENTATION.md` - Détails de l'implémentation
