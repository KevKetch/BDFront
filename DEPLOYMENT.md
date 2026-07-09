# Guide de Déploiement - Plateforme Scolaire

Ce guide explique comment déployer et exécuter la plateforme sur n'importe quel système.

## Prérequis

- **Node.js** v16+ (télécharger depuis [nodejs.org](https://nodejs.org))
- **npm** (inclus avec Node.js)
- Un navigateur moderne
- **Linux/Mac/Windows** - Compatible multi-plateforme

## Structure du Projet

```
.
├── src/                    # Code source React (Frontend)
├── server/                 # Code du serveur Express (Backend)
├── .env                    # Variables d'environnement (Frontend)
├── server/.env             # Variables d'environnement (Backend)
└── start-app.sh            # Script de démarrage rapide
```

## Installation

### 1. Cloner/Télécharger le projet

```bash
cd /chemin/vers/Projet_BD
```

### 2. Installer les dépendances

**Frontend :**
```bash
npm install
```

**Backend :**
```bash
cd server
npm install
cd ..
```

Ou installez les deux en même temps avec :
```bash
npm install && cd server && npm install && cd ..
```

## Configuration de l'Environnement

Les fichiers `.env` sont prêts à l'emploi avec les configurations par défaut :

**Frontend (.env) :**
```
REACT_APP_API_URL=http://localhost:3001/api
```

**Backend (server/.env) :**
```
PORT=3001
NODE_ENV=development
```

### Personnaliser pour le Déploiement

Si vous déployez en ligne, modifiez les fichiers `.env` :

**Frontend (.env pour production) :**
```
REACT_APP_API_URL=https://votre-domaine.com/api
```

**Backend (server/.env pour production) :**
```
PORT=3001
NODE_ENV=production
```

## Démarrage Local

### Option 1 : Script automatique (Linux/Mac/WSL)

```bash
bash start-app.sh
```

Cela démarre automatiquement :
- ✅ Le serveur backend sur http://localhost:3001
- ✅ Le frontend sur http://localhost:5173

### Option 2 : Démarrage manuel

**Terminal 1 - Backend :**
```bash
cd server
npm start
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

Puis ouvrez votre navigateur à http://localhost:5173

### Option 3 : Utiliser npm scripts

```bash
npm run server:dev    # Terminal 1
npm run dev           # Terminal 2
```

## Déploiement en Production

### 1. Build du Frontend

```bash
npm run build
```

Cela crée un dossier `dist/` prêt pour un serveur web (Nginx, Apache, etc.)

### 2. Configurer le Backend

Assurez-vous que votre backend utilise les bonnes variables d'environnement :

```bash
PORT=3001 NODE_ENV=production node server/server.js
```

### 3. Serveur Web (Nginx)

Exemple de configuration pour servir le frontend build :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /chemin/vers/Projet_BD/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Utiliser PM2 pour maintenir le serveur actif

```bash
npm install -g pm2

# Démarrer
pm2 start server/server.js --name "escola-backend"

# Sauvegarder la configuration
pm2 save

# Redémarrer au boot
pm2 startup
```

## Vérification du Déploiement

1. **Frontend disponible** : http://votre-domaine.com
2. **API accessible** : http://votre-domaine.com/api ou http://votre-domaine.com:3001/api
3. **Pas de port codé en dur** : Toutes les URLs utilisent les variables d'environnement

## Problèmes Courants

### Port 3001 déjà utilisé

```bash
# Changer le port
PORT=3002 npm run server
```

Puis mettre à jour `.env` :
```
REACT_APP_API_URL=http://localhost:3002/api
```

### CORS errors

Vérifiez que `CORS_ORIGIN` dans `server/.env` est correctement configuré :

```
CORS_ORIGIN=*  # Pour développement
CORS_ORIGIN=https://votre-domaine.com  # Pour production
```

### Frontend ne se connecte pas à l'API

1. Vérifiez que `REACT_APP_API_URL` dans `.env` est correct
2. Vérifiez que le backend tourne sur le bon port
3. Vérifiez les logs du navigateur (F12 → Console)

## Variables d'Environnement Disponibles

| Variable | Défaut | Description |
|----------|--------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3001/api` | URL de l'API backend |
| `PORT` | `3001` | Port du serveur backend |
| `NODE_ENV` | `development` | Environnement d'exécution |
| `CORS_ORIGIN` | `*` | Origine CORS autorisée |

## Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Vérifiez la console du navigateur (F12)
3. Assurez-vous que tous les fichiers `.env` sont à jour

---

**Dernière mise à jour** : 2026-06-02
