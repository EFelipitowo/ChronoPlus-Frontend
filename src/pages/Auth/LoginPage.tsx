import React from "react";
import TopBar from "../../components/layout/TopBar";

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-screen relative">
      <TopBar />
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#000000]">Bienvenido</h1>

        <div className="mb-6 border-t border-gray-300"></div>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
              Correo
            </label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C] color"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition font-semibold text-lg"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;