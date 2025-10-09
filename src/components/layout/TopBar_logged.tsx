import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/chilquinta.png";
import "../../pages/styles/style.css";

const TopBar_l: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="top-bar flex items-center px-4">
      {/* Logo clickable */}
      <div
        className="flex-shrink-0 cursor-pointer"
        onClick={() => navigate("/home")}
        title="Ir al inicio"
      >
        <img
          src={logo}
          alt="Logo"
          className="h-auto w-[100%] min-w-[100px] max-w-[150px] object-contain"
        />
      </div>
    </header>
  );
};

export default TopBar_l;
