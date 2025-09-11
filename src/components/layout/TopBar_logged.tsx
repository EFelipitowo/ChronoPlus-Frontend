import React from "react";
import logo from "../../assets/chilquinta.png";
import "../../pages/styles/style.css"

const TopBar_l: React.FC = () => {
  return (
    <header className="top-bar">
      {/* Logo en la izquierda */}
      <div className="flex-shrink-0">
        <img src={logo} alt="Logo" className="h-auto w-[120%] min-w-[80px] max-w-[200px] object-contain" />
      </div>


    </header>
  );
};

export default TopBar_l;