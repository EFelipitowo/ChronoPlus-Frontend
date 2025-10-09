import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './pages/styles/style.css';

import Login from './pages/Auth/LoginPage';
import HomePage from './pages/Main/HomePage';
import Asset from './pages/Asset/Asset';
import FormEvent from "./pages/Asset/FormEvent";
import MapPage from "./pages/Main/MapPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/asset/:id" element={<Asset />} />
        <Route path="/asset/:id/register-event" element={<FormEvent />} />
      </Routes>
    </Router>
  )
}

export default App;
