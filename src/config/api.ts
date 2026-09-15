// Source unique de vérité pour les URLs de l'API. Objectif : ne plus avoir
// des copies de "const API_BASE = 'http://localhost:5000'" (souvent codées
// en dur, sans lire VITE_API_URL) dispersées dans 14 fichiers, et distinguer
// clairement deux usages différents :
//
// - API_BASE   : pour appeler l'API (routes versionnées /api/v1/...)
// - API_ORIGIN : pour tout ce qui n'est PAS une route API — les fichiers
//   statiques servis depuis /uploads, et la connexion Socket.io (qui se fait
//   à la racine du serveur, pas sur une route REST).
export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE = `${API_ORIGIN}/api/v1`;