import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Views/Home';
import Connexion from './Views/Connexion';
import Inscription from './Views/Inscription';
import MotDePasseOublie from './Views/MotDePasseOublie';
import Offres from './Views/Offres';
import OffresPost from './Views/OffresPost';
import OffresGestion from './Views/OffresGestion';
import UserProfile from './Views/UserProfile';
import Candidatures from './Views/Candidatures';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/MotDePasseOublie" element={<MotDePasseOublie />} />
        <Route path="/Offres" element={<Offres />} />
        <Route path="/OffresPost" element={<OffresPost />} />
        <Route path="/OffresGestion" element={<OffresGestion />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/Candidatures" element={<Candidatures />} />
      </Routes>
    </Router>
  );
}

export default App;
