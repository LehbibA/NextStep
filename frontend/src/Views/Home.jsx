import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Home = () => {
  const navigate = useNavigate();

  // Fonction pour décoder un token JWT
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

  // Redirection si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = getUserFromToken();
      if (user && user.exp > Date.now() / 1000) { // Vérifier si le token n'est pas expiré
        // Rediriger selon le rôle
        if (user.role === 'recruteur') {
          navigate('/OffresGestion');
        } else {
          navigate('/offres');
        }
      } else {
        // Token expiré, le supprimer
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* NAVBAR MODERNE */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container">
          <a className="navbar-brand fw-bold fs-3 text-primary" href="#">
            <i className="bi bi-briefcase-fill me-2"></i>NextStep
          </a>
          
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link fw-semibold text-dark" href="#accueil">Accueil</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold text-dark" href="#fonctionnalites">Fonctionnalités</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold text-dark" href="#temoignages">Témoignages</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold text-dark" href="#contact">Contact</a>
              </li>
            </ul>
            <div className="d-flex gap-2">
              <a className="btn btn-outline-primary fw-semibold" href="/connexion" style={{ borderRadius: '8px' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Se connecter
              </a>
              <a className="btn btn-primary fw-semibold" href="/inscription" style={{ 
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)',
                border: 'none'
              }}>
                <i className="bi bi-person-plus me-2"></i>S'inscrire
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* SECTION HERO MODERNE */}
      <section id="accueil" style={{
        background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animation de fond */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="badge bg-white bg-opacity-20 text-white px-3 py-2 rounded-pill mb-4">
                <i className="bi bi-stars me-2"></i>Plateforme #1 pour l'emploi intelligent
              </div>
              <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                Connecter les <span style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>talents</span> et les opportunités, grâce à l'IA
              </h1>
              <p className="lead mb-4" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                La plateforme intelligente pour postuler ou recruter efficacement. 
                Accélérez votre parcours professionnel avec NextStep.
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                <a href="/inscription" className="btn btn-light btn-lg fw-semibold" style={{
                  borderRadius: '12px',
                  padding: '16px 32px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Commencer gratuitement
                </a>
                <button className="btn btn-outline-light btn-lg fw-semibold" style={{
                  borderRadius: '12px',
                  padding: '16px 32px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <i className="bi bi-play-circle me-2"></i>
                  Voir la démo
                </button>
              </div>

              {/* Mini statistiques */}
              <div className="d-flex flex-wrap gap-4 text-center text-sm-start">
                <div>
                  <div className="fw-bold fs-4">50K+</div>
                  <small style={{ opacity: 0.8 }}>Utilisateurs actifs</small>
                </div>
                <div>
                  <div className="fw-bold fs-4">15K+</div>
                  <small style={{ opacity: 0.8 }}>Offres d'emploi</small>
                </div>
                <div>
                  <div className="fw-bold fs-4">98%</div>
                  <small style={{ opacity: 0.8 }}>Taux de satisfaction</small>
                </div>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <div className="position-relative">
                <img 
                  src="/assets/home-side-bg.png" 
                  alt="Intelligence Artificielle pour l'emploi" 
                  className="img-fluid"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))',
                    borderRadius: '20px'
                  }}
                />
                
                {/* Badge IA flottant */}
                <div className="position-absolute top-0 end-0" style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '15px',
                  padding: '10px 15px',
                  margin: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <div className="d-flex align-items-center">
                    <div className="text-primary me-2" style={{fontSize: '1.5rem'}}>🤖</div>
                    <div>
                      <small className="fw-bold text-primary">IA Avancée</small>
                      <br />
                      <small className="text-muted">Matching intelligent</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIQUES MODERNES */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div className="row text-center">
            {[
              { number: '1,750+', label: 'Offres d\'emploi', icon: 'bi-briefcase' },
              { number: '315K', label: 'CV générés', icon: 'bi-file-earmark-text' },
              { number: '650K+', label: 'Employeurs', icon: 'bi-building' },
              { number: '120K', label: 'Témoignages', icon: 'bi-chat-quote' }
            ].map((stat, index) => (
              <div key={index} className="col-6 col-md-3 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                      <i className={stat.icon}></i>
                    </div>
                    <h3 className="fw-bold text-primary mb-2">{stat.number}</h3>
                    <p className="text-muted mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSTES POPULAIRES */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">Postes vacants les plus populaires</h2>
          <p className="lead text-muted">Découvrez les opportunités les plus recherchées du moment</p>
        </div>
        <div className="row g-4">
          {[
            ['Développeur Logiciel', 320, 'bi-code-slash'],
            ['Data Scientist', 220, 'bi-graph-up'],
            ['Responsable Financier', 156, 'bi-calculator'],
            ['Analyste en Management', 117, 'bi-clipboard-data'],
            ['Orthodontistes', 280, 'bi-heart-pulse'],
            ['IT Manager', 963, 'bi-gear'],
          ].map(([title, count, icon], i) => (
            <div className="col-md-4 col-lg-2" key={i}>
              <div className="card h-100 border-0 shadow-sm" style={{
                borderRadius: '15px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div className="card-body text-center p-4">
                  <div className="text-primary mb-3" style={{ fontSize: '2rem' }}>
                    <i className={icon}></i>
                  </div>
                  <h6 className="card-title fw-bold mb-2">{title}</h6>
                  <p className="text-muted small mb-0">{count.toLocaleString()} postes ouverts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="fonctionnalites" className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-primary mb-3">Comment fonctionne NextStep ?</h2>
            <p className="lead text-muted">Un processus simple et efficace pour tous</p>
          </div>

          {/* Pour les candidats */}
          <div className="mb-5">
            <h3 className="text-center mb-4 text-primary">
              <i className="bi bi-person-circle me-2"></i>Pour les candidats
            </h3>
            <div className="row justify-content-center">
              {[
                ["Créer un compte", "👤", "Inscription rapide en 2 minutes"],
                ["Générer un CV avec l'IA", "🧠", "CV optimisé automatiquement"],
                ["Découvrir des offres", "🔍", "Recommandations personnalisées"],
                ["Contacter les recruteurs", "💬", "Communication directe"],
              ].map(([title, icon, desc], index) => (
                <div className="col-md-3 mb-4" key={index}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                    <div className="card-body text-center p-4">
                      <div className="position-relative mb-3">
                        <div className="badge bg-primary text-white rounded-circle position-absolute top-0 start-0" 
                             style={{ width: '30px', height: '30px', lineHeight: '20px' }}>
                          {index + 1}
                        </div>
                        <div style={{ fontSize: '3rem', marginTop: '10px' }}>{icon}</div>
                      </div>
                      <h6 className="fw-bold mb-2">{title}</h6>
                      <p className="text-muted small mb-0">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pour les recruteurs */}
          <div>
            <h3 className="text-center mb-4 text-primary">
              <i className="bi bi-building me-2"></i>Pour les recruteurs
            </h3>
            <div className="row justify-content-center">
              {[
                ["Créer un compte entreprise", "🏢", "Profil entreprise complet"],
                ["Publier une offre", "✍️", "Rédaction assistée par IA"],
                ["Filtrer les profils", "🎯", "Algorithmes de matching"],
                ["Contacter les candidats", "📨", "Gestion des candidatures"],
              ].map(([title, icon, desc], index) => (
                <div className="col-md-3 mb-4" key={index}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                    <div className="card-body text-center p-4">
                      <div className="position-relative mb-3">
                        <div className="badge bg-success text-white rounded-circle position-absolute top-0 start-0" 
                             style={{ width: '30px', height: '30px', lineHeight: '20px' }}>
                          {index + 1}
                        </div>
                        <div style={{ fontSize: '3rem', marginTop: '10px' }}>{icon}</div>
                      </div>
                      <h6 className="fw-bold mb-2">{title}</h6>
                      <p className="text-muted small mb-0">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section id="temoignages" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-3">Ce que disent nos utilisateurs</h2>
          <p className="lead text-muted">Découvrez les témoignages de notre communauté</p>
        </div>
        <div className="row">
          {[
            ['Robert Fox', 'Développeur Full-Stack', 'Grâce à NextStep, j\'ai trouvé mon job de rêve en 2 semaines ! L\'IA a parfaitement ciblé mes compétences.', '⭐⭐⭐⭐⭐'],
            ['Bessie Cooper', 'Directrice RH', 'Super plateforme pour trouver des talents ! Le matching automatique nous fait gagner énormément de temps.', '⭐⭐⭐⭐⭐'],
            ['Jane Cooper', 'Designer UX', 'Interface intuitive et résultats rapides. J\'ai reçu 5 propositions d\'entretien en une semaine !', '⭐⭐⭐⭐⭐'],
          ].map(([name, role, comment, rating], i) => (
            <div className="col-md-4 mb-4" key={i}>
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-person-fill text-white fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{name}</h6>
                      <small className="text-muted">{role}</small>
                    </div>
                  </div>
                  <p className="mb-3" style={{ fontStyle: 'italic' }}>"{comment}"</p>
                  <div className="text-warning">{rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTIONS */}
      <section className="container py-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
            }}>
              <div className="card-body p-5 text-center">
                <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>
                  <i className="bi bi-person-badge"></i>
                </div>
                <h4 className="fw-bold text-primary mb-3">Devenir Candidat</h4>
                <p className="mb-4">Rejoignez la plateforme pour accéder à des milliers d'offres ciblées et boostez votre carrière.</p>
                <a href="/inscription" className="btn btn-primary btn-lg fw-semibold" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-arrow-right me-2"></i>S'inscrire gratuitement
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)'
            }}>
              <div className="card-body p-5 text-center text-white">
                <div className="mb-3" style={{ fontSize: '3rem' }}>
                  <i className="bi bi-building"></i>
                </div>
                <h4 className="fw-bold mb-3">Devenir Employeur</h4>
                <p className="mb-4" style={{ opacity: 0.9 }}>Postez des offres et trouvez les meilleurs talents avec l'aide de notre IA avancée.</p>
                <a href="/inscription" className="btn btn-light btn-lg fw-semibold" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-rocket-takeoff me-2"></i>Commencer maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MODERNE */}
      <footer id="contact" className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold mb-3">
                <i className="bi bi-briefcase-fill me-2"></i>NextStep
              </h4>
              <p className="text-white-50 mb-4">
                La plateforme intelligente qui révolutionne le recrutement grâce à l'IA. 
                Connectez-vous à votre avenir professionnel.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white-50 fs-4"><i className="bi bi-facebook"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="bi bi-twitter"></i></a>
                <a href="#" className="text-white-50 fs-4"><i className="bi bi-instagram"></i></a>
              </div>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Plateforme</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Accueil</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Fonctionnalités</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Tarifs</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">À propos</a></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Candidats</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Rechercher emploi</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Créer un CV</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Conseils carrière</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Salaires</a></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Employeurs</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Publier une offre</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Rechercher talents</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Solutions RH</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Analytics</a></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Support</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Centre d'aide</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Contact</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Confidentialité</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">CGU</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-4" style={{ borderColor: '#495057' }} />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-white-50 mb-0">© 2025 NextStep. Tous droits réservés.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-white-50 mb-0">
                Fait avec <span className="text-danger">❤️</span> pour révolutionner l'emploi
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .navbar-nav .nav-link:hover {
          color: #3366ff !important;
        }

        .text-white-50:hover {
          color: white !important;
        }

        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }
          
          .hero-stats {
            flex-direction: column;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;