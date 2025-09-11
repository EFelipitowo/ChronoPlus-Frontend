import React, { useState, useEffect } from "react";
import "../styles/style.css"
import TopBar_l from "../../components/layout/TopBar_logged"; 
import Table from "../../components/ui/Table"; // Importa el componente Table
import type { DataItem, ColumnConfig } from "../../components/ui/Table";

const HomePage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("tag");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState<string | number>('modificado_en');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estados para filtros avanzados
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSubestacion, setFiltroSubestacion] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const tableColumns: ColumnConfig[] = [
    { key: 'tag', label: 'TAG', sortable: true },
    { key: 'tag_marca', label: 'Marca', sortable: true },
    { key: 'tag_estado', label: 'Estado', sortable: true },
    { key: 'empresa', label: 'Empresa', sortable: true },
    { key: 'nombre_subestacion', label: 'Subestación', sortable: true },
    { key: 'modificado_en', label: 'Ultima Actualización', sortable: true }
  ];

  // Simulación de datos
  useEffect(() => {
    const fakeData: DataItem[] = [
      { tag: 1, tag_marca: "Felipe", tag_estado: "100", empresa: "Ayala_Tx", nombre_subestacion: "Santiago", modificado_en: "2020-01-27 15:01:51.000 -0300" },
      { tag: 11, tag_marca: "PMM", tag_estado: "201", empresa: "Ayala_Tx", nombre_subestacion: "Discord", modificado_en: "2020-01-27 15:01:59.000 -0300" },
      { tag: 2, tag_marca: "Ana", tag_estado: "200", empresa: "Garay_Tx", nombre_subestacion: "Valparaíso", modificado_en: "2020-01-27 15:01:52.000 -0300" },
      { tag: 22, tag_marca: "USM", tag_estado: "500", empresa: "Garay_Tx", nombre_subestacion: "Casa Central", modificado_en: "2025-01-27 15:01:52.000 -0300" },
      { tag: 3, tag_marca: "Carlos", tag_estado: "300", empresa: "Garay_Tx", nombre_subestacion: "Concepción", modificado_en: "2020-01-27 15:01:53.000 -0300" },
      { tag: 4, tag_marca: "María", tag_estado: "400", empresa: "Ayala_Tx", nombre_subestacion: "La Serena", modificado_en: "2020-01-27 15:01:54.000 -0300" },
      { tag: 5, tag_marca: "Luis", tag_estado: "500", empresa: "Ayala_Tx", nombre_subestacion: "Antofagasta", modificado_en: "2020-01-27 15:01:55.000 -0300" },
    ];
    setData(fakeData);
    setFilteredData(fakeData);
  }, []);

  // Función para manejar el ordenamiento
  const handleSort = (field: string | number, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[field] < b[field]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredData(sortedData);
  };

  // Filtrado de datos según búsqueda
  const handleSearch = () => {
    if (!query && !filtroEstado && !filtroSubestacion && !filtroFechaDesde && !filtroFechaHasta){
      setFilteredData(data);
      return;
    }

    const results = data.filter((item) => {
      const searchValue = query.toLowerCase();
      let matchesBasic = false;
      
      switch (searchBy) {
        case "tag":
          matchesBasic = item.tag.toString().includes(searchValue);
          break;
        case "marca":
          matchesBasic = String(item.tag_marca).toLowerCase().includes(searchValue);
          break;
        case "estado":
          matchesBasic = String(item.tag_estado).toLowerCase().includes(searchValue);
          break;
        case "subestacion":
          matchesBasic = String(item.nombre_subestacion).toLowerCase().includes(searchValue);
          break;
        default:
          matchesBasic = true;
      }
      
      const matchesEstado = !filtroEstado || item.tag_estado === filtroEstado;
      const matchesSubestacion = !filtroSubestacion || String(item.nombre_subestacion).toLowerCase().includes(filtroSubestacion.toLowerCase());
      const matchesFecha = true;
      
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
    setSortField('tag');
    setSortDirection('asc');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="">
      <div className="top-0 left-0 justify-center shadow-md z-50 ">
        <TopBar_l />
      </div>

      <div className="relative container mx-auto px-4 py-10 mt-16 ">
        {/* Panel de búsqueda */}
        <div className="bg-gray-100 rounded-2xl  p-6 mb-8 border-black border-1">
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
              className="flex items-center text-sm text-white hover:text-red-800 transition"
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
        <div className="flex items-center mb-8 ">
          <div className="flex-grow border-t border-gray-600"></div>
          <div className="bg-white px-4 rounded-2xl border-gray-600">
            <span className="text-lg font-semibold text-gray-700">Búsqueda Avanzada</span>
          </div>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Tabla de resultados usando el componente Table */}
        <Table
          data={filteredData}
          columns={tableColumns}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </div> 
  );
};

export default HomePage;