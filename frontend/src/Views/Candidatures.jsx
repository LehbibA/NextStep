import React, { useState, useEffect } from 'react';
import { getUserApplications, applyToJobWithCV, getOffres } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Candidatures = () => {
  const [applications, setApplications] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    cvType: 'generated'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Redirection simple
  const redirectTo = (path) => {
    window.location.href = path;
  };

  // Vérification de l'authentification
  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      redirectTo('/connexion');
      return;
    }
    if (user.role !== 'candidat') {
      redirectTo('/OffresGestion');
      return;
    }

    // Charger les données
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Charger les candidatures de l'utilisateur
      const applicationsResponse = await getUserApplications(token);
      if (applicationsResponse.data.success) {
        setApplications(applicationsResponse.data.applications);
      }

      // Charger les offres disponibles
      const offersResponse = await getOffres(token);
      if (offersResponse.data) {
        // Filtrer les offres pour lesquelles l'utilisateur n'a pas encore postulé
        const appliedJobIds = applicationsResponse.data.applications?.map(app => app.job_id) || [];
        const filteredOffers = offersResponse.data.filter(offer => !appliedJobIds.includes(offer.id));
        setAvailableJobs(filteredOffers);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { class: 'bg-warning text-dark', text: 'En attente', icon: 'clock' };
      case 'accepted':
        return { class: 'bg-success', text: 'Acceptée', icon: 'check-circle' };
      case 'rejected':
        return { class: 'bg-danger', text: 'Refusée', icon: 'x-circle' };
      default:
        return { class: 'bg-secondary', text: 'Inconnue', icon: 'question-circle' };
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Seuls les fichiers PDF et Word sont acceptés');
        return;
      }
      
      // Vérifier la taille (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Le fichier ne peut pas dépasser 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleApply = async (job) => {
    setIsSubmitting(true);
    setError('');
    
    // Validation
    if (applicationForm.cvType === 'upload' && !selectedFile) {
      setError('Veuillez sélectionner un fichier CV');
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
        // Recharger les données pour voir la nouvelle candidature
        await loadData();
        
        // Fermer le modal et réinitialiser le formulaire
        setSelectedJob(null);
        setApplicationForm({ coverLetter: '', cvType: 'generated' });
        setSelectedFile(null);
        
        // Afficher un message de succès
        alert('Candidature envoyée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la candidature:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      redirectTo('/connexion');
    }
  };

  const user = getUserFromToken();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h5>Chargement des candidatures...</h5>
        </div>
      </div>
    );
  }

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
            <a href="/Candidatures" className="nav-link text-white fw-semibold">Candidatures</a>
            
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
              <i className="bi bi-file-earmark-text me-3"></i>
              Mes Candidatures
            </h1>
            <p className="lead text-muted mb-4">
              Suivez l'état de vos candidatures et postulez à de nouvelles offres
            </p>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row g-4">
          {/* Section Mes Candidatures */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h4 className="card-title mb-0">
                  <i className="bi bi-folder-fill me-2"></i>
                  Mes Candidatures ({applications.length})
                </h4>
              </div>
              <div className="card-body p-4">
                {applications.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.3 }}>
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h5 className="text-muted">Aucune candidature envoyée</h5>
                    <p className="text-muted">Vos candidatures apparaîtront ici après avoir postulé</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {applications.map((app) => {
                      const statusBadge = getStatusBadge(app.status);
                      return (
                        <div key={app.id} className="list-group-item border-0 p-0 mb-3">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h6 className="card-title mb-1 fw-bold">
                                    {app.job_title || 'Poste non spécifié'}
                                  </h6>
                                  <div className="text-muted small mb-2">
                                    <i className="bi bi-building me-1"></i>
                                    {app.company || 'Entreprise inconnue'}
                                    <span className="mx-2">•</span>
                                    <i className="bi bi-geo-alt me-1"></i>
                                    {app.location || 'Lieu non spécifié'}
                                  </div>
                                  <div className="text-muted small mb-2">
                                    <i className="bi bi-file-earmark me-1"></i>
                                    CV: {app.cv_type === 'generated' ? 'Généré par IA' : 'Téléchargé'}
                                  </div>
                                </div>
                                <span className={`badge ${statusBadge.class}`}>
                                  <i className={`bi bi-${statusBadge.icon} me-1`}></i>
                                  {statusBadge.text}
                                </span>
                              </div>
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="bi bi-calendar3 me-1"></i>
                                  Postulé le {new Date(app.applied_at).toLocaleDateString('fr-CA')}
                                </small>
                                {app.salary && (
                                  <small className="text-success fw-bold">
                                    <i className="bi bi-currency-dollar me-1"></i>
                                    {app.salary}
                                  </small>
                                )}
                              </div>
                              
                              {app.feedback && (
                                <div className="mt-3 p-2 bg-light rounded">
                                  <small className="text-muted">
                                    <i className="bi bi-chat-text me-1"></i>
                                    <strong>Retour :</strong> {app.feedback}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Nouvelles Offres */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h4 className="card-title mb-0">
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Nouvelles Offres ({availableJobs.length})
                </h4>
              </div>
              <div className="card-body p-4">
                {availableJobs.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.3 }}>
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h5 className="text-muted">Aucune nouvelle offre</h5>
                    <p className="text-muted">
                      Vous avez postulé à toutes les offres disponibles !<br />
                      <a href="/offres" className="text-decoration-none">Voir toutes les offres</a>
                    </p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {availableJobs.slice(0, 4).map((job) => (
                      <div key={job.id} className="col-12">
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="card-title mb-1 fw-bold">{job.titre}</h6>
                                <div className="text-muted small mb-2">
                                  <i className="bi bi-building me-1"></i>
                                  {job.entreprise || 'Entreprise inconnue'}
                                  <span className="mx-2">•</span>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {job.lieu}
                                </div>
                                <p className="card-text small text-muted mb-3">
                                  {job.description ? 
                                    (job.description.length > 100 ? 
                                      job.description.substring(0, 100) + '...' : 
                                      job.description
                                    ) : 
                                    'Description non disponible'
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-success fw-bold">
                                <i className="bi bi-currency-dollar me-1"></i>
                                {job.salaire || 'Non spécifié'}
                              </span>
                              <button
                                onClick={() => setSelectedJob(job)}
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: '8px' }}
                              >
                                <i className="bi bi-send me-1"></i>
                                Postuler
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {availableJobs.length > 4 && (
                      <div className="col-12 text-center mt-3">
                        <a href="/offres" className="btn btn-outline-success">
                          <i className="bi bi-eye me-2"></i>
                          Voir toutes les offres ({availableJobs.length})
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
                    setError('');
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

                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
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
                    setError('');
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
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .modal.show {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .list-group-item .card {
          transition: all 0.3s ease;
        }
        
        .list-group-item .card:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }

        .dropdown-menu {
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Candidatures;