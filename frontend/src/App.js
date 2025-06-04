import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Views/Home';
import Connexion from './Views/Connexion';
import Inscription from './Views/Inscription';
import MotDePasseOublie from './Views/MotDePasseOublie';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/MotDePasseOublie" element={<MotDePasseOublie />} />
      </Routes>
    </Router>
  );
}

export default App;
