import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './pages/styles/style.css';

import Login from './pages/Auth/LoginPage';
import HomePaige from './pages/Main/HomePaige';
import Asset from './pages/Asset/Asset';

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/asset" element={<Asset />} />
      </Routes>
    </Router>
  )
}

export default App;
