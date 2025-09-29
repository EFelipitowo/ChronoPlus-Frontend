import React from "react";
import logo from "../../assets/chilquinta.png";
import "../../pages/styles/style.css"

const TopBar_l: React.FC = () => {
  return (
    <header className="top-bar flex items-center px-4">
      {/* Logo adaptable */}
      <div className="flex-shrink-0 ">
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
