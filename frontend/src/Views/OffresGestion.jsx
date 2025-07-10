import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOffres, getRecruiterApplications, updateApplicationStatus, downloadCV } from '../api';

const OffersManagement = () => {
  const navigate = useNavigate();

  // 🔐 Fonction pour extraire le rôle de l'utilisateur depuis le token JWT
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

  // 🔒 Redirection si l'utilisateur n'est pas recruteur
  useEffect(() => {
    const user = getUserFromToken();
    if (!user || user.role !== 'recruteur') {
      navigate('/connexion');
    }
  }, [navigate]);

  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Charger les offres et candidatures depuis le backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Charger les offres
      const offersResponse = await getOffres(token);
      
      // Charger les candidatures
      const applicationsResponse = await getRecruiterApplications(token);
      
      if (offersResponse.data && applicationsResponse.data.success) {
        // Compter les candidatures par offre
        const applicationsByJob = {};
        applicationsResponse.data.applications.forEach(app => {
          if (!applicationsByJob[app.job_id]) {
            applicationsByJob[app.job_id] = 0;
          }
          applicationsByJob[app.job_id]++;
        });

        // Transformer les données pour correspondre à la structure attendue
        const transformedOffers = offersResponse.data.map(offer => ({
          id: offer.id,
          title: offer.titre,
          company: offer.entreprise || 'Entreprise inconnue',
          location: offer.lieu || offer.ville,
          type: offer.type,
          salary: offer.salaire || 'Non spécifié',
          status: offer.status || 'active',
          applications: applicationsByJob[offer.id] || 0,
          views: 0, // TODO: À implémenter plus tard
          publishedDate: offer.date_creation ? offer.date_creation.split(' ')[0] : new Date().toISOString().split('T')[0],
          expiryDate: calculateExpiryDate(offer.date_creation),
          description: offer.description,
          sector: offer.secteur,
          experience: offer.experience_requise,
          requirements: offer.competences_requises,
          benefits: offer.avantages
        }));
        
        setOffers(transformedOffers);
        setApplications(applicationsResponse.data.applications);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer la date d'expiration (30 jours après la création)
  const calculateExpiryDate = (creationDate) => {
    if (!creationDate) return new Date().toISOString().split('T')[0];
    
    const date = new Date(creationDate);
    date.setDate(date.getDate() + 30); // 30 jours après création
    return date.toISOString().split('T')[0];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-success', text: 'Actif' },
      paused: { class: 'bg-warning', text: 'En pause' },
      expired: { class: 'bg-danger', text: 'Expiré' },
      draft: { class: 'bg-secondary', text: 'Brouillon' }
    };
    return statusConfig[status] || statusConfig.active;
  };

  const getApplicationStatusBadge = (status) => {
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

  const filteredOffers = offers.filter(offer => {
    const matchesFilter = filter === 'all' || offer.status === filter;
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusUpdate = async (status) => {
    if (!selectedApplication) return;
    
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await updateApplicationStatus(selectedApplication.id, status, feedback, token);
      
      // Recharger les données
      await loadData();
      
      // Fermer le modal
      setSelectedApplication(null);
      setFeedback('');
      
      alert('Statut mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadCV = async (cvPath) => {
    try {
      const token = localStorage.getItem('token');
      const response = await downloadCV(cvPath, token);
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cvPath);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du CV');
    }
  };

  const updateOfferStatus = (id, newStatus) => {
    setOffers(offers.map(offer =>
      offer.id === id ? { ...offer, status: newStatus } : offer
    ));
    // TODO: Implémenter l'appel API pour mettre à jour le statut
  };

  const deleteOffer = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      setOffers(offers.filter(offer => offer.id !== id));
      // TODO: Implémenter l'appel API pour supprimer l'offre
    }
  };

  const duplicateOffer = (id) => {
    const offerToDuplicate = offers.find(offer => offer.id === id);
    const newOffer = {
      ...offerToDuplicate,
      id: Math.max(...offers.map(o => parseInt(o.id) || 0)) + 1,
      title: `${offerToDuplicate.title} (Copie)`,
      status: 'draft',
      applications: 0,
      views: 0,
      publishedDate: new Date().toISOString().split('T')[0]
    };
    setOffers([...offers, newOffer]);
    // TODO: Implémenter l'appel API pour créer l'offre dupliquée
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      navigate('/connexion');
    }
  };

  const user = getUserFromToken();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h5>Chargement des données...</h5>
        </div>
      </div>
    );
  }

  // Interface principale de gestion des offres
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="text-white mb-2">
                  <i className="bi bi-briefcase-fill me-3"></i>
                  Gestion des Offres & Candidatures
                </h1>
                <p className="text-white-50 mb-0">Gérez vos offres d'emploi et suivez les candidatures</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <button
                  className="btn btn-light btn-lg"
                  onClick={() => navigate('/OffresPost')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer une offre
                </button>
                
                {/* Menu déroulant profil */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-light btn-lg dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.email || 'Mon Compte'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => navigate('/UserProfile')}
                      >
                        <i className="bi bi-person-gear me-2"></i>
                        Mon Profil
                      </button>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <i className="bi bi-bar-chart me-2"></i>
                        Statistiques
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <i className="bi bi-gear me-2"></i>
                        Paramètres
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
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="row mb-4">
          {[
            { title: 'Offres Actives', value: offers.filter(o => o.status === 'active').length, icon: 'check-circle', color: 'success' },
            { title: 'Total Candidatures', value: applications.length, icon: 'people', color: 'info' },
            { title: 'En Attente', value: applications.filter(a => a.status === 'pending').length, icon: 'clock', color: 'warning' },
            { title: 'Acceptées', value: applications.filter(a => a.status === 'accepted').length, icon: 'check-square', color: 'success' }
          ].map((stat, index) => (
            <div key={index} className="col-md-3 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className={`text-${stat.color} mb-2`} style={{ fontSize: '2rem' }}>
                    <i className={`bi bi-${stat.icon}`}></i>
                  </div>
                  <h3 className="mb-1">{stat.value}</h3>
                  <p className="text-muted mb-0 small">{stat.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Candidatures Récentes */}
        {applications.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Candidatures Récentes ({applications.length})
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Candidat</th>
                          <th>Poste</th>
                          <th>Statut</th>
                          <th>Date</th>
                          <th>CV</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 10).map(app => {
                          const statusBadge = getApplicationStatusBadge(app.status);
                          return (
                            <tr key={app.id}>
                              <td>
                                <div>
                                  <strong>{app.candidate_name || 'Nom non disponible'}</strong>
                                  <br />
                                  <small className="text-muted">{app.candidate_email}</small>
                                </div>
                              </td>
                              <td>
                                <strong>{app.job_title || 'Poste non spécifié'}</strong>
                              </td>
                              <td>
                                <span className={`badge ${statusBadge.class}`}>
                                  <i className={`bi bi-${statusBadge.icon} me-1`}></i>
                                  {statusBadge.text}
                                </span>
                              </td>
                              <td>
                                {new Date(app.applied_at).toLocaleDateString('fr-CA')}
                              </td>
                              <td>
                                {app.cv_path ? (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleDownloadCV(app.cv_path)}
                                  >
                                    <i className="bi bi-download me-1"></i>
                                    Télécharger
                                  </button>
                                ) : (
                                  <span className="text-muted">CV IA</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => setSelectedApplication(app)}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Gérer
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher par titre, entreprise ou lieu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex gap-2">
                      {[
                        { key: 'all', label: 'Toutes', count: offers.length },
                        { key: 'active', label: 'Actives', count: offers.filter(o => o.status === 'active').length },
                        { key: 'paused', label: 'En pause', count: offers.filter(o => o.status === 'paused').length },
                        { key: 'expired', label: 'Expirées', count: offers.filter(o => o.status === 'expired').length }
                      ].map(filterOption => (
                        <button
                          key={filterOption.key}
                          className={`btn ${filter === filterOption.key ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                          onClick={() => setFilter(filterOption.key)}
                        >
                          {filterOption.label} ({filterOption.count})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des offres */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Mes Offres d'Emploi
                </h5>
              </div>
              <div className="card-body p-0">
                {filteredOffers.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h5 className="text-muted">
                      {offers.length === 0 ? 'Aucune offre créée' : 'Aucune offre trouvée'}
                    </h5>
                    <p className="text-muted">
                      {offers.length === 0 ? (
                        <>
                          Commencez par créer votre première offre d'emploi<br />
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => navigate('/OffresPost')}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Créer une offre
                          </button>
                        </>
                      ) : (
                        'Essayez de modifier vos critères de recherche'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Offre</th>
                          <th>Statut</th>
                          <th>Candidatures</th>
                          <th>Vues</th>
                          <th>Publié le</th>
                          <th>Expire le</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOffers.map(offer => {
                          const statusBadge = getStatusBadge(offer.status);
                          return (
                            <tr key={offer.id}>
                              <td>
                                <div>
                                  <h6 className="mb-1">{offer.title}</h6>
                                  <small className="text-muted">
                                    {offer.company} • {offer.location} • {offer.type}
                                  </small>
                                  <br />
                                  <small className="text-success fw-bold">{offer.salary}</small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${statusBadge.class}`}>
                                  {statusBadge.text}
                                </span>
                              </td>
                              <td>
                                <strong className={offer.applications > 0 ? 'text-success' : ''}>{offer.applications}</strong>
                                <small className="text-muted d-block">candidatures</small>
                              </td>
                              <td>
                                <strong>{offer.views}</strong>
                                <small className="text-muted d-block">vues</small>
                              </td>
                              <td>{new Date(offer.publishedDate).toLocaleDateString('fr-CA')}</td>
                              <td>{new Date(offer.expiryDate).toLocaleDateString('fr-CA')}</td>
                              <td>
                                <div className="dropdown">
                                  <button
                                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                  >
                                    Actions
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => alert(`Voir les détails de: ${offer.title}`)}
                                      >
                                        <i className="bi bi-eye me-2"></i>Voir
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => alert(`Modifier: ${offer.title}`)}
                                      >
                                        <i className="bi bi-pencil me-2"></i>Modifier
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => duplicateOffer(offer.id)}
                                      >
                                        <i className="bi bi-files me-2"></i>Dupliquer
                                      </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {offer.status === 'active' && (
                                      <li>
                                        <button
                                          className="dropdown-item text-warning"
                                          onClick={() => updateOfferStatus(offer.id, 'paused')}
                                        >
                                          <i className="bi bi-pause me-2"></i>Mettre en pause
                                        </button>
                                      </li>
                                    )}
                                    {offer.status === 'paused' && (
                                      <li>
                                        <button
                                          className="dropdown-item text-success"
                                          onClick={() => updateOfferStatus(offer.id, 'active')}
                                        >
                                          <i className="bi bi-play me-2"></i>Réactiver
                                        </button>
                                      </li>
                                    )}
                                    <li>
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => deleteOffer(offer.id)}
                                      >
                                        <i className="bi bi-trash me-2"></i>Supprimer
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de gestion des candidatures */}
      {selectedApplication && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px' }}>
              <div className="modal-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                <h5 className="modal-title">
                  <i className="bi bi-person-check me-2"></i>
                  Gestion de candidature
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setSelectedApplication(null);
                    setFeedback('');
                  }}
                ></button>
              </div>
              
              <div className="modal-body p-4">
                {/* Informations sur le candidat */}
                <div className="alert alert-info mb-4">
                  <h6 className="alert-heading">
                    <i className="bi bi-person me-2"></i>
                    {selectedApplication.candidate_name || 'Nom non disponible'}
                  </h6>
                  <p className="mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    Email: {selectedApplication.candidate_email}
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-briefcase me-2"></i>
                    Poste: {selectedApplication.job_title}
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-calendar me-2"></i>
                    Candidature envoyée le: {new Date(selectedApplication.applied_at).toLocaleDateString('fr-CA')}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-file-earmark me-2"></i>
                    Type de CV: {selectedApplication.cv_type === 'generated' ? 'Généré par IA' : 'Téléchargé'}
                  </p>
                </div>

                {/* Lettre de motivation */}
                {selectedApplication.cover_letter && (
                  <div className="mb-4">
                    <h6 className="fw-semibold">Lettre de motivation</h6>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  </div>
                )}

                {/* CV téléchargeable */}
                {selectedApplication.cv_path && (
                  <div className="mb-4">
                    <h6 className="fw-semibold">CV</h6>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleDownloadCV(selectedApplication.cv_path)}
                    >
                      <i className="bi bi-download me-2"></i>
                      Télécharger le CV ({selectedApplication.cv_path})
                    </button>
                  </div>
                )}

                {/* Statut actuel */}
                <div className="mb-4">
                  <h6 className="fw-semibold">Statut actuel</h6>
                  {(() => {
                    const statusBadge = getApplicationStatusBadge(selectedApplication.status);
                    return (
                      <span className={`badge ${statusBadge.class} fs-6`}>
                        <i className={`bi bi-${statusBadge.icon} me-1`}></i>
                        {statusBadge.text}
                      </span>
                    );
                  })()}
                </div>

                {/* Feedback */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Commentaire (optionnel)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="form-control"
                    placeholder="Ajoutez un commentaire pour le candidat..."
                    style={{ borderRadius: '8px' }}
                  />
                  <div className="form-text">
                    Ce commentaire sera visible par le candidat
                  </div>
                </div>

                {/* Feedback existant */}
                {selectedApplication.feedback && (
                  <div className="mb-4">
                    <h6 className="fw-semibold">Commentaire précédent</h6>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0">{selectedApplication.feedback}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedApplication(null);
                    setFeedback('');
                  }}
                  disabled={isUpdatingStatus}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Annuler
                </button>
                
                {selectedApplication.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdatingStatus}
                    className="btn btn-danger"
                  >
                    {isUpdatingStatus ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-x-circle me-1"></i>
                    )}
                    Refuser
                  </button>
                )}
                
                {selectedApplication.status !== 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('accepted')}
                    disabled={isUpdatingStatus}
                    className="btn btn-success"
                  >
                    {isUpdatingStatus ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-check-circle me-1"></i>
                    )}
                    Accepter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersManagement;