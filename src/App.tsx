import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './pages/styles/style.css';

import Login from './pages/Auth/LoginPage';
import HomePage from './pages/Main/HomePage';
import AssetPage from './pages/Asset/AssetPage';
import FormEvent from "./pages/Asset/FormEvent";
import MapPage from "./pages/Main/MapPage";
import GraphPage from "./pages/Main/GraphPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        {/* Protected Routes */}
        <Route path="/graph" element={<ProtectedRoute><GraphPage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/asset/:id" element={<ProtectedRoute><AssetPage /></ProtectedRoute>} />
        <Route path="/asset/:id/register-event" element={<ProtectedRoute><FormEvent /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App;
