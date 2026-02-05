\# CI/CD – Collector-Shop



Ce dépôt utilise GitHub Actions pour exécuter une CI sur :

\- Frontend (Next.js)

\- Microservices (Node/Nest)

\- Build d’images Docker (front + back représentatif)

\- Scan vulnérabilités (Trivy)

\- Analyse qualité (SonarQube sur VM)



\## 1) Jobs exécutés



\### Frontend

\- `npm ci`

\- `npm run lint --if-present`

\- `npm run typecheck --if-present`

\- `npm test --if-present -- --ci`

\- `npm run build --if-present`



> La variable `NEXT\_PUBLIC\_API\_URL` est fournie dans la CI pour permettre le build.



\### Microservices

Boucle automatique sur `microservices/\*` :

\- si `package.json` existe → `npm ci`, lint/typecheck/test (si scripts présents)



\### Docker + Trivy

\- Build image frontend via `frontend/Dockerfile`

\- Build image backend représentative basée sur `auth-service`

\- Scan Trivy sur les 2 images (HIGH/CRITICAL)



\### SonarQube (VM)

Analyse du code via `SonarSource/sonarqube-scan-action`.

Le job Sonar est \*\*optionnel\*\* et ne s’exécute que si les secrets sont configurés.



\## 2) Secrets requis (GitHub)



\### SonarQube (VM) – requis uniquement si on veut activer le job Sonar

Ajouter dans GitHub → Settings → Secrets and variables → Actions :

\- `SONAR\_HOST\_URL` : URL de la VM SonarQube (ex: http://IP:9000)

\- `SONAR\_TOKEN` : valeur

\- `SONAR\_PROJECT\_KEY` : valeur



\## 3) Exécution locale (optionnel)

Frontend :

\- `cd frontend`

\- `npm ci`

\- `npm run build`



Microservice (ex: auth-service) :

\- `cd microservices/auth-service`

\- `npm ci`

\- `npm test`



Docker :

\- `docker build -t collector-front -f frontend/Dockerfile frontend`

\- `docker build -t collector-back -f microservices/auth-service/Dockerfile microservices/auth-service`



