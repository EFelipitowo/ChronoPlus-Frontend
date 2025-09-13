import React from "react";
import logo from "../../assets/chilquinta.png";
import "../../pages/styles/style.css"

const TopBar_l: React.FC = () => {
  return (
    <header className="top-bar flex items-center px-4">
      {/* Logo adaptable */}
      <div className="w-[30vw] max-w-[200px] min-w-[80px] aspect-[3/1]">
        <img
          src={logo}
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </header>
  );
};

export default TopBar_l;
