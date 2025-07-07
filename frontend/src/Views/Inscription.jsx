import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Inscription = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'candidat'
  });
  const [erreur, setErreur] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setIsLoading(true);

    try {
      await register(form.email, form.password, form.role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);
    } catch (err) {
      setErreur("Erreur lors de l'inscription. Cet email est peut-être déjà utilisé.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            
            <div className="card shadow-lg border-0" style={{
              borderRadius: '20px',
              overflow: 'hidden',
              animation: 'slideUp 0.6s ease-out'
            }}>
              
              {/* Header avec logo */}
              <div style={{
                background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
                padding: '40px 30px',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animation: 'float 6s ease-in-out infinite'
                }}></div>
                
                <Link to="/" className="text-decoration-none">
                  <div className="d-flex align-items-center justify-content-center mb-3" style={{position: 'relative', zIndex: 2}}>
                    <i className="bi bi-briefcase-fill me-3 text-white" style={{fontSize: '40px'}}></i>
                    <h1 style={{margin: 0, fontWeight: 'bold', fontSize: '2.5rem', color: 'white'}}>NextStep</h1>
                  </div>
                </Link>
                <p style={{margin: 0, fontSize: '1.1rem', opacity: 0.9, position: 'relative', zIndex: 2}}>
                  Rejoignez notre communauté de talents
                </p>
              </div>

              {/* Corps du formulaire */}
              <div className="card-body p-5">
                {success ? (
                  <div className="text-center">
                    <div className="mb-4" style={{fontSize: '4rem', color: '#10b981'}}>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3 className="text-success mb-3">Inscription réussie !</h3>
                    <p className="text-muted mb-4">
                      Votre compte a été créé avec succès. Redirection vers la connexion...
                    </p>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="fw-bold text-primary mb-2">Créer un compte</h2>
                      <p className="text-muted">
                        Vous avez déjà un compte ? 
                        <Link to="/connexion" className="text-primary text-decoration-none fw-semibold ms-1">
                          Se connecter
                        </Link>
                      </p>
                    </div>

                    {/* Sélection du type de compte */}
                    <div className="mb-4">
                      <p className="fw-semibold text-center mb-3">Je suis :</p>
                      <div className="row g-3">
                        <div className="col-6">
                          <label className={`card h-100 ${form.role === 'candidat' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`} 
                                 style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
                            <div className="card-body text-center p-3">
                              <input
                                type="radio"
                                name="role"
                                value="candidat"
                                checked={form.role === 'candidat'}
                                onChange={handleChange}
                                className="form-check-input d-none"
                              />
                              <i className={`bi bi-person-circle fs-1 mb-2 ${form.role === 'candidat' ? 'text-primary' : 'text-muted'}`}></i>
                              <h6 className={`mb-1 ${form.role === 'candidat' ? 'text-primary' : 'text-muted'}`}>Candidat</h6>
                              <small className="text-muted">Je cherche un emploi</small>
                            </div>
                          </label>
                        </div>
                        <div className="col-6">
                          <label className={`card h-100 ${form.role === 'recruteur' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`} 
                                 style={{cursor: 'pointer', transition: 'all 0.3s ease'}}>
                            <div className="card-body text-center p-3">
                              <input
                                type="radio"
                                name="role"
                                value="recruteur"
                                checked={form.role === 'recruteur'}
                                onChange={handleChange}
                                className="form-check-input d-none"
                              />
                              <i className={`bi bi-building fs-1 mb-2 ${form.role === 'recruteur' ? 'text-primary' : 'text-muted'}`}></i>
                              <h6 className={`mb-1 ${form.role === 'recruteur' ? 'text-primary' : 'text-muted'}`}>Recruteur</h6>
                              <small className="text-muted">Je recrute des talents</small>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Formulaire d'inscription */}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-envelope me-2"></i>Adresse e-mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control form-control-lg"
                          placeholder="votre@email.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            transition: 'all 0.3s ease',
                            fontSize: '16px',
                            padding: '16px'
                          }}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-lock me-2"></i>Mot de passe
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control form-control-lg"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            transition: 'all 0.3s ease',
                            fontSize: '16px',
                            padding: '16px'
                          }}
                        />
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Au moins 6 caractères recommandés
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="terms"
                            required
                            style={{transform: 'scale(1.2)'}}
                          />
                          <label className="form-check-label fw-medium" htmlFor="terms">
                            J'accepte les <a href="#" className="text-primary">conditions d'utilisation</a> et la <a href="#" className="text-primary">politique de confidentialité</a>
                          </label>
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary btn-lg w-100 mb-4" 
                        type="submit"
                        disabled={isLoading}
                        style={{
                          background: 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '16px',
                          padding: '16px',
                          boxShadow: '0 4px 15px rgba(51, 102, 255, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Création du compte...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            CRÉER MON COMPTE
                          </>
                        )}
                      </button>

                      {erreur && (
                        <div className="alert alert-danger d-flex align-items-center" style={{borderRadius: '12px'}}>
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {erreur}
                        </div>
                      )}
                    </form>

                    {/* Séparateur */}
                    <div className="text-center my-4">
                      <div className="d-flex align-items-center">
                        <hr className="flex-grow-1" />
                        <span className="px-3 text-muted fw-medium">ou inscrivez-vous avec</span>
                        <hr className="flex-grow-1" />
                      </div>
                    </div>

                    {/* Boutons sociaux */}
                    <div className="row g-3">
                      <div className="col-6">
                        <button 
                          className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center"
                          style={{
                            borderRadius: '12px',
                            padding: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="bi bi-facebook me-2"></i>
                          Facebook
                        </button>
                      </div>
                      <div className="col-6">
                        <button 
                          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                          style={{
                            borderRadius: '12px',
                            padding: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="bi bi-google me-2"></i>
                          Google
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white-50 small">
                © 2025 NextStep. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .form-control:focus {
          border-color: #3366ff !important;
          box-shadow: 0 0 0 3px rgba(51, 102, 255, 0.1) !important;
          transform: translateY(-2px);
          outline: none !important;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-primary:hover {
          box-shadow: 0 8px 25px rgba(51, 102, 255, 0.3) !important;
        }

        .btn-outline-dark:hover,
        .btn-outline-danger:hover {
          transform: translateY(-2px);
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .text-primary:hover {
          text-decoration: underline !important;
        }

        @media (max-width: 768px) {
          .card-body {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Inscription;