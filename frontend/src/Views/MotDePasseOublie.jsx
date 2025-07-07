import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'envoi avec délai
    setTimeout(() => {
      setConfirmation(true);
      setIsLoading(false);
    }, 2000);
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
                  Récupération de votre mot de passe
                </p>
              </div>

              {/* Corps du formulaire */}
              <div className="card-body p-5">
                {!confirmation ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="mb-3" style={{fontSize: '3rem', color: '#3366ff'}}>
                        <i className="bi bi-key"></i>
                      </div>
                      <h2 className="fw-bold text-primary mb-2">Mot de passe oublié ?</h2>
                      <p className="text-muted">
                        Pas de problème ! Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-envelope me-2"></i>Adresse e-mail
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          Nous vous enverrons un lien de réinitialisation à cette adresse
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-100 mb-4"
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
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            ENVOYER LE LIEN DE RÉINITIALISATION
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <Link 
                          to="/connexion" 
                          className="text-primary text-decoration-none fw-semibold"
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Retour à la connexion
                        </Link>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center">
                    {/* Animation de succès */}
                    <div className="mb-4" style={{fontSize: '4rem', color: '#10b981'}}>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    
                    <h3 className="text-success mb-3">E-mail envoyé !</h3>
                    
                    <div className="alert alert-success border-0" style={{
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      border: '1px solid #6ee7b7'
                    }}>
                      <div className="mb-3">
                        <i className="bi bi-envelope-check fs-2 text-success"></i>
                      </div>
                      <p className="mb-2">
                        Un lien de réinitialisation a été envoyé à :
                      </p>
                      <strong className="text-success fs-5">{email}</strong>
                      <hr className="my-3" />
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Vérifiez également votre dossier spam si vous ne recevez pas l'e-mail
                      </small>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <Link 
                        to="/connexion" 
                        className="btn btn-primary btn-lg"
                        style={{
                          background: 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '600',
                          padding: '12px 24px'
                        }}
                      >
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Retour à la connexion
                      </Link>
                      
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setConfirmation(false);
                          setEmail('');
                        }}
                        style={{
                          borderRadius: '12px',
                          fontWeight: '600',
                          padding: '12px 24px'
                        }}
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Renvoyer un e-mail
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="card mt-4 border-0 shadow-sm" style={{borderRadius: '15px', background: 'rgba(255,255,255,0.9)'}}>
              <div className="card-body p-4">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="bi bi-shield-check me-2"></i>
                  Conseils de sécurité
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-check2 text-success me-2"></i>
                      Utilisez un mot de passe unique
                    </small>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-check2 text-success me-2"></i>
                      Mélangez lettres, chiffres et symboles
                    </small>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-check2 text-success me-2"></i>
                      Au moins 8 caractères
                    </small>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-check2 text-success me-2"></i>
                      Évitez les informations personnelles
                    </small>
                  </div>
                </div>
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

        .text-primary:hover {
          text-decoration: underline !important;
        }

        .alert {
          animation: slideUp 0.5s ease-out;
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

export default MotDePasseOublie;