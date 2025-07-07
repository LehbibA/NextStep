import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // à modifier quand backend déployé
});

// Requête pour se connecter
export const login = (email, password) =>
  API.post('/login', { email, password });

// Requête pour s'inscrire
export const register = (email, password, role) =>
  API.post('/register', { email, password, role });

// Requête pour obtenir les offres (nécessite token)
export const getOffres = (token) =>
  API.get('/offres', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Requête pour récupérer le profil utilisateur
export const getUserProfile = (token) =>
  API.get('/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Requête pour mettre à jour le profil utilisateur
export const updateUserProfile = (profileData, token) =>
  API.put('/user/profile', profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Requête pour changer le mot de passe
export const changePassword = (passwordData, token) =>
  API.put('/user/change-password', passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });