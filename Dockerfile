# ---------- Stage 1 : build ----------
# On utilise Node seulement pour compiler le projet (Vite + TypeScript).
# Cette image ne sera PAS celle qui tourne en prod, juste un atelier temporaire.
FROM node:20-slim AS build

WORKDIR /app

# Copie des fichiers de dépendances d'abord (cache Docker, comme pour le backend).
COPY package.json package-lock.json ./
RUN npm install

# Déclare deux "arguments de build" : leur valeur sera passée depuis
# docker-compose (ou `docker build --build-arg ...`) au moment de la
# construction de l'image, pas au lancement du conteneur.
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# On transforme ces ARG en variables d'environnement classiques :
# c'est comme ça que Vite va pouvoir les lire pendant `npm run build`
# (exactement comme il lirait un fichier .env en local).
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Copie le reste du code source (composants, pages, etc.)
COPY . .

# Compile le projet : ça exécute `tsc -b && vite build` (voir package.json),
# et génère un dossier /app/dist avec du HTML/CSS/JS statique, prêt à servir.
RUN npm run build

# ---------- Stage 2 : image finale (serveur web) ----------
# Image nginx officielle, très légère (basée sur Alpine Linux).
FROM nginx:alpine

# Notre config nginx personnalisée (fichier créé juste après),
# qui remplace la config par défaut de nginx.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On récupère UNIQUEMENT le résultat du build (dossier dist) depuis le
# stage précédent — pas node_modules, pas le code source TypeScript.
# C'est ça, la magie du multi-stage : l'image finale est minuscule.
COPY --from=build /app/dist /usr/share/nginx/html

# Port par défaut sur lequel nginx écoute à l'intérieur du conteneur.
EXPOSE 80

# Démarre nginx au premier plan (nécessaire pour que Docker garde
# le conteneur actif — sinon nginx tourne en arrière-plan et le
# conteneur s'arrête immédiatement).
CMD ["nginx", "-g", "daemon off;"]