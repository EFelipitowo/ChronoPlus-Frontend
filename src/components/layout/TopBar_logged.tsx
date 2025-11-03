import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/chilquinta.png";
import "../../pages/styles/style.css";

const TopBar_l: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false); // Cierra el menú móvil al navegar
  };

  return (
    <header className="top-bar flex items-center justify-between w-full px-4 py-3 bg-white shadow-md z-50 ">
      {/* Logo clickable */}
      <div
        className="flex-shrink-0 cursor-pointer"
        onClick={() => navigate("/home")}
        title="Ir al inicio"
      >
        <img
          src={logo}
          alt="Logo"
          className="h-auto min-w-[100px] max-w-[150px] object-contain"
        />
      </div>
      {/* Menú de escritorio */}
      <nav className="hidden md:flex items-center space-x-6 top-bar-button">
        <button
          onClick={() => navigate("/graph")}
          className="text-black hover:text-[#e23428] font-medium transition top-bar-button"
        >
          Vista Jerárquica
        </button>
        <button
          onClick={() => navigate("/map")}
          className="text-black hover:text-[#e23428] font-medium transition top-bar-button"
        >
          Mapa
        </button>
        <button
          onClick={() => navigate("/home")}
          className="text-black hover:text-[#e23428] font-medium transition top-bar-button"
        >
          Buscador de Activos
        </button>
      </nav>

      {/* Botón de menú móvil */}
      <button
        className="md:hidden text-gray-700 focus:outline-none top-bar-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menú"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="absolute top-full right-4 mt-2 w-48 top-bar-button shadow-lg rounded-lg py-2 z-50 md:hidden ">
          <button
            onClick={() => handleNavigation("/home")}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#8B322C] font-medium top-bar-button"
          >
            Página principal
          </button>
          <button
            onClick={() => handleNavigation("/map")}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#8B322C] font-medium top-bar-button"
          >
            Mapa
          </button>
        </div>
      )}

    </header>
  );
};

export default TopBar_l;
