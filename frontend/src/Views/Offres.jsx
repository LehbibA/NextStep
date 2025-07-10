import React, { useState, useEffect } from 'react';
import { getOffres, applyToJobWithCV } from '../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Offres = () => {
  const [offres, setOffres] = useState([]);
  const [filtres, setFiltres] = useState({
    localisation: "",
    type: "",
    entreprise: ""
  });
  const [erreur, setErreur] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    cvType: 'generated'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const navigate = useNavigate();

  // 🔐 Décoder le token JWT pour obtenir le rôle et user_id
  function getUserFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      return null;
    }
  }

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      navigate('/connexion');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErreur("Vous devez être connecté.");
      return navigate('/connexion');
    }

    const user = getUserFromToken();

    if (!user || user.role !== "candidat") {
      setErreur("Accès refusé. Cette page est réservée aux candidats.");
      return navigate('/connexion');
    }

    // 🔥 Récupération dynamique des offres via API
    getOffres(token)
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setOffres(data);
        } else {
          setOffres([]);
        }
      })
      .catch((err) => {
        console.error("Erreur API /offres :", err);
        setErreur("Erreur lors du chargement des offres.");
      });
  }, [navigate]);

  // Filtrage des offres (logique originale + recherche textuelle)
  const offresFiltrees = offres.filter(offre => {
    const matchesFilters = 
      (!filtres.localisation || offre.ville === filtres.localisation) &&
      (!filtres.type || offre.type === filtres.type) &&
      (!filtres.entreprise || offre.entreprise === filtres.entreprise);
    
    const matchesSearch = searchTerm === '' || 
      (offre.title || offre.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offre.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offre.ville || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilters && matchesSearch;
  });

  const handleFilterChange = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setApplicationError('Seuls les fichiers PDF et Word sont acceptés');
        return;
      }
      
      // Vérifier la taille (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setApplicationError('Le fichier ne peut pas dépasser 5MB');
        return;
      }
      
      setSelectedFile(file);
      setApplicationError('');
    }
  };

  const handleApply = async (job) => {
    setIsSubmitting(true);
    setApplicationError('');
    
    // Validation
    if (applicationForm.cvType === 'upload' && !selectedFile) {
      setApplicationError('Veuillez sélectionner un fichier CV');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const applicationData = {
        job_id: job.id,
        cover_letter: applicationForm.coverLetter,
        cv_type: applicationForm.cvType
      };

      const response = await applyToJobWithCV(applicationData, selectedFile, token);
      
      if (response.data.success) {
        // Fermer le modal et réinitialiser le formulaire
        setSelectedJob(null);
        setApplicationForm({ coverLetter: '', cvType: 'generated' });
        setSelectedFile(null);
        
        // Afficher un message de succès
        alert('Candidature envoyée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la candidature:', error);
      setApplicationError(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const user = getUserFromToken();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header moderne */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="/">
            <i className="bi bi-briefcase-fill me-2"></i>NextStep
          </a>
          <div className="d-flex align-items-center gap-4">
            <a href="/offres" className="nav-link text-white fw-semibold">Offres</a>
            <a href="#" className="nav-link text-white fw-semibold">Favoris</a>
            <a className="nav-link text-white fw-semibold" href="/Candidatures">Candidatures</a>
            
            {/* Menu déroulant profil */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-2"></i>
                {user?.email || 'Mon Compte'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="/UserProfile">
                    <i className="bi bi-person-gear me-2"></i>
                    Mon Profil
                  </a>
                </li>
                <li>
                  
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {/* Hero Section */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">
              Offres d'Emploi
            </h1>
            <p className="lead text-muted mb-4">
              Trouvez votre prochain emploi parmi <span className="fw-bold text-primary">{offres.length}</span> offres disponibles
            </p>
          </div>
        </div>

        {/* Messages d'alerte */}
        {user?.role === "recruteur" && (
          <div className="alert alert-info mb-4 shadow-sm border-0">
            <i className="bi bi-info-circle me-2"></i>
            Vous êtes connecté en tant que recruteur.
          </div>
        )}

        {erreur && (
          <div className="alert alert-danger mb-4 shadow-sm border-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {erreur}
          </div>
        )}

        {/* Section Filtres moderne */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h5 className="card-title mb-4">
                  <i className="bi bi-funnel-fill me-2 text-primary"></i>
                  Filtres de recherche
                </h5>
                <div className="row g-3">
                  {/* Recherche textuelle */}
                  <div className="col-md-6 col-lg-4">
                    <label className="form-label fw-semibold">Recherche globale</label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Titre, entreprise, ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="col-md-6 col-lg-2">
                    <label className="form-label fw-semibold">Localisation</label>
                    <select
                      name="localisation"
                      className="form-select"
                      value={filtres.localisation}
                      onChange={handleFilterChange}
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      <option value="">Toutes</option>
                      {[...new Set(offres.map(o => o.ville))].filter(Boolean).map((ville, idx) => (
                        <option key={idx} value={ville}>{ville}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type de contrat */}
                  <div className="col-md-6 col-lg-2">
                    <label className="form-label fw-semibold">Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={filtres.type}
                      onChange={handleFilterChange}
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      <option value="">Tous</option>
                      {[...new Set(offres.map(o => o.type))].filter(Boolean).map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Entreprise */}
                  <div className="col-md-6 col-lg-2">
                    <label className="form-label fw-semibold">Entreprise</label>
                    <select
                      name="entreprise"
                      className="form-select"
                      value={filtres.entreprise}
                      onChange={handleFilterChange}
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      <option value="">Toutes</option>
                      {[...new Set(offres.map(o => o.entreprise))].filter(Boolean).map((entreprise, idx) => (
                        <option key={idx} value={entreprise}>{entreprise}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reset */}
                  <div className="col-lg-2 d-flex align-items-end">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => {
                        setFiltres({ localisation: "", type: "", entreprise: "" });
                        setSearchTerm('');
                      }}
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats en grid moderne */}
        <div className="row">
          {offresFiltrees.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.2 }}>
                  <i className="bi bi-briefcase"></i>
                </div>
                <h4 className="text-muted mb-3">
                  {offres.length === 0 ? 'Aucune offre disponible' : 'Aucune offre trouvée'}
                </h4>
                <p className="text-muted lead">
                  {offres.length === 0 ? 
                    'Les offres apparaîtront ici une fois publiées par les recruteurs.' :
                    'Essayez de modifier vos critères de recherche.'
                  }
                </p>
              </div>
            </div>
          ) : (
            offresFiltrees.map((offre, index) => (
              <div key={index} className="col-md-6 col-xl-4 mb-4">
                <div className="card h-100 border-0 shadow-sm" style={{ 
                  borderRadius: '15px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div className="card-body p-4">
                    {/* Header de la card */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className={`badge px-3 py-2 ${
                        offre.type === 'CDI' ? 'bg-success' :
                        offre.type === 'CDD' ? 'bg-warning' :
                        offre.type === 'Stage' ? 'bg-info' :
                        'bg-primary'
                      }`} style={{ borderRadius: '20px', fontSize: '0.75rem' }}>
                        {offre.type || "Type inconnu"}
                      </span>
                      <button className="btn btn-link p-0 text-muted heart-btn">
                        <i className="bi bi-heart fs-5"></i>
                      </button>
                    </div>
                    
                    {/* Titre du poste */}
                    <h5 className="card-title fw-bold mb-3" style={{ 
                      color: '#2c3e50',
                      lineHeight: '1.3',
                      fontSize: '1.1rem'
                    }}>
                      {offre.title || offre.titre || "Titre inconnu"}
                    </h5>
                    
                    {/* Entreprise */}
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-building text-primary me-2"></i>
                      <span className="text-muted fw-medium">
                        {offre.entreprise || "Entreprise inconnue"}
                      </span>
                    </div>
                    
                    {/* Localisation */}
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      <span className="text-muted">
                        {offre.ville || "Localisation inconnue"}
                      </span>
                    </div>
                    
                    {/* Salaire si disponible */}
                    {offre.salaire && (
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-currency-dollar text-success me-2"></i>
                        <span className="fw-bold text-success">
                          {offre.salaire}
                        </span>
                      </div>
                    )}
                    
                    {/* Description */}
                    {offre.description && (
                      <p className="card-text text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                        {offre.description.length > 120 
                          ? `${offre.description.substring(0, 120)}...`
                          : offre.description
                        }
                      </p>
                    )}
                  </div>
                  
                  {/* Footer avec boutons */}
                  <div className="card-footer bg-transparent border-0 p-4 pt-0">
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary fw-semibold" 
                        style={{ 
                          borderRadius: '10px',
                          padding: '12px'
                        }}
                        onClick={() => alert('Fonctionnalité "Voir l\'offre" à implémenter')}
                      >
                        <i className="bi bi-eye me-2"></i>
                        Voir l'offre
                      </button>
                      <button 
                        className="btn btn-outline-success fw-semibold" 
                        style={{ 
                          borderRadius: '10px',
                          padding: '12px'
                        }}
                        onClick={() => setSelectedJob(offre)}
                      >
                        <i className="bi bi-send me-2"></i>
                        Postuler maintenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer avec stats */}
        {offresFiltrees.length > 0 && (
          <div className="row mt-5">
            <div className="col-12 text-center">
              <p className="text-muted">
                Affichage de <span className="fw-bold text-primary">{offresFiltrees.length}</span> offre{offresFiltrees.length > 1 ? 's' : ''} 
                sur <span className="fw-bold">{offres.length}</span> au total
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de candidature Bootstrap */}
      {selectedJob && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px' }}>
              <div className="modal-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h5 className="modal-title">
                  <i className="bi bi-send me-2"></i>
                  Postuler pour {selectedJob.titre}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setSelectedJob(null);
                    setSelectedFile(null);
                    setApplicationError('');
                  }}
                ></button>
              </div>
              
              <div className="modal-body p-4">
                {/* Informations sur l'offre */}
                <div className="alert alert-info mb-4">
                  <h6 className="alert-heading">{selectedJob.titre}</h6>
                  <p className="mb-1">
                    <i className="bi bi-building me-2"></i>
                    {selectedJob.entreprise || 'Entreprise inconnue'} • 
                    <i className="bi bi-geo-alt me-2 ms-2"></i>
                    {selectedJob.lieu}
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-briefcase me-2"></i>
                    {selectedJob.type} • 
                    <i className="bi bi-currency-dollar me-2 ms-2"></i>
                    {selectedJob.salaire || 'Non spécifié'}
                  </p>
                  <small>{selectedJob.description || 'Description non disponible'}</small>
                </div>

                {/* Choix du CV */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Choisissez votre CV</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <div 
                        onClick={() => {
                          setApplicationForm({...applicationForm, cvType: 'generated'});
                          setSelectedFile(null);
                        }}
                        className={`card h-100 border-2 ${applicationForm.cvType === 'generated' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      >
                        <div className="card-body text-center p-3">
                          <i className={`bi bi-robot fs-1 mb-2 ${applicationForm.cvType === 'generated' ? 'text-primary' : 'text-muted'}`}></i>
                          <h6 className={`mb-1 ${applicationForm.cvType === 'generated' ? 'text-primary' : 'text-muted'}`}>
                            CV généré par IA
                          </h6>
                          <small className="text-muted">Utiliser votre CV NextStep</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div 
                        onClick={() => setApplicationForm({...applicationForm, cvType: 'upload'})}
                        className={`card h-100 border-2 ${applicationForm.cvType === 'upload' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      >
                        <div className="card-body text-center p-3">
                          <i className={`bi bi-cloud-upload fs-1 mb-2 ${applicationForm.cvType === 'upload' ? 'text-primary' : 'text-muted'}`}></i>
                          <h6 className={`mb-1 ${applicationForm.cvType === 'upload' ? 'text-primary' : 'text-muted'}`}>
                            Télécharger un CV
                          </h6>
                          <small className="text-muted">Utiliser un fichier externe</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload de fichier si CV upload sélectionné */}
                {applicationForm.cvType === 'upload' && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Fichier CV <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      style={{ borderRadius: '8px' }}
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Formats acceptés : PDF, DOC, DOCX (max 5MB)
                    </div>
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {/* Lettre de motivation */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Lettre de motivation (optionnelle)</label>
                  <textarea
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})}
                    rows={6}
                    className="form-control"
                    placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                    style={{ borderRadius: '8px' }}
                  />
                  <div className="form-text">
                    <i className="bi bi-lightbulb me-1"></i>
                    Conseil : Personnalisez votre lettre en fonction de l'offre et de l'entreprise
                  </div>
                </div>

                {applicationError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {applicationError}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedJob(null);
                    setSelectedFile(null);
                    setApplicationError('');
                  }}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(selectedJob)}
                  disabled={isSubmitting || (applicationForm.cvType === 'upload' && !selectedFile)}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1"></i>
                      Envoyer ma candidature
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }
        
        .btn {
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
        }
        
        .btn-primary:hover {
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
        }
        
        .btn-outline-success:hover {
          box-shadow: 0 8px 25px rgba(25, 135, 84, 0.3);
        }
        
        .heart-btn:hover i {
          color: #dc3545 !important;
          transform: scale(1.2);
        }
        
        .heart-btn i {
          transition: all 0.3s ease;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .input-group-text {
          border: 1px solid #dee2e6;
        }
        
        .badge {
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Styles pour le dropdown */
        .dropdown-menu {
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border-radius: 10px;
          padding: 8px 0;
        }

        .dropdown-item {
          padding: 10px 16px;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          transform: translateX(4px);
        }

        .dropdown-item.text-danger:hover {
          background-color: #fff5f5;
          color: #dc3545 !important;
        }

        .dropdown-toggle::after {
          margin-left: 8px;
        }
        
        .modal.show {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }
          
          .col-xl-4 {
            margin-bottom: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Offres;