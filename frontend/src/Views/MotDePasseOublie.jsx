import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 👉 Simulation d’envoi
    setConfirmation(true);
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100">

      {/* GAUCHE – Logo */}
      <div className="col-md-6 d-flex justify-content-center align-items-center bg-primary text-white">
        <div className="text-center">
          <Link to="/" className="text-white text-decoration-none">
            <h1 className="fw-bold"><i className="bi bi-briefcase-fill me-2"></i>NextStep</h1>
          </Link>
        </div>
      </div>

      {/* DROITE – Formulaire */}
      <div className="col-md-6 d-flex align-items-center justify-content-center bg-white p-5">
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h3 className="mb-4 text-center">Réinitialiser le mot de passe</h3>

          {!confirmation ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Adresse e-mail</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Entrez votre e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Envoyer le lien de réinitialisation
              </button>
            </form>
          ) : (
            <div className="alert alert-success text-center">
              📩 Un lien de réinitialisation a été envoyé à :<br />
              <strong>{email}</strong>
              <div className="mt-3">
                <Link to="/connexion" className="btn btn-outline-primary btn-sm">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
