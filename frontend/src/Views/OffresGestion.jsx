import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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


  const [offers, setOffers] = useState([
    {
      id: 1,
      title: 'Développeur Full-stack Senior',
      company: 'Tech Innovations',
      location: 'Lyon',
      type: 'CDI',
      salary: '55-65k€',
      status: 'active',
      applications: 24,
      views: 156,
      publishedDate: '2025-06-20',
      expiryDate: '2025-07-20'
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'Paris',
      type: 'CDI',
      salary: '60-70k€',
      status: 'active',
      applications: 18,
      views: 89,
      publishedDate: '2025-06-18',
      expiryDate: '2025-07-18'
    },
    {
      id: 3,
      title: 'Responsable Marketing Digital',
      company: 'Creative Solutions',
      location: 'Remote',
      type: 'CDI',
      salary: 'À négocier',
      status: 'paused',
      applications: 12,
      views: 45,
      publishedDate: '2025-06-15',
      expiryDate: '2025-07-15'
    },
    {
      id: 4,
      title: 'Ingénieur DevOps',
      company: 'Cloud Tech',
      location: 'Marseille',
      type: 'CDI',
      salary: '50-60k€',
      status: 'expired',
      applications: 8,
      views: 32,
      publishedDate: '2025-05-20',
      expiryDate: '2025-06-20'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-success', text: 'Actif' },
      paused: { class: 'bg-warning', text: 'En pause' },
      expired: { class: 'bg-danger', text: 'Expiré' },
      draft: { class: 'bg-secondary', text: 'Brouillon' }
    };
    return statusConfig[status] || statusConfig.active;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesFilter = filter === 'all' || offer.status === filter;
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateOfferStatus = (id, newStatus) => {
    setOffers(offers.map(offer =>
      offer.id === id ? { ...offer, status: newStatus } : offer
    ));
  };

  const deleteOffer = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      setOffers(offers.filter(offer => offer.id !== id));
    }
  };

  const duplicateOffer = (id) => {
    const offerToDuplicate = offers.find(offer => offer.id === id);
    const newOffer = {
      ...offerToDuplicate,
      id: Math.max(...offers.map(o => o.id)) + 1,
      title: `${offerToDuplicate.title} (Copie)`,
      status: 'draft',
      applications: 0,
      views: 0,
      publishedDate: new Date().toISOString().split('T')[0]
    };
    setOffers([...offers, newOffer]);
  };



  // Fonction de déconnexion
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      navigate('/connexion');
    }
  };

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
                  Gestion des Offres
                </h1>
                <p className="text-white-50 mb-0">Gérez vos offres d'emploi et suivez leurs performances</p>
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
                    Mon Compte
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

        {/* Statistiques */}
        <div className="row mb-4">
          {[
            { title: 'Offres Actives', value: offers.filter(o => o.status === 'active').length, icon: 'check-circle', color: 'success' },
            { title: 'Total Candidatures', value: offers.reduce((acc, o) => acc + o.applications, 0), icon: 'people', color: 'info' },
            { title: 'Vues Totales', value: offers.reduce((acc, o) => acc + o.views, 0), icon: 'eye', color: 'warning' },
            { title: 'Offres Expirées', value: offers.filter(o => o.status === 'expired').length, icon: 'clock', color: 'danger' }
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
              <div className="card-body p-0">
                {filteredOffers.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h5 className="text-muted">Aucune offre trouvée</h5>
                    <p className="text-muted">Essayez de modifier vos critères de recherche</p>
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
                                <strong>{offer.applications}</strong>
                                <small className="text-muted d-block">candidatures</small>
                              </td>
                              <td>
                                <strong>{offer.views}</strong>
                                <small className="text-muted d-block">vues</small>
                              </td>
                              <td>{new Date(offer.publishedDate).toLocaleDateString('fr-FR')}</td>
                              <td>{new Date(offer.expiryDate).toLocaleDateString('fr-FR')}</td>
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
    </div>
  );
};

export default OffersManagement;