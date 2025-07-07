import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, changePassword } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProfilUtilisateur = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    dateNaissance: '',
    nationalite: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fonction pour décoder le token JWT
  const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      return null;
    }
  };

  // Vérification de l'authentification
  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      navigate('/connexion');
      return;
    }

    // Charger les données existantes du profil
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getUserProfile(token);
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setFormData({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          telephone: userData.telephone || '',
          adresse: userData.adresse || '',
          ville: userData.ville || '',
          codePostal: userData.codePostal || '',
          dateNaissance: userData.dateNaissance || '',
          nationalite: userData.nationalite || '',
          bio: userData.bio || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          portfolio: userData.portfolio || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setErrorMessage('Erreur lors du chargement du profil');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await updateUserProfile(formData, token);
      
      if (response.data.success) {
        setSuccessMessage('Profil mis à jour avec succès !');
        // Mettre à jour les données locales si nécessaire
        if (response.data.user) {
          setFormData(prevData => ({ ...prevData, ...response.data.user }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, token);
      
      if (response.data.success) {
        setSuccessMessage('Mot de passe modifié avec succès !');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la modification du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      navigate('/connexion');
    }
  };

  const user = getUserFromToken();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            <i className="bi bi-briefcase-fill me-2"></i>NextStep
          </a>
          <div className="d-flex gap-3">
            <button
              className="btn btn-link text-white text-decoration-none"
              onClick={() => navigate(user?.role === 'recruteur' ? '/OffresGestion' : '/offres')}
            >
              <i className="bi bi-arrow-left me-2"></i>Retour
            </button>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="display-5 fw-bold text-primary mb-3">
              <i className="bi bi-person-circle me-3"></i>Mon Profil
            </h1>
            <p className="lead text-muted">
              Gérez vos informations personnelles et paramètres de compte
            </p>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {errorMessage}
            <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
          </div>
        )}

        <div className="row">
          {/* Informations personnelles */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h5 className="card-title mb-0">
                  <i className="bi bi-person-fill me-2"></i>Informations personnelles
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    {/* Nom et Prénom */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    {/* Email et Téléphone */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="06 12 34 56 78"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    {/* Adresse */}
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Adresse</label>
                      <input
                        type="text"
                        className="form-control"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleInputChange}
                        placeholder="123 Rue de la Paix"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    {/* Ville et Code postal */}
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-semibold">Ville</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ville"
                        value={formData.ville}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Code postal</label>
                      <input
                        type="text"
                        className="form-control"
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleInputChange}
                        placeholder="75001"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    {/* Date de naissance et Nationalité */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Date de naissance</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateNaissance"
                        value={formData.dateNaissance}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Nationalité</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nationalite"
                        value={formData.nationalite}
                        onChange={handleInputChange}
                        placeholder="Française"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    {/* Bio */}
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Biographie</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Parlez-nous de vous, votre expérience, vos passions..."
                        style={{ borderRadius: '8px' }}
                      ></textarea>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="col-12 mb-4">
                      <h6 className="fw-semibold mb-3 text-primary">Réseaux professionnels</h6>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">LinkedIn</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-linkedin text-primary"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              placeholder="linkedin.com/in/votre-profil"
                            />
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">GitHub</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-github"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              name="github"
                              value={formData.github}
                              onChange={handleInputChange}
                              placeholder="github.com/votre-profil"
                            />
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Portfolio</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-globe text-success"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              name="portfolio"
                              value={formData.portfolio}
                              onChange={handleInputChange}
                              placeholder="votre-site.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                    style={{ borderRadius: '10px', padding: '12px 30px' }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Sauvegarder les modifications
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Changement de mot de passe */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-warning text-dark" style={{ borderRadius: '15px 15px 0 0' }}>
                <h6 className="card-title mb-0">
                  <i className="bi bi-lock-fill me-2"></i>Sécurité
                </h6>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Ancien mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning w-100"
                    disabled={isLoading}
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    Modifier le mot de passe
                  </button>
                </form>
              </div>
            </div>

            {/* Informations du compte */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-info text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h6 className="card-title mb-0">
                  <i className="bi bi-info-circle-fill me-2"></i>Informations du compte
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-person-badge text-primary me-3 fs-5"></i>
                  <div>
                    <small className="text-muted">Rôle</small>
                    <div className="fw-semibold text-capitalize">
                      {user?.role || 'Non défini'}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-calendar-check text-success me-3 fs-5"></i>
                  <div>
                    <small className="text-muted">Membre depuis</small>
                    <div className="fw-semibold">
                      {new Date().toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check text-warning me-3 fs-5"></i>
                  <div>
                    <small className="text-muted">Statut du compte</small>
                    <div className="fw-semibold text-success">Actif</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilUtilisateur;