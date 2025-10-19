// src/components/ui/AssetSearchBar.tsx
import React from "react";

interface MapSearchBarProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    searchBy: string;
    setSearchBy: (value: string) => void;
    showAdvanced: boolean;
    setShowAdvanced: (value: boolean) => void;
    filtroEstado: string;
    setFiltroEstado: (value: string) => void;
    filtroSubestacion: string;
    setFiltroSubestacion: (value: string) => void;
    handleSearch: () => void;
    handleClearFilters: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
    searchValue,
    setSearchValue,
    searchBy,
    setSearchBy,
    showAdvanced,
    setShowAdvanced,
    filtroEstado,
    setFiltroEstado,
    filtroSubestacion,
    setFiltroSubestacion,
    handleSearch,
    handleClearFilters,
    handleKeyPress,
}) => {
    
    return (
        <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 border border-black">
            {/* Título */}
            <div className="relative container mx-auto px-4 py-10">
                <div className="bg-gray-100 rounded-2xl p-4 sm:p-6">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800">
                        Mapa de Equipos
                    </h1>
                </div>
            </div>

            {/* Fila de búsqueda principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700">
                        Buscar por:
                    </label>
                    <select
                        value={searchBy}
                        onChange={(e) => setSearchBy(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                    >
                        <option value="tag">TAG</option>
                        <option value="status">Estado</option>
                        <option value="substation_name">Subestación</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700">
                        Ingrese dato:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ingrese el dato a buscar..."
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 sm:px-6 py-2 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition font-medium text-sm sm:text-base w-full sm:w-auto"
                        >
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Botón mostrar/ocultar */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-xs sm:text-sm text-white hover:text-red-800 transition"
                >
                    {showAdvanced ? "Ocultar Filtros Adicionales" : "Mostrar Filtros Adicionales"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Filtros avanzados */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showAdvanced ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="mt-6 pt-6 border-t border-gray-400">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
                        Opciones de Filtros Adicionales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4">
                        {/* Estado */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por Estado:
                            </label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            >
                                <option value="">Todos los estados</option>
                                <option value="10">Estado 100</option>
                                <option value="20">Estado 200</option>
                                <option value="30">Estado 300</option>
                                <option value="40">Estado 400</option>
                                <option value="50">Estado 500</option>
                            </select>
                        </div>

                        {/* Subestación */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por Subestación:
                            </label>
                            <input
                                type="text"
                                value={filtroSubestacion}
                                onChange={(e) => setFiltroSubestacion(e.target.value)}
                                placeholder="Nombre de subestación..."
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-gray-300 text-red-500 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base"
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition text-sm sm:text-base"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapSearchBar;
