// src/components/ui/AssetSearchBar.tsx
import React from "react";
import { useEffect } from "react";

type EstadoMayorKey = "10" | "20" | "30" | "40" | "50";
type EstadoMenor = { value: string; label: string };


// 🔹 Mapping between Estado Mayor and its possible Estado Menor options
const estadosMenores: Record<EstadoMayorKey, EstadoMenor[]> = {
    "10": [
        { value: "102", label: "102 - En Cotización" },
        { value: "103", label: "103 - En Diseño" },
        { value: "104", label: "104 - En Fábrica (xlng)" },
        { value: "105", label: "105 - En Acopio Reserva Proyecto" },
        { value: "106", label: "106 - En Montaje" },
        { value: "107", label: "107 - P.E.S." },
        { value: "108", label: "108 - Declarado C.E.N" },
    ],
    "20": [
        { value: "201", label: "201 - Activo Heredado" },
        { value: "202", label: "202 - Normal" },
        { value: "203", label: "203 - Monitoreo" },
        { value: "204", label: "204 - Reserva en Frío" },
        { value: "205", label: "205 - Equipo Nuevo de Reemplazo" },
        { value: "206", label: "206 - Nueva Incorporación" },
        { value: "207", label: "207 - Rotación de Equipo" },
        { value: "208", label: "208 - Monitoreo" },
        { value: "209", label: "209 - Monitoreo" },
    ],
    "30": [
        { value: "301", label: "301 - En Falla" },
        { value: "302", label: "302 - En Fábrica (xMant)" },
        { value: "303", label: "303 - En Acopio Subestación (Pool)" },
        { value: "304", label: "304 - Sin Repuestos" },
    ],
    "40": [
        { value: "401", label: "401 - Por Obsolecencia Tecnológica" },
        { value: "402", label: "402 - Por Riesgo Ambiental" },
        { value: "403", label: "402 - Chatarra" },
        { value: "404", label: "404 - Reutilización de Componente" },
        { value: "405", label: "405 - Dado de Baja Contable" }
    ],
    "50": [
        { value: "501", label: "501 - Tag Corregido" },
        { value: "502", label: "502 - Tag Eliminado por Equipos Fin de Vida Útil" },
        { value: "503", label: "503 - Tag Eliminado por Error de Creación" },
        { value: "504", label: "504 - Tag Eliminado por Equipo Repotenciado" },
    ],
};



interface AssetSearchBarProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    searchBy: string;
    setSearchBy: (value: string) => void;
    showAdvanced: boolean;
    setShowAdvanced: (value: boolean) => void;
    filtroEstado: string;
    setFiltroEstado: (value: string) => void;
    filtroEstadoMayor: string;
    setFiltroEstadoMayor: (value: string) => void;
    filtroEstadoMenor: string;
    setFiltroEstadoMenor: (value: string) => void;
    filtroSubestacion: string;
    setFiltroSubestacion: (value: string) => void;
    filtroFechaDesde: string;
    setFiltroFechaDesde: (value: string) => void;
    filtroFechaHasta: string;
    setFiltroFechaHasta: (value: string) => void;
    filtroMarca: string;
    setFiltroMarca: (value: string) => void;
    filtroNema: string;
    setFiltroNema: (value: string) => void;
    filtroCen: string;
    setFiltroCen: (value: string) => void;
    handleSearch: () => void;
    handleClearFilters: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    handleExportToExcel: () => void;
}

