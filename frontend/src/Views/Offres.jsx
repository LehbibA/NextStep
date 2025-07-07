import React, { useState, useEffect } from 'react';
import { getOffres } from '../api';
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
            <a href="#" className="nav-link text-white fw-semibold">Paramètres</a>
            <span className="navbar-text text-white-50 me-3">
              Espace Candidat
            </span>
            
            {/* Menu déroulant profil */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-2"></i>
                Mon Compte
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="/UserProfile">
                    <i className="bi bi-person-gear me-2"></i>
                    Mon Profil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-heart me-2"></i>
                    Mes Favoris
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Mes Candidatures
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
                        <i className="bi bi-currency-euro text-success me-2"></i>
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
                      <button className="btn btn-primary fw-semibold" style={{ 
                        borderRadius: '10px',
                        padding: '12px'
                      }}>
                        <i className="bi bi-eye me-2"></i>
                        Voir l'offre
                      </button>
                      <button className="btn btn-outline-success fw-semibold" style={{ 
                        borderRadius: '10px',
                        padding: '12px'
                      }}>
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