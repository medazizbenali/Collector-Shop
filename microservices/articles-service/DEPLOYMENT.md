# Déploiement Articles Service

## Docker Compose

Le service est configuré dans `docker-compose.microservices.yml`.

### Configuration

```yaml
articles-service:
  build:
    context: ./microservices/articles-service
    dockerfile: Dockerfile
  container_name: articles-service
  ports:
    - "8002:8002"
  environment:
    PORT: 8002
    SERVICE_NAME: articles-service
    DATABASE_HOST: postgres-articles
    DATABASE_PORT: 5432
    DATABASE_USER: articles_user
    DATABASE_PASSWORD: articles_password
    DATABASE_NAME: articles_db
    KAFKA_BROKERS: kafka-broker-1:29092,kafka-broker-2:29092,kafka-broker-3:29092
    JWT_SECRET: ${JWT_SECRET}
  depends_on:
    - postgres-articles
    - kafka-broker-1
  networks:
    - microservices-network
```

### Base de données

PostgreSQL dédié sur port **5438** (localhost) / **5432** (container):

```yaml
postgres-articles:
  image: postgres:15-alpine
  container_name: postgres-articles
  environment:
    POSTGRES_DB: articles_db
    POSTGRES_USER: articles_user
    POSTGRES_PASSWORD: articles_password
  ports:
    - "5438:5432"
  volumes:
    - postgres-articles-data:/var/lib/postgresql/data
```

## Commandes Docker

### Démarrer uniquement la base de données
```bash
docker-compose -f docker-compose.microservices.yml up -d postgres-articles
```

### Démarrer le service complet
```bash
docker-compose -f docker-compose.microservices.yml up -d articles-service
```

### Voir les logs
```bash
docker-compose -f docker-compose.microservices.yml logs -f articles-service
```

### Redémarrer le service
```bash
docker-compose -f docker-compose.microservices.yml restart articles-service
```

### Rebuild après changements
```bash
docker-compose -f docker-compose.microservices.yml up -d --build articles-service
```

## Développement local

### Prérequis
1. PostgreSQL sur port 5438
2. Kafka brokers sur ports 9092, 9093, 9094
3. Node.js 20+

### Lancement
```bash
cd microservices/articles-service
npm install
npm run start:dev
```

### Seed initial
```bash
node seed-categories.js
```

## Variables d'environnement

### Requises
- `PORT`: Port du service (8002)
- `DATABASE_HOST`: Hôte PostgreSQL
- `DATABASE_PORT`: Port PostgreSQL (5438 en local, 5432 en container)
- `DATABASE_USER`: articles_user
- `DATABASE_PASSWORD`: articles_password
- `DATABASE_NAME`: articles_db
- `KAFKA_BROKERS`: Liste des brokers Kafka
- `JWT_SECRET`: Secret partagé avec Auth Service

### Optionnelles
- `SERVICE_NAME`: articles-service
- `NODE_ENV`: development/production
- `FRONTEND_URL`: URL du frontend

## Healthcheck

```bash
curl http://localhost:8002/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "service": "articles-service",
  "timestamp": "2025-12-19T08:00:00.000Z"
}
```

## Connexions aux services

- **Auth Service**: http://auth-service:8001 (JWT validation)
- **Kafka**: kafka-broker-1:29092, kafka-broker-2:29092, kafka-broker-3:29092
- **PostgreSQL**: postgres-articles:5432

## Troubleshooting

### Port déjà utilisé
Si le port 5438 ou 8002 est déjà utilisé:
```bash
# Windows
netstat -ano | findstr :8002
netstat -ano | findstr :5438

# Linux/Mac
lsof -i :8002
lsof -i :5438
```

### Erreur de connexion à la base de données
1. Vérifier que postgres-articles est démarré
2. Vérifier les credentials dans .env
3. Vérifier le port (5438 en local, 5432 en container)

### Erreur Kafka
1. Vérifier que les 3 brokers sont démarrés
2. Vérifier KAFKA_BROKERS dans .env
3. Le service démarre même si Kafka n'est pas disponible (logs d'erreur seulement)

### Build échoue
```bash
# Nettoyer et rebuilder
rm -rf node_modules dist
npm install
npm run build
```

## Migration vers production

1. **Désactiver synchronize**: Mettre `synchronize: false` dans TypeORM config
2. **Variables d'environnement**: Utiliser des secrets pour JWT_SECRET, DATABASE_PASSWORD
3. **HTTPS**: Configurer SSL/TLS
4. **Rate limiting**: Ajouter rate limiting sur les endpoints publics
5. **Monitoring**: Ajouter Prometheus metrics
6. **Logging**: Configurer logging centralisé (ELK)
