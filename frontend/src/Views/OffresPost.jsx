import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JobPostingForm = () => {
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

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    description: '',
    requirements: '',
    benefits: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateWithAI = () => {
    if (!formData.jobTitle || !formData.company) {
      alert('Veuillez d\'abord renseigner le titre du poste et l\'entreprise pour utiliser l\'IA.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setFormData({
        ...formData,
        description: `Nous recherchons un(e) ${formData.jobTitle} passionné(e) pour rejoindre l'équipe dynamique de ${formData.company}. 

Dans ce rôle, vous serez responsable de :
• Développer et maintenir des applications performantes
• Collaborer avec les équipes produit et design
• Participer à l'architecture technique des projets
• Mentorer les développeurs junior

Vous évoluerez dans un environnement stimulant où l'innovation et la qualité sont au cœur de nos préoccupations.`,

        requirements: `Compétences techniques :
• Maîtrise des technologies web modernes
• Expérience avec les frameworks populaires
• Connaissance des bonnes pratiques de développement
• Capacité à travailler en méthodologie Agile

Soft skills :
• Excellent esprit d'équipe
• Curiosité technique et veille technologique
• Capacité d'adaptation et d'apprentissage
• Communication claire et efficace`,

        benefits: `• Télétravail hybride (2-3 jours/semaine)
• Tickets restaurant et mutuelle premium
• Budget formation et conférences
• Équipement informatique de qualité
• Ambiance startup dynamique
• Perspectives d'évolution rapides`
      });

      setIsGenerating(false);
      setAiSuccess(true);

      setTimeout(() => {
        setAiSuccess(false);
      }, 2000);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données du formulaire:', formData);
    alert('Offre publiée avec succès !');
    // Rediriger vers la gestion des offres après publication
    navigate('/OffresGestion');
  };

  const handleBackToManagement = () => {
    navigate('/OffresGestion');
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      navigate('/connexion');
    }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div style={{
        background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              
              <div className="card shadow-lg border-0 mb-0" style={{
                borderRadius: '20px',
                overflow: 'hidden',
                animation: 'slideUp 0.6s ease-out'
              }}>
                {/* Header avec bouton retour */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e4fff 0%, #3366ff 100%)',
                  padding: '30px',
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
                  
                  {/* Bouton retour */}
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleBackToManagement}
                    style={{ 
                      position: 'absolute', 
                      left: '20px', 
                      top: '20px',
                      zIndex: 3
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour à la gestion
                  </button>

                  {/* Bouton déconnexion */}
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                    style={{ 
                      position: 'absolute', 
                      right: '20px', 
                      top: '20px',
                      zIndex: 3
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Déconnexion
                  </button>
                  
                  <div className="d-flex align-items-center justify-content-center mb-3" style={{position: 'relative', zIndex: 2}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white" style={{marginRight: '12px'}}>
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                    </svg>
                    <h1 style={{margin: 0, fontWeight: 'bold'}}>NextStep</h1>
                  </div>
                  <h2 style={{margin: 0, fontWeight: '600', position: 'relative', zIndex: 2}}>
                    Publier une nouvelle offre
                  </h2>
                </div>

                {/* Body */}
                <div className="card-body p-4 p-md-5">
                  
                  {/* Titre du poste */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Titre du poste <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Ex: Développeur Full-stack Senior"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        padding: '16px'
                      }}
                    />
                    <div className="form-text">
                      Soyez précis et attractif pour attirer les meilleurs talents
                    </div>
                  </div>

                  {/* Entreprise et Localisation */}
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label fw-semibold">
                        Entreprise <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Nom de votre entreprise"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          padding: '16px'
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Localisation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Paris, Lyon, Remote..."
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          padding: '16px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Type de contrat et Expérience */}
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label fw-semibold">
                        Type de contrat <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          padding: '16px'
                        }}
                      >
                        <option value="">Choisir...</option>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Apprentissage">Apprentissage</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Niveau d'expérience <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          padding: '16px'
                        }}
                      >
                        <option value="">Choisir...</option>
                        <option value="Junior (0-2 ans)">Junior (0-2 ans)</option>
                        <option value="Confirmé (3-5 ans)">Confirmé (3-5 ans)</option>
                        <option value="Senior (5+ ans)">Senior (5+ ans)</option>
                        <option value="Lead/Manager">Lead/Manager</option>
                      </select>
                    </div>
                  </div>

                  {/* Salaire */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Fourchette salariale
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="Ex: 45-55k€ ou À négocier"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        padding: '16px'
                      }}
                    />
                    <div className="form-text">
                      Optionnel - Les offres avec salaire reçoivent 3x plus de candidatures
                    </div>
                  </div>

                  {/* Section IA */}
                  <div className="mb-4 p-4 text-center" style={{
                    background: 'linear-gradient(135deg, #f8faff 0%, #e6f0ff 100%)',
                    border: '2px dashed #3366ff',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '10px',
                      animation: 'pulse 2s infinite'
                    }}>
                      🤖
                    </div>
                    <h5 className="fw-bold mb-2" style={{color: '#3366ff'}}>
                      ✨ Assistance IA avancée
                    </h5>
                    <p className="text-muted mb-3">
                      Laissez notre IA vous aider à rédiger une description d'offre optimisée qui attire les meilleurs talents
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={generateWithAI}
                      disabled={isGenerating}
                      style={{
                        background: aiSuccess 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        padding: '12px 24px'
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Génération en cours...
                        </>
                      ) : aiSuccess ? (
                        '✓ Généré avec succès !'
                      ) : (
                        'Générer avec l\'IA'
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Description du poste <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Décrivez le poste, les missions, les responsabilités..."
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        resize: 'vertical',
                        fontSize: '16px',
                        padding: '16px'
                      }}
                    ></textarea>
                    <div className="form-text">
                      Plus la description est détaillée, plus vous attirerez des candidats qualifiés
                    </div>
                  </div>

                  {/* Compétences */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Compétences requises <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Listez les compétences techniques et soft skills nécessaires..."
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        resize: 'vertical',
                        fontSize: '16px',
                        padding: '16px'
                      }}
                    ></textarea>
                  </div>

                  {/* Avantages */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Avantages
                    </label>
                    <textarea
                      className="form-control"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Télétravail, tickets restaurant, mutuelle, formation..."
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        resize: 'vertical',
                        fontSize: '16px',
                        padding: '16px'
                      }}
                    ></textarea>
                    <div className="form-text">
                      Les avantages aident à vous démarquer de la concurrence
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top flex-column flex-md-row">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg mb-2 mb-md-0"
                      onClick={handleBackToManagement}
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600',
                        minWidth: '160px',
                        padding: '16px 32px'
                      }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      onClick={handleSubmit}
                      style={{
                        background: 'linear-gradient(135deg, #3366ff 0%, #1e4fff 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        minWidth: '160px',
                        boxShadow: '0 4px 15px rgba(51, 102, 255, 0.2)',
                        padding: '16px 32px'
                      }}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      Publier l'offre
                    </button>
                  </div>
                </div>
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

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .form-control:focus,
          .form-select:focus {
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

          .btn-outline-secondary:hover {
            background: #e5e7eb !important;
            transform: translateY(-2px);
          }

          .btn-outline-light:hover {
            background: rgba(255,255,255,0.1) !important;
            transform: translateY(-1px);
          }

          @media (max-width: 768px) {
            .d-flex.gap-3 {
              gap: 0.75rem !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default JobPostingForm;