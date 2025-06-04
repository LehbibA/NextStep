import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Inscription = () => {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données envoyées :', form);
    // Tu peux ici connecter à une API ou afficher un message de succès
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
          <h3 className="text-center mb-4">Créer un compte</h3>
          <p className="text-muted">
            Vous avez déjà un compte ? <Link to="/connexion">Se connecter</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="nom"
                className="form-control"
                placeholder="Nom complet"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Adresse e-mail"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
