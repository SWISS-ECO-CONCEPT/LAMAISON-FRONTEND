# LAMAISON Frontend - Application React

[![React Version](https://img.shields.io/badge/React-19.1+-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3+-646CFF)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1+-06B6D4)](https://tailwindcss.com/)

Le frontend de LAMAISON est une application web moderne construite avec React 19, TypeScript et Vite, offrant une expérience utilisateur exceptionnelle pour la plateforme immobilière avec des animations fluides et une interface responsive.

## Architecture & Design Patterns

### Architecture Composants
```
┌─────────────────────────────────────────────────────────────┐
│                 Presentation Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │   Pages     │ │ Components  │ │    Layouts    │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                State Management Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │   Context   │ │   Hooks     │ │   Services    │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │    API      │ │   Socket    │ │   Storage    │ │
│  │   Client    │ │   Client    │ │   (Local)    │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Implémentés
- **Component Composition** : Architecture modulaire et réutilisable
- **Custom Hooks** : Logique réutilisable et séparation des préoccupations
- **Context API** : Gestion d'état globale
- **Higher-Order Components** : Réutilisation de logique de composant
- **Render Props** : Partage de logique entre composants
- **Observer Pattern** : Réactivité aux changements de données

##  Stack Technique

### Core Framework
- **React 19.1** : Bibliothèque de composants UI
  - Concurrent Features
  - Server Components Ready
  - Automatic Batching
  - Suspense & Error Boundaries

### Build & Development
- **Vite 6.3** : Build tool ultra-rapide
  - HMR (Hot Module Replacement)
  - Optimized bundling
  - TypeScript support natif
  - Plugin ecosystem

### Styling & UI
- **TailwindCSS 4.1** : Utility-first CSS framework
  - JIT compilation
  - Dark mode support
  - Responsive design
  - Custom components
- **Framer Motion 12.23** : Animations fluides et gestuelles
- **Lucide React 0.539** : Icon library moderne

### State Management & Data Flow
- **React Context API** : Gestion d'état globale
- **Custom Hooks** : Logique réutilisable
- **React Query** : Server state management (prévu)
- **Formik 2.4** : Gestion des formulaires
- **Yup 1.7** : Validation schema

### Routing & Navigation
- **React Router 7.6** : Routing déclaratif
  - Nested routes
  - Route guards
  - Lazy loading
  - Navigation guards

### Internationalization
- **i18next 25.3** : Framework d'internationalisation
  - Namespace support
  - Pluralization
  - Interpolation
  - Lazy loading
- **react-i18next 15.6** : Integration React

### Third-party Integrations
- **Clerk React 5.47** : Authentification frontend
- **Socket.io Client 4.7** : Client WebSocket
- **React DatePicker 8.4** : Composant de sélection de date
- **React Day Picker 9.9** : Calendrier personnalisable
- **Swiper 11.2** : Carousel framework moderne
- **React Toastify 11.0** : Notifications toast
- **React World Flags 1.6** : Drapeaux internationaux

### Development Experience
- **ESLint 9.25** : Linting avec règles React
- **TypeScript ESLint** : Linting TypeScript
- **Autoprefixer** : Compatibility CSS
- **PostCSS 8.5** : Transformation CSS


CI-DESSOUS EST UNE PRESENTATION GLOBALE DE L'APPLICATION (FRONTEND+BACKEND)
# LAMAISON - Application Immobilière

LAMAISON est une application web immobilière complète permettant la gestion d'annonces immobilières, la prise de rendez-vous, la messagerie entre utilisateurs et la gestion des favoris. L'application est structurée avec un backend Node.js/Express et un frontend React/TypeScript.

## Architecture du Projet

```
LAMAISON/
├── backend/                 # API REST avec Express.js
│   ├── src/
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services (Socket.io, etc.)
│   │   ├── dto/            # Data Transfer Objects
│   │   └── server.ts       # Point d'entrée du serveur
│   ├── prisma/             # Schéma de base de données
│   └── generated/          # Client Prisma généré
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── layouts/        # Layouts principaux
│   │   └── context/        # Contextes React
└── admin-interface/        # Interface d'administration
```

## Fonctionnalités Principales

### Pour les Agents Immobiliers
- **Gestion des annonces** : Création, modification, suppression d'annonces immobilières
- **Gestion des rendez-vous** : Validation et planification des visites
- **Messagerie** : Communication avec les prospects
- **Tableau de bord** : Vue d'ensemble des activités

### Pour les Prospects/Acheteurs
- **Recherche d'annonces** : Filtrage par ville, type de bien, prix, etc.
- **Favoris** : Sauvegarde des annonces intéressantes
- **Prise de rendez-vous** : Demande de visites
- **Messagerie** : Communication avec les agents

### Fonctionnalités Transverses
- **Authentification** : Via Clerk avec rôles (ADMIN, AGENT, PROSPECT)
- **Internationalisation** : Support français/anglais
- **Upload d'images** : Gestion des photos des biens
- **Notifications temps réel** : Via Socket.io

## Stack Technique

### Backend
- **Node.js** + **Express.js** : Serveur API REST
- **TypeScript** : Typage strict
- **Prisma** : ORM pour la base de données MySQL
- **Clerk** : Authentification et gestion des utilisateurs
- **Socket.io** : Communication temps réel
- **Multer** : Upload de fichiers
- **JWT** : Tokens d'authentification

### Frontend
- **React 19** : Framework JavaScript
- **TypeScript** : Typage strict
- **Vite** : Build tool et dev server
- **TailwindCSS** : Framework CSS
- **React Router** : Gestion des routes
- **Clerk React** : Intégration authentification
- **i18next** : Internationalisation
- **Formik + Yup** : Gestion des formulaires
- **Socket.io Client** : Communication temps réel

## Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **MySQL** ou **MariaDB** pour la base de données
- **Compte Clerk** pour l'authentification

## Installation et Démarrage

### 1. Cloner le projet
```bash
git clone <repository-url>
cd LAMAISON
```

### 2. Backend
```bash
cd backend
npm install
```

#### Configuration des variables d'environnement
Créer un fichier `.env` à la racine du backend :
```env
DATABASE_URL="mysql://username:password@localhost:3306/lamaison"
CLERK_SECRET_KEY="votre_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="votre_clerk_publishable_key"
CLERK_WEBHOOK_SECRET="votre_webhook_secret"
PORT=5000
```

#### Initialisation de la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Remplir la base de données avec des données de test
npx prisma db seed
```

#### Démarrage du serveur backend
```bash
# Mode développement
npm run dev

# Le serveur démarre sur http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
```

#### Configuration des variables d'environnement
Créer un fichier `.env` à la racine du frontend :
```env
VITE_CLERK_PUBLISHABLE_KEY="votre_clerk_publishable_key"
VITE_API_URL="http://localhost:5000"
```

#### Démarrage de l'application frontend
```bash
# Mode développement
npm run dev

# L'application démarre sur http://localhost:5173
```

## Commandes Utiles

### Backend
```bash
# Démarrer le serveur en développement
npm run dev

# Lancer les tests
npm test

# Générer le client Prisma
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Voir la base de données
npx prisma studio

# Réinitialiser la base de données
npx prisma migrate reset
```

### Frontend
```bash
# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Lancer le linter
npm run lint

# Prévisualiser le build de production
npm run preview
```

### Prisma Commands
```bash
# Générer le client Prisma après modification du schéma
npx prisma generate

# Pousser les changements du schéma vers la base de données
npx prisma db push

# Voir le schéma de la base de données
npx prisma db pull

# Ouvrir l'interface Prisma Studio
npx prisma studio

# Créer une migration
npx prisma migrate dev --name init

# Réinitialiser la base de données
npx prisma migrate reset
```

## Structure de la Base de Données

### Modèles Principaux

#### User
- **id**, **clerkId**, **firstname**, **role**, **phone**, **avatar**
- Relations : favoris, messages (envoyés/reçus), annonces, rendez-vous

#### Annonce
- **id**, **titre**, **description**, **prix**, **ville**, **quartier**
- **surface**, **chambres**, **douches**, **vues**, **images**
- **type** (maison, appartement, terrain, etc.)
- **projet** (achat, location)
- Relations : propriétaire, favoris, rendez-vous

#### RendezVous
- **id**, **date**, **proposedDate**, **nom**, **prenom**
- **email**, **telephone**, **message**, **status**
- **status** : EN_ATTENTE, PROPOSE, ACCEPTE, REFUSE, ANNULE
- Relations : prospect, annonce

#### Message
- **id**, **senderId**, **receiverId**, **content**
- Relations : sender, receiver

#### Favori
- **id**, **userId**, **annonceId**
- Relations : user, annonce

#### Admin
- **id**, **name**, **email**, **password**, **role**

## Logique des Composants Principaux

### Frontend Components

#### AnnonceCard
- **Fonction** : Affiche une carte d'annonce avec image carousel
- **Props** : id, titre, ville, prix, images, chambres, douches, surface, etc.
- **Fonctionnalités** : 
  - Carousel d'images avec Swiper
  - Ajout/retrait des favoris
  - Navigation vers le détail de l'annonce
  - Affichage du nombre de vues

#### AnnonceForm
- **Fonction** : Formulaire de création/modification d'annonce
- **États** : formData, selectedFiles, previewUrls, isSubmitting
- **Fonctionnalités** :
  - Upload multiple d'images avec preview
  - Validation du formulaire avec Formik/Yup
  - Gestion des différents types de biens et projets
  - Sauvegarde automatique des brouillons

#### SearchBar
- **Fonction** : Barre de recherche avancée avec filtres
- **Filtres** : Ville, type de bien, prix, surface, chambres, etc.
- **Fonctionnalités** :
  - Recherche en temps réel
  - Sauvegarde des filtres dans l'URL
  - Auto-complétion pour les villes

#### RdvModal
- **Fonction** : Modal de prise de rendez-vous
- **Fonctionnalités** :
  - Sélection de date et heure
  - Formulaire de contact
  - Intégration avec le calendrier
  - Confirmation par email

### Backend Controllers

#### AnnonceController
- **createAnnonce** : Création d'une nouvelle annonce
- **getAnnonces** : Récupération paginée des annonces avec filtres
- **getAnnonceById** : Détail d'une annonce
- **updateAnnonce** : Mise à jour d'une annonce
- **deleteAnnonce** : Suppression d'une annonce
- **incrementViews** : Incrémentation du compteur de vues

#### AuthController
- **syncUser** : Synchronisation des utilisateurs Clerk avec la base locale
- **getUserProfile** : Récupération du profil utilisateur
- **updateProfile** : Mise à jour du profil

#### RdvController
- **createRdv** : Création d'une demande de rendez-vous
- **getRdvsByUser** : Rendez-vous d'un utilisateur
- **updateRdvStatus** : Mise à jour du statut d'un rendez-vous
- **getRdvsByAnnonce** : Rendez-vous pour une annonce

#### MessageController
- **sendMessage** : Envoi d'un message
- **getMessages** : Récupération des conversations
- **markAsRead** : Marquage des messages comme lus

## Gestion des Rôles et Permissions

### Rôles
- **ADMIN** : Accès complet à l'administration
- **AGENT** : Gestion des annonces et rendez-vous
- **PROSPECT** : Recherche, favoris, prise de rendez-vous

### Permissions
- Les agents peuvent créer/modifier leurs annonces
- Les prospects peuvent voir les annonces et prendre rendez-vous
- Les admins ont accès à toutes les fonctionnalités

## API Endpoints

### Authentification
- `POST /auth/sync` - Synchronisation utilisateur Clerk
- `GET /auth/profile` - Profil utilisateur

### Annonces
- `GET /annonces` - Liste des annonces (avec filtres)
- `GET /annonces/:id` - Détail d'une annonce
- `POST /annonces` - Créer une annonce
- `PUT /annonces/:id` - Mettre à jour une annonce
- `DELETE /annonces/:id` - Supprimer une annonce

### Rendez-vous
- `POST /rdvs` - Créer une demande de RDV
- `GET /rdvs/user/:userId` - RDV d'un utilisateur
- `PUT /rdvs/:id/status` - Mettre à jour le statut

### Messages
- `POST /messages` - Envoyer un message
- `GET /messages/:userId` - Conversation avec un utilisateur

### Favoris
- `POST /favoris` - Ajouter aux favoris
- `DELETE /favoris/:annonceId` - Retirer des favoris
- `GET /favoris/user/:userId` - Favoris d'un utilisateur

## Communication Temps Réel

### Socket.io Events
- **connection** : Connexion d'un utilisateur
- **sendMessage** : Envoi d'un message en temps réel
- **newRdv** : Notification de nouveau rendez-vous
- **rdvStatusUpdate** : Mise à jour du statut d'un RDV
- **userOnline** : Statut de connexion des utilisateurs

## Tests

### Tests Backend
```bash
npm test
```

### Tests Frontend
```bash
npm run test
```

## Déploiement

### Backend (Production)
1. Builder l'application : `npm run build`
2. Configurer les variables d'environnement de production
3. Appliquer les migrations : `npx prisma migrate deploy`
4. Démarrer le serveur

### Frontend (Production)
1. Builder l'application : `npm run build`
2. Déployer le dossier `dist` sur un serveur web
3. Configurer le reverse proxy pour rediriger les requêtes API

## Dépannage

### Problèmes Communs
- **Erreur de connexion à la base de données** : Vérifier DATABASE_URL et que MySQL/MariaDB est démarré
- **Erreur Clerk** : Vérifier les clés API dans les variables d'environnement
- **Images ne s'affichent pas** : Vérifier que le dossier uploads existe et les permissions

### Logs
- Backend : Console du serveur Node.js
- Frontend : Console du navigateur et onglet Network
- Base de données : `npx prisma studio` pour inspecter les données

## Contributeurs

- Gilles - Développeur principal

---

**Note** : Ce README est un document vivant. N'hésitez pas à le mettre à jour avec de nouvelles informations ou corrections.


If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
