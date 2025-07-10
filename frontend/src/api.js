import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // à modifier quand backend déployé
});

// ========== AUTHENTIFICATION ==========
// Requête pour se connecter
export const login = (email, password) =>
  API.post('/login', { email, password });

// Requête pour s'inscrire
export const register = (email, password, role) =>
  API.post('/register', { email, password, role });

// ========== OFFRES D'EMPLOI ==========
// Requête pour obtenir les offres (nécessite token)
export const getOffres = (token) =>
  API.get('/offres', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Créer une nouvelle offre (recruteur)
export const createOffre = (offreData, token) =>
  API.post('/offres', offreData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// ========== GESTION PROFIL ==========
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

// ========== CANDIDATURES AVEC CV ==========
// Postuler à une offre avec CV
export const applyToJobWithCV = (applicationData, cvFile, token) => {
  const formData = new FormData();
  
  // Ajouter les données de la candidature
  formData.append('job_id', applicationData.job_id);
  formData.append('cover_letter', applicationData.cover_letter || '');
  formData.append('cv_type', applicationData.cv_type);
  
  // Ajouter le fichier CV si fourni
  if (cvFile && applicationData.cv_type === 'upload') {
    formData.append('cv', cvFile);
  }

  return API.post('/applications/apply', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  });
};

// Ancienne fonction pour compatibilité (utilise la nouvelle fonction)
export const applyToJob = (applicationData, token) => {
  return applyToJobWithCV(applicationData, null, token);
};

// Récupérer mes candidatures (candidat)
export const getUserApplications = (token) =>
  API.get('/applications/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Récupérer candidatures reçues (recruteur)
export const getRecruiterApplications = (token) =>
  API.get('/applications/recruiter', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Mettre à jour le statut d'une candidature (recruteur)
export const updateApplicationStatus = (applicationId, status, feedback, token) =>
  API.put('/applications/status', { 
    application_id: applicationId, 
    status, 
    feedback 
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Télécharger un CV (recruteur)
export const downloadCV = (fileName, token) => {
  return API.get(`/applications/cv/${fileName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', // Important pour télécharger des fichiers
  });
};

// Archiver une candidature (candidat)
export const archiveApplication = (applicationId, token) =>
  API.post('/applications/archive', {
    application_id: applicationId
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// ========== STATISTIQUES ==========
// Récupérer les statistiques candidat
export const getCandidateStats = (token, days = 30) =>
  API.get(`/stats/candidate?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Récupérer les statistiques recruteur
export const getRecruiterStats = (token, days = 30) =>
  API.get(`/stats/recruiter?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// ========== INTELLIGENCE ARTIFICIELLE ==========
// Générer un CV avec l'IA
export const generateCV = (profileData, token) =>
  API.post('/ai/generate-cv', profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Générer une lettre de motivation avec l'IA
export const generateCoverLetter = (jobId, token) =>
  API.post('/ai/generate-cover-letter', {
    job_id: jobId
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Obtenir des recommandations d'emplois IA
export const getJobRecommendations = (token) =>
  API.get('/ai/job-recommendations', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// Analyser la compatibilité emploi-profil
export const analyzeJobCompatibility = (jobId, token) =>
  API.post('/ai/analyze-compatibility', {
    job_id: jobId
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

export default API;