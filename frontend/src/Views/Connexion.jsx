import React from 'react';

const Connexion = () => {
  return (
    <div className="d-flex flex-column flex-md-row min-vh-100">

      {/* GAUCHE – Logo */}
      <div className="col-md-6 d-flex justify-content-center align-items-center bg-primary text-white">
        <div className="text-center">
          <h1 className="fw-bold mb-3"><i className="bi bi-briefcase-fill me-2"></i>NextStep</h1>
        </div>
      </div>

      {/* DROITE – Formulaire */}
      <div className="col-md-6 d-flex align-items-center justify-content-center bg-white p-5">
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h3 className="text-center mb-4">Connexion</h3>
          <p className="text-muted">
            Vous n'avez pas encore de compte ? <a href="/inscription">Créer un compte</a>
          </p>
          {/* Formulaire classique */}
          <form>
            <div className="mb-3">
              <input type="email" className="form-control" placeholder="Adresse e-mail" />
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="Mot de passe" />
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>
                <input type="checkbox" className="form-check-input me-2" />
                <label className="form-check-label">Se souvenir de moi</label>
              </div>
              <a href="/MotDePasseOublie" className="text-decoration-none small">Mot de passe oublié ?</a>
            </div>
            <button className="btn btn-primary w-100">SE CONNECTER</button>
          </form>

          {/* Séparateur */}
          <div className="text-center my-3 text-muted">ou connectez-vous avec</div>

          {/* Boutons Google / Facebook */}
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-outline-dark w-50">
              <i className="bi bi-facebook me-2"></i>Facebook
            </button>
            <button className="btn btn-outline-danger w-50">
              <i className="bi bi-google me-2"></i>Google
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Connexion;
