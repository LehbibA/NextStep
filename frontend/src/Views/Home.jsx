import React from "react";

const Home = () => {
  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3">
        <a className="navbar-brand fw-bold" href="#">NextStep</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><a className="nav-link" href="#">Accueil</a></li>
            <li className="nav-item"><a className="nav-link" href="#">À propos</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Fonctionnalités</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Témoignages</a></li>
          </ul>
          <div>
            <a className="btn btn-outline-primary me-2" href="/connexion">Se connecter</a>
            <button className="btn btn-primary">☰</button>
          </div>
        </div>
      </nav>

      {/* SECTION HERO */}
      <section className="container py-5 text-center text-md-start d-flex flex-column flex-md-row align-items-center">
        <div className="col-md-6">
          <h1 className="display-5 fw-bold mb-3">
          Connecter les talents et les opportunités, grâce à l’IA
          </h1>
          <p className="text-muted mb-4">
          La plateforme intelligente pour postuler ou recruter efficacement. Accélérez votre parcours avec NextStep.
          </p>
        </div>

        {/* ILLUSTRATION (image fictive en attendant) */}
        <div className="col-md-6 text-center">
          <img src="/assets/Img_temp.png" alt="Illustration IA" className="img-fluid" />
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="container text-center py-5">
        <div className="row">
          <div className="col-md-3"><h4>1,750+</h4><p>Offres d’emploi</p></div>
          <div className="col-md-3"><h4>315K</h4><p>CV générés</p></div>
          <div className="col-md-3"><h4>650K+</h4><p>Employeurs</p></div>
          <div className="col-md-3"><h4>120K</h4><p>Témoignages</p></div>
        </div>
      </section>

      <section className="container py-5">
  <h2 className="mb-4 fw-bold text-center">Most Popular Vacancies</h2>
  <div className="row row-cols-1 row-cols-md-3 g-4">
    {[
      ['Développeur Logiciel', 320],
      ['Data Scientist', 220],
      ['Responsable Financier', 156],
      ['Analyste en Management', 117],
      ['Orthodontistes', 280],
      ['IT Manager', 50963],
    ].map(([title, count], i) => (
      <div className="col" key={i}>
        <div className="card h-100 shadow-sm">
          <div className="card-body text-center">
            <h5 className="card-title">{title}</h5>
            <p className="text-muted">{count.toLocaleString()} Open Positions</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

<section className="bg-light py-5 text-center">
  <div className="container">
    <h2 className="mb-5 fw-bold">Comment fonctionne NextStep ?</h2>

    <h4 className="mb-4">Pour les candidats</h4>
    <div className="row mb-5">
      {[
        ["Créer un compte", "👤"],
        ["Générer un CV avec l’IA", "🧠"],
        ["Découvrir des offres recommandées", "🔍"],
        ["Discuter avec les recruteurs", "💬"],
      ].map(([title, icon], index) => (
        <div className="col-md-2 offset-md-1 mb-4" key={index}>
          <div className="fs-1 mb-2">{icon}</div>
          <h6 className="fw-semibold">{title}</h6>
        </div>
      ))}
    </div>

    <h4 className="mb-4">Pour les recruteurs</h4>
    <div className="row">
      {[
        ["Créer un compte entreprise", "🏢"],
        ["Publier une offre", "✍️"],
        ["Filtrer les profils", "🎯"],
        ["Contacter les candidats", "📨"],
      ].map(([title, icon], index) => (
        <div className="col-md-2 offset-md-1 mb-4" key={index}>
          <div className="fs-1 mb-2">{icon}</div>
          <h6 className="fw-semibold">{title}</h6>
        </div>
      ))}
    </div>
  </div>
</section>


<section className="container py-5 text-center">
  <h2 className="mb-5 fw-bold">Ce que disent nos utilisateurs</h2>
  <div className="row">
    {[
      ['Robert Fox', 'Développeur', 'Grâce à NextStep, j’ai trouvé mon premier job.'],
      ['Bessie Cooper', 'Directrice RH', 'Super plateforme pour trouver des talents !'],
      ['Jane Cooper', 'Photographe', 'Interface facile et résultats rapides.'],
    ].map(([name, role, comment], i) => (
      <div className="col-md-4 mb-4" key={i}>
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <p className="mb-3">“{comment}”</p>
            <h6 className="fw-bold mb-0">{name}</h6>
            <small className="text-muted">{role}</small>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

<section className="container py-5">
  <div className="row">
    <div className="col-md-6 mb-4">
      <div className="p-4 bg-light h-100 shadow rounded">
        <h4>Devenir Candidat</h4>
        <p>Rejoignez la plateforme pour accéder à des milliers d’offres ciblées.</p>
        <a href="/inscription" className="btn btn-primary">S'inscrire</a>
      </div>
    </div>
    <div className="col-md-6 mb-4">
      <div className="p-4 bg-primary text-white h-100 shadow rounded">
        <h4>Devenir Employeur</h4>
        <p>Postez des offres et trouvez les meilleurs talents avec IA.</p>
        <a href="/inscription" className="btn btn-light">Commencer</a>
      </div>
    </div>
  </div>
</section>

<footer className="bg-dark text-white py-5 mt-5">
  <div className="container">
    <div className="row">
      <div className="col-md-3">
        <h5>NextStep</h5>
        <p><small>Plateforme intelligente pour candidats & recruteurs.</small></p>
      </div>
      <div className="col-md-3">
        <h6>Liens</h6>
        <ul className="list-unstyled">
          <li><a href="#" className="text-white-50">Accueil</a></li>
          <li><a href="#" className="text-white-50">À propos</a></li>
          <li><a href="#" className="text-white-50">Contact</a></li>
        </ul>
      </div>
      <div className="col-md-3">
        <h6>Candidat</h6>
        <ul className="list-unstyled">
          <li><a href="#" className="text-white-50">Rechercher un emploi</a></li>
          <li><a href="#" className="text-white-50">Créer un profil</a></li>
        </ul>
      </div>
      <div className="col-md-3">
        <h6>Réseaux</h6>
        <div className="d-flex gap-3">
          <a href="#" className="text-white-50">Facebook</a>
          <a href="#" className="text-white-50">LinkedIn</a>
        </div>
      </div>
    </div>
    <hr className="bg-white-50" />
    <p className="text-center text-white-50 mb-0">© 2025 NextStep. Tous droits réservés.</p>
  </div>
</footer>


    </div>
  );
};

export default Home;
