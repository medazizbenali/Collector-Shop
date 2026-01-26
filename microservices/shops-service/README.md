# Shops Service

Service de gestion des boutiques pour la plateforme Collector Shop.

## Description

Le Shops Service gère toutes les opérations liées aux boutiques :
- Création et gestion des boutiques
- Vérification des boutiques par les administrateurs
- Gestion des statistiques (ventes, revenus, notes)
- Activation/désactivation des boutiques
- Recherche et filtrage des boutiques

## Technologies

- **Framework**: NestJS
- **Base de données**: PostgreSQL (Port 5439)
- **Message Broker**: Kafka
- **Authentification**: JWT (Passport)
- **Validation**: class-validator

## Port

**8005** (configurable via `PORT` dans .env)

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env` et configurer les variables :

```bash
cp .env.example .env
```

Variables principales :
- `PORT`: Port du service (8005)
- `DATABASE_HOST`: Hôte PostgreSQL
- `DATABASE_PORT`: Port PostgreSQL (5439)
- `DATABASE_NAME`: shops_db
- `JWT_SECRET`: Secret JWT (doit correspondre à l'Auth Service)
- `KAFKA_BROKERS`: Liste des brokers Kafka

## Démarrage

### Mode développement
```bash
npm run start:dev
```

### Mode production
```bash
npm run build
npm run start:prod
```

### Avec Docker
```bash
docker build -t shops-service .
docker run -p 8005:8005 --env-file .env shops-service
```

## Endpoints

### Boutiques

#### `POST /shops`
Créer une nouvelle boutique (authentification requise)

**Body:**
```json
{
  "name": "Ma Boutique",
  "description": "Description de ma boutique",
  "contactEmail": "contact@shop.com",
  "address": "123 Rue Example",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

#### `GET /shops`
Récupérer toutes les boutiques avec filtres

**Query params:**
- `search`: Recherche par nom/description
- `city`: Filtrer par ville
- `country`: Filtrer par pays
- `isActive`: Filtrer par statut actif
- `isVerified`: Filtrer par statut vérifié
- `ownerId`: Filtrer par propriétaire
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre par page (défaut: 20)
- `sortBy`: Champ de tri (défaut: createdAt)
- `sortOrder`: Ordre de tri (ASC/DESC, défaut: DESC)

#### `GET /shops/:id`
Récupérer une boutique par ID

#### `GET /shops/slug/:slug`
Récupérer une boutique par slug

#### `PATCH /shops/:id`
Mettre à jour une boutique (authentification requise, propriétaire uniquement)

#### `DELETE /shops/:id`
Supprimer une boutique (authentification requise, propriétaire uniquement)

#### `POST /shops/:id/verify`
Vérifier une boutique (authentification requise, admin uniquement)

#### `POST /shops/:id/activate`
Activer une boutique (authentification requise, propriétaire uniquement)

#### `POST /shops/:id/deactivate`
Désactiver une boutique (authentification requise, propriétaire uniquement)

#### `GET /shops/:id/stats`
Récupérer les statistiques d'une boutique

### Santé

#### `GET /health`
Vérifier l'état du service

## Événements Kafka

### Topic: `shop.events`

#### Événements émis:
- `SHOP_CREATED`: Boutique créée
- `SHOP_UPDATED`: Boutique mise à jour
- `SHOP_VERIFIED`: Boutique vérifiée
- `SHOP_ACTIVATED`: Boutique activée
- `SHOP_DEACTIVATED`: Boutique désactivée
- `SHOP_DELETED`: Boutique supprimée

## Base de données

### Entité Shop

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| name | String | Nom de la boutique |
| slug | String | Slug unique pour URL |
| description | Text | Description |
| logoUrl | String | URL du logo |
| bannerUrl | String | URL de la bannière |
| isActive | Boolean | Statut actif |
| isVerified | Boolean | Statut vérifié |
| contactEmail | String | Email de contact |
| contactPhone | String | Téléphone |
| website | String | Site web |
| address | Text | Adresse |
| city | String | Ville |
| postalCode | String | Code postal |
| country | String | Pays |
| returnPolicy | Text | Politique de retour |
| shippingPolicy | Text | Politique d'expédition |
| totalSales | Integer | Nombre total de ventes |
| totalRevenue | Decimal | Revenu total |
| averageRating | Decimal | Note moyenne |
| reviewCount | Integer | Nombre d'avis |
| ownerId | UUID | ID du propriétaire |
| createdAt | Timestamp | Date de création |
| updatedAt | Timestamp | Date de mise à jour |

## Logique métier

### Création d'une boutique
1. Génération automatique d'un slug unique à partir du nom
2. Vérification qu'un utilisateur n'a qu'une seule boutique
3. Initialisation des statistiques à 0
4. Émission d'un événement SHOP_CREATED

### Vérification
- Seuls les administrateurs peuvent vérifier une boutique
- Émission d'un événement SHOP_VERIFIED

### Statistiques
- `updateStats()`: Mise à jour des ventes et revenus
- `updateRating()`: Calcul de la note moyenne

## Sécurité

- **JWT Guard**: Protection des routes sensibles
- **Ownership Check**: Vérification que l'utilisateur est propriétaire
- **Validation**: Validation complète des DTOs avec class-validator

## Structure du projet

```
src/
├── shops/
│   ├── dto/
│   │   ├── create-shop.dto.ts
│   │   ├── update-shop.dto.ts
│   │   └── filter-shop.dto.ts
│   ├── entities/
│   │   └── shop.entity.ts
│   ├── shops.controller.ts
│   ├── shops.service.ts
│   └── shops.module.ts
├── auth/
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── kafka/
│   └── kafka.service.ts
├── app.module.ts
├── main.ts
└── health.controller.ts
```

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Développement

### Ajouter une nouvelle fonctionnalité
1. Ajouter la méthode dans `shops.service.ts`
2. Ajouter l'endpoint dans `shops.controller.ts`
3. Émettre un événement Kafka si nécessaire
4. Mettre à jour la documentation

### Debug
- Logs détaillés pour Kafka
- Gestion des erreurs avec NestJS Exception Filters
- Health check endpoint pour monitoring

## Contribution

Suivre les standards NestJS et TypeScript du projet.