const AssetSearchBar: React.FC<AssetSearchBarProps> = ({
    searchValue,
    setSearchValue,
    searchBy,
    setSearchBy,
    showAdvanced,
    setShowAdvanced,
    filtroEstado,
    setFiltroEstado,
    filtroEstadoMayor,
    setFiltroEstadoMayor,
    filtroEstadoMenor,
    setFiltroEstadoMenor,
    filtroSubestacion,
    setFiltroSubestacion,
    filtroFechaDesde,
    setFiltroFechaDesde,
    filtroFechaHasta,
    setFiltroFechaHasta,
    filtroMarca,
    setFiltroMarca,
    filtroCen,
    setFiltroCen,
    filtroNema,
    setFiltroNema,
    handleSearch,
    handleClearFilters,
    handleKeyPress,
    handleExportToExcel
}) => {

    useEffect(() => {
        if (filtroEstadoMenor) {
            // If there's a specific menor selected → it takes priority
            setFiltroEstado(filtroEstadoMenor);
        } else if (filtroEstadoMayor) {
            // Else, just use the mayor
            setFiltroEstado(filtroEstadoMayor);
        } else {
            // None selected → clear
            setFiltroEstado("");
        }
    }, [filtroEstadoMayor, filtroEstadoMenor, setFiltroEstado]);

    // Helper to safely get sub-statuses
    const menores: EstadoMenor[] = filtroEstadoMayor
        ? estadosMenores[filtroEstadoMayor as EstadoMayorKey] ?? []
        : [];

    return (
        <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 border border-black">
            {/* Título */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
                Buscador de Activos
            </h1>

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
                        <option value="brand">Marca</option>
                        <option value="status">Estado</option>
                        <option value="substation_name">Subestación</option>
                        <option value="nema">NEMA</option>
                        <option value="cen">CEN</option>
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

            {/* Opciones de búsqueda avanzada */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="mt-6 pt-6 border-t border-gray-400">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
                        Opciones de Filtros Adicionales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4">
                        {/* Estado Mayor*/}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por Estado Mayor:
                            </label>
                            <select
                                value={filtroEstadoMayor}
                                onChange={(e) => {
                                    setFiltroEstadoMayor(e.target.value);
                                    setFiltroEstadoMenor(""); // reset sub-status
                                }}
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            >
                                <option value="">Todos los estados</option>
                                <option value="10">100 - En Proyecto</option>
                                <option value="20">200 - En Servicio</option>
                                <option value="30">300 - Fuera de Servicio</option>
                                <option value="40">400 - Fin Vida Útil</option>
                                <option value="50">500 - Tag Modificado</option>
                            </select>
                        </div>
                        {/* Estado Menor */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por Estado Menor:
                            </label>
                            <select
                                value={filtroEstadoMenor}
                                onChange={(e) => setFiltroEstadoMenor(e.target.value)}
                                disabled={!filtroEstadoMayor}
                                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none ${filtroEstadoMayor
                                    ? "border-gray-300 focus:ring-2 focus:ring-[#8B322C]"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <option value="">
                                    {filtroEstadoMayor
                                        ? "Todos los estados menores"
                                        : "Selecciona un estado mayor primero"}
                                </option>

                                {/* 🔹 Now menores is always an array, so map() is safe */}
                                {menores.map((estado: EstadoMenor) => (
                                    <option key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Marca/Brand */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por Marca:
                            </label>
                            <input
                                type="text"
                                value={filtroMarca}
                                onChange={(e) => setFiltroMarca(e.target.value)}
                                placeholder="Nombre Marca..."
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            />
                        </div>

                        {/* CEN */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Filtrar por CEN:
                            </label>
                            <input
                                type="text"
                                value={filtroCen}
                                onChange={(e) => setFiltroCen(e.target.value)}
                                placeholder="Codigo CEN..."
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            />
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
                        {/* NEMA - Solo se puede escribir en este si se escoge alguna subestación*/}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                {filtroSubestacion
                                    ? "Filtrar por NEMA:"
                                    : "Filtrar por NEMA (selecciona una subestación primero):"}
                            </label>

                            <input
                                type="text"
                                value={filtroNema}
                                onChange={(e) => setFiltroNema(e.target.value)}
                                placeholder={
                                    filtroSubestacion
                                        ? "Código NEMA..."
                                        : "Deshabilitado hasta seleccionar subestación"
                                }
                                disabled={!filtroSubestacion}
                                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none
                                ${filtroSubestacion
                                        ? "border-gray-300 focus:ring-2 focus:ring-[#8B322C]"
                                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            />
                        </div>


                        {/* Fecha desde */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Fecha desde:
                            </label>
                            <input
                                type="date"
                                value={filtroFechaDesde}
                                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                                Fecha hasta:
                            </label>
                            <input
                                type="date"
                                value={filtroFechaHasta}
                                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 text-white rounded-lg black-button transition text-sm sm:text-base"
                        >
                            Aplicar Filtros
                        </button>
                        <button
                            onClick={handleExportToExcel}
                            className="px-4 py-2 excel-button  text-white rounded-lg transition text-sm sm:text-base"
                        >
                            Generar Excel
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 clean-button text-white rounded-lg transition text-sm sm:text-base"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetSearchBar;