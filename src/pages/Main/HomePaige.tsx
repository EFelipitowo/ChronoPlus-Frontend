import React, { useState, useEffect } from "react";
import "../styles/style.css"
import TopBar_l from "../../components/layout/TopBar_logged"; 


interface DataItem {
  tag: number;
  tag_marca: string;
  tag_estado: string;
  empresa: string;
  nombre_subestacion: string;
  modificado_en: string;
}


const HomePaige: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("tag"); // Estado para el criterio de búsqueda
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);


  // Estados para filtros avanzados
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSubestacion, setFiltroSubestacion] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  // Simulación de datos (aquí irían los datos de la base de datos)
  useEffect(() => {
    const fakeData: DataItem[] = [
      { tag: 1, tag_marca: "Felipe", tag_estado: "100", empresa: "Felipe_Tx", nombre_subestacion: "Santiago", modificado_en: "2020-01-27 15:01:51.000 -0300" },
      { tag: 2, tag_marca: "Ana", tag_estado: "200", empresa: "Felipe_Tx", nombre_subestacion: "Valparaíso", modificado_en: "2020-01-27 15:01:52.000 -0300" },
      { tag: 3, tag_marca: "Carlos", tag_estado: "300", empresa: "Felipe_Tx", nombre_subestacion: "Concepción", modificado_en: "2020-01-27 15:01:53.000 -0300" },
      { tag: 4, tag_marca: "María", tag_estado: "400", empresa: "Felipe_Tx", nombre_subestacion: "La Serena", modificado_en: "2020-01-27 15:01:54.000 -0300" },
      { tag: 5, tag_marca: "Luis", tag_estado: "500", empresa: "Felipe_Tx", nombre_subestacion: "Antofagasta", modificado_en: "2020-01-27 15:01:55.000 -0300" },
    ];
    setData(fakeData);
    setFilteredData(fakeData);
  }, []);

  // Filtrado de datos según búsqueda
  const handleSearch = () => {

    if (!query && !filtroEstado && !filtroSubestacion && !filtroFechaDesde && !filtroFechaHasta){
      setFilteredData(data);
      return;
    }

    const results = data.filter((item) => {
      // Filtro básico
      const searchValue = query.toLowerCase();
      let matchesBasic = false;
      
      switch (searchBy) {
        case "tag":
          matchesBasic = item.tag.toString().includes(searchValue);
          break;
        case "marca":
          matchesBasic = item.tag_marca.toLowerCase().includes(searchValue);
          break;
        case "estado":
          matchesBasic = item.tag_estado.toLowerCase().includes(searchValue);
          break;
        case "subestacion":
          matchesBasic = item.nombre_subestacion.toLowerCase().includes(searchValue);
          break;
        default:
          matchesBasic = true;
      }
      
      // Filtros avanzados
      const matchesEstado = !filtroEstado || item.tag_estado === filtroEstado;
      const matchesSubestacion = !filtroSubestacion || item.nombre_subestacion.toLowerCase().includes(filtroSubestacion.toLowerCase());
      
      // Filtro por fecha (simplificado)
      const matchesFecha = true; // Aquí implementarías la lógica de filtrado por fecha
      
      return matchesBasic && matchesEstado && matchesSubestacion && matchesFecha;
    });
    
    setFilteredData(results);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setQuery("");
    setFiltroEstado("");
    setFiltroSubestacion("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFilteredData(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  return (
    <div className="min-h-screen">
      <div className="fixed items-center top-0 justify-center w-full min-h-screen">
        <TopBar_l />
      </div>

      <div className="relative container mx-auto px-4 py-10 mt-16">
        {/* Panel de búsqueda */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
          {/* Título */}
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Buscar activo</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Buscar por:
              </label>
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
              >
                <option value="tag">TAG</option>
                <option value="marca">Marca</option>
                <option value="estado">Estado</option>
                <option value="subestacion">Subestación</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Ingrese dato:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingrese el dato a buscar..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition font-medium"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        
          {/* Botón para mostrar/ocultar búsqueda avanzada */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-white hover:text-[#6B2925] transition"
            >
              {showAdvanced ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Opciones de búsqueda avanzada con animación */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="mt-6 pt-6 border-t border-gray-400">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Opciones de Búsqueda Avanzada</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 pr-4 ">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Filtrar por Estado:
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                  >
                    <option value="">Todos los estados</option>
                    <option value="100">Estado 100</option>
                    <option value="200">Estado 200</option>
                    <option value="300">Estado 300</option>
                    <option value="400">Estado 400</option>
                    <option value="500">Estado 500</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Filtrar por Subestación:
                  </label>
                  <input
                    type="text"
                    value={filtroSubestacion}
                    onChange={(e) => setFiltroSubestacion(e.target.value)}
                    placeholder="Nombre de subestación..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Fecha desde:
                  </label>
                  <input
                    type="date"
                    value={filtroFechaDesde}
                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Fecha hasta:
                  </label>
                  <input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-300 text-red-500 rounded-lg hover:bg-gray-100 transition"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-gray-300"></div>
          <div className="bg-white px-4">
            <span className="text-lg font-semibold text-gray-700">Búsqueda Avanzada</span>
          </div>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">TAG</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Marca</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Estado</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Empresa</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Subestación</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Ultima Actualización</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.tag} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 border-b border-gray-200">{item.tag}</td>
                      <td className="p-4 border-b border-gray-200">{item.tag_marca}</td>
                      <td className="p-4 border-b border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.tag_estado === "100"
                            ? "bg-blue-100 text-blue-800"
                            : item.tag_estado === "200" 
                            ? "bg-green-100 text-green-800"
                            : item.tag_estado === "300"
                            ? "bg-yellow-100 text-yellow-800" 
                            : item.tag_estado === "400"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.tag_estado}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-200">{item.empresa}</td>
                      <td className="p-4 border-b border-gray-200">{item.nombre_subestacion}</td>
                      <td className="p-4 border-b border-gray-200">{item.modificado_en}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No se encontraron resultados para su búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePaige;