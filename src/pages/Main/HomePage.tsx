import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import "../styles/style.css"
import TopBar_l from "../../components/layout/TopBar_logged";
import Table from "../../components/ui/Table"; // Importa el componente Table
import type { DataItem, ColumnConfig } from "../../components/ui/Table";
import type { Asset, ApiResponse } from "../../services/assetService";
import { getLatestAssets } from "../../services/assetService";


const HomePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState("tag");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [data, setData] = useState<Asset[]>([]);
  const [filteredData, setFilteredData] = useState<Asset[]>([]);
  const [metadata, setMetaData] = useState<ApiResponse<Asset>["metadata"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<string | number>('modificado_en');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estados para filtros 
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSubestacion, setFiltroSubestacion] = useState("");
  const [filtroNema, setFiltroNema] = useState("");
  const [filtroCen, setFiltroCen] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const navigate = useNavigate();

  // Utility, consider moving to utility file (its also used in Asset.tsx)
  const formatTimestamp = (timestamp: string | number | Date | undefined | null) => {
      if (!timestamp) return "-";
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleString("es-CL", { 
          timeZone: "America/Santiago",  // Adjust to your time zone
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
      });
  };  

  const tableColumns: ColumnConfig<Asset>[] = [
    { key: 'tag', label: 'TAG', sortable: true },
    { key: 'tag_marca', label: 'Marca', sortable: true },
    { key: 'tag_estado', label: 'Estado', sortable: true },
    { key: 'codigo_nema', label : 'NEMA', sortable: true },
    { key: 'codigo_cen', label: 'CEN', sortable: true },
    { key: 'empresa', label: 'Empresa', sortable: true },
    { key: 'nombre_subestacion', label: 'Subestación', sortable: true },
    { key: 'modificado_en', label: 'Ultima Actualización', sortable: true, customRender: (value) => formatTimestamp(value) }
  ];

  // Simulación de datos
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const { items, metadata } = await getLatestAssets(pageSize, page,
        ["tag", "brand", "status", "company", "substation_name","nema", "cen", "d.modificado_en", ], 
        {
        status: filtroEstado,
        substation_name: filtroSubestacion,
        brand: filtroMarca,
        from: filtroFechaDesde,
        to: filtroFechaHasta
        }
      );
      setData(items ?? []);
      setFilteredData(items ?? []);
      setMetaData(metadata);
    } catch (err) {
      setError("Error al cargar los activos");
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, [page]);


  // Funcion para navegar a asset/id
  const handleRowClick = (id: string) => {
    navigate(`/asset/${id}`);
  };

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
const handleSearch = async () => {
  try {
    setLoading(true);
    setPage(1); // reset to first page when starting a new search

      const filterParams: Record<string, any> = {
        status: filtroEstado,
        substation_name: filtroSubestacion,
        brand: filtroMarca,
        from: filtroFechaDesde,
        to: filtroFechaHasta
      };
    
      // Add main search bar filter dynamically
      if (searchValue) {
        filterParams[searchBy] = searchValue;
      }

    const { items, metadata } = await getLatestAssets(pageSize, 1, 
      ["tag", "brand", "status", "company", "substation_name", "d.modificado_en", "nema", "cen"],
      filterParams
    );

    setData(items ?? []);
    setFilteredData(items ?? []); // you could drop filteredData and just use data
    setMetaData(metadata);
  } catch (err) {
    setError("Error al buscar activos");
  } finally {
    setLoading(false);
  }
};


  // Limpiar filtros
const handleClearFilters = async () => {
  setSearchValue("");
  setFiltroEstado("");
  setFiltroSubestacion("");
  setFiltroFechaDesde("");
  setFiltroFechaHasta("");
  setPage(1); // reset page

  try {
    setLoading(true);
    const { items, metadata } = await getLatestAssets(pageSize, 1);
    setData(items ?? []);
    setFilteredData(items ?? []);
    setMetaData(metadata);
  } catch (err) {
    setError("Error al limpiar filtros");
  } finally {
    setLoading(false);
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-20 shadow">
        <p className="text-center text-gray-700 font-medium">Cargando activos...</p>
      </div>
  )}

  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!data || data.length === 0) return <p className="text-center mt-20">No hay activos disponibles</p>;

  return (
    <div className="">
      <div className="top-0 left-0 justify-center shadow-md z-50 ">
        <TopBar_l />
      </div>

      <div className="relative container mx-auto px-4 py-10 mt-16 ">
        {/* Panel de búsqueda */}
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


        {/* Separador */}
        <div className="flex items-center mb-8 ">
          <div className="flex-grow border-t border-gray-600"></div>
          <div className="bg-white px-4 rounded-2xl border-gray-600">
            <span className="text-lg font-semibold text-gray-700">Resultados Búsqueda</span>
          </div>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {loading && <p className="text-center text-white">Cargando activos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Tabla de resultados usando el componente Table */}
        <Table
          data={filteredData}
          columns={tableColumns}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onRowClick={(item) => navigate(`/asset/${item.tag}`)}
        />

        {/* Metadata info TENEMOS QUE ARREGLAR METADA EN LA API AHHH porque no viene metadata {...} si no que total, page, limit, items*/}
        {metadata && (
          <div className="mt-4 text-center">
            <p className="text-sm text-white">
              Mostrando {filteredData.length} de {metadata.total} activos (página {metadata.page})
            </p>

            {/* Pagination buttons */}
            <div className="flex justify-center gap-4 mt-2">
              <button
                className="px-4 py-2 pagination-button rounded disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                ← Anterior
              </button>
              <button
                className="px-4 py-2 pagination-button rounded disabled:opacity-50"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={metadata?.page * metadata?.pageSize >= metadata?.total}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;