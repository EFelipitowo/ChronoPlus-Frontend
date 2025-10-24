import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import "../styles/style.css"
import TopBar_l from "../../components/layout/TopBar_logged";
import Table from "../../components/ui/Table"; // Importa el componente Table
import type { ColumnConfig } from "../../components/ui/Table";
import type { Asset, ApiResponse } from "../../services/assetService";
import { getLatestAssets, generateExcelReport } from "../../services/assetService";
import AssetSearchBar from "../../components/layout/AssetSeachBar";

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

  useEffect(() => {
    document.title = "Buscador de Activos";
  }, []);

  const activeFiltersRef = useRef({
    searchValue: "",
    searchBy: "tag",
    status: "",
    substation_name: "",
    brand: "",
    from: "",
    to: ""
  });

  // Utility, consider moving to utility file (its also used in Asset.tsx)
  const formatTimestamp = (timestamp: string | number | Date | undefined | boolean | null) => {
    if (!timestamp || typeof timestamp === "boolean") return "-";
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
    { key: 'codigo_nema', label: 'NEMA', sortable: true },
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

        // ✅ Usa los filtros del ref, no los estados directamente
        const {
          searchValue: currentSearchValue,
          searchBy: currentSearchBy,
          status,
          substation_name,
          brand,
          from,
          to
        } = activeFiltersRef.current;

        const filterParams: Record<string, string | undefined> = {
          status,
          substation_name,
          brand,
          from,
          to
        };

        if (currentSearchValue) {
          filterParams[currentSearchBy] = currentSearchValue;
        }

        const { items, metadata } = await getLatestAssets(
          pageSize,
          page,
          ["tag", "brand", "status", "company", "substation_name", "codigo_nema", "cen", "d.modificado_en"],
          filterParams
        );

        setData(items ?? []);
        setFilteredData(items ?? []);
        setMetaData(metadata);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los activos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page]);

  /*
  // Funcion para navegar a asset/id
  const handleRowClick = (id: string) => {
    navigate(`/asset/${id}`);
  };
  */

  // Función para manejar el ordenamiento
  const handleSort = (field: string | number, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...filteredData].sort((a, b) => {
      const aVal = a[field as keyof Asset];
      const bVal = b[field as keyof Asset];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  // Funcion para manejar la descarga del excel
  const handleExportToExcel = async () => {
    try {
      // Usa los mismos filtros que usas en handleSearch
      const filterParams: Record<string, string | undefined> = {
        status: filtroEstado,
        substation_name: filtroSubestacion,
        brand: filtroMarca,
        from: filtroFechaDesde,
        to: filtroFechaHasta,
        nema: filtroNema,
        cen: filtroCen,
      };

      if (searchValue) {
        filterParams[searchBy] = searchValue;
      }

      // Llama al servicio
      const excelBlob = await generateExcelReport(filterParams);

      // Descargar el archivo
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error al generar el Excel:", err);
      alert("Error al generar el archivo Excel. Por favor, inténtelo nuevamente.");
    }
  };

  // Filtrado de datos según búsqueda
  const handleSearch = async () => {
    try {
      setLoading(true);
      setPage(1);

      // Actualiza el ref con los filtros actuales
      activeFiltersRef.current = {
        searchValue,
        searchBy,
        status: filtroEstado,
        substation_name: filtroSubestacion,
        brand: filtroMarca,
        from: filtroFechaDesde,
        to: filtroFechaHasta
      };

      const filterParams: Record<string, string | undefined> = {
        status: filtroEstado,
        substation_name: filtroSubestacion,
        brand: filtroMarca,
        from: filtroFechaDesde,
        to: filtroFechaHasta
      };

      if (searchValue) {
        filterParams[searchBy] = searchValue;
      }

      const { items, metadata } = await getLatestAssets(pageSize, 1,
        ["tag", "brand", "status", "company", "substation_name", "d.modificado_en", "codigo_nema", "cen"],
        filterParams
      );

      setData(items ?? []);
      setFilteredData(items ?? []);
      setMetaData(metadata);
    } catch (err) {
      console.error(err);
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

    activeFiltersRef.current = {
      searchValue: "",
      searchBy: "tag",
      status: "",
      substation_name: "",
      brand: "",
      from: "",
      to: ""
    };

    try {
      setLoading(true);
      const { items, metadata } = await getLatestAssets(pageSize, 1);
      setData(items ?? []);
      setFilteredData(items ?? []);
      setMetaData(metadata);
    } catch (err) {
      console.error(err);
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
      <div className="">
        <div className="top-0 left-0 justify-center shadow-md z-50 ">
          <TopBar_l />
        </div>
        <div className="relative container mx-auto px-4 py-10 mt-16 ">
          {/* Panel de búsqueda */}
          <AssetSearchBar
            filtroMarca={filtroMarca}
            setFiltroMarca={setFiltroMarca}
            filtroNema={filtroNema}
            setFiltroNema={setFiltroNema}
            filtroCen={filtroCen}
            setFiltroCen={setFiltroCen}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroSubestacion={filtroSubestacion}
            setFiltroSubestacion={setFiltroSubestacion}
            filtroFechaDesde={filtroFechaDesde}
            setFiltroFechaDesde={setFiltroFechaDesde}
            filtroFechaHasta={filtroFechaHasta}
            setFiltroFechaHasta={setFiltroFechaHasta}
            handleSearch={handleSearch}
            handleClearFilters={handleClearFilters}
            handleKeyPress={handleKeyPress}
            handleExportToExcel={handleExportToExcel}
          />
          {/* Separador */}
          <div className="flex items-center mb-8 ">
            <div className="flex-grow border-t border-gray-600"></div>
            <div className="bg-white px-4 rounded-2xl border-gray-600">
              <span className="text-lg font-semibold text-gray-700">Resultados Búsqueda</span>
            </div>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-30 shadow">
          <p className="text-center text-gray-700 font-medium">Cargando activos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="">
        <div className="top-0 left-0 justify-center shadow-md z-50 ">
          <TopBar_l />
        </div>
        <div className="relative container mx-auto px-4 py-10 mt-16 ">
          {/* Panel de búsqueda */}
          <AssetSearchBar
            filtroMarca={filtroMarca}
            setFiltroMarca={setFiltroMarca}
            filtroNema={filtroNema}
            setFiltroNema={setFiltroNema}
            filtroCen={filtroCen}
            setFiltroCen={setFiltroCen}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroSubestacion={filtroSubestacion}
            setFiltroSubestacion={setFiltroSubestacion}
            filtroFechaDesde={filtroFechaDesde}
            setFiltroFechaDesde={setFiltroFechaDesde}
            filtroFechaHasta={filtroFechaHasta}
            setFiltroFechaHasta={setFiltroFechaHasta}
            handleSearch={handleSearch}
            handleClearFilters={handleClearFilters}
            handleKeyPress={handleKeyPress}
            handleExportToExcel={handleExportToExcel}
          />
          {/* Separador */}
          <div className="flex items-center mb-8 ">
            <div className="flex-grow border-t border-gray-600"></div>
            <div className="bg-white px-4 rounded-2xl border-gray-600">
              <span className="text-lg font-semibold text-gray-700">Resultados Búsqueda</span>
            </div>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-30 shadow">
          <p className="text-center  text-red-600">{error}</p>
        </div>
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div className="">
        <div className="top-0 left-0 justify-center shadow-md z-50 ">
          <TopBar_l />
        </div>
        <div className="relative container mx-auto px-4 py-10 mt-16 ">
          {/* Panel de búsqueda */}
          <AssetSearchBar
            filtroMarca={filtroMarca}
            setFiltroMarca={setFiltroMarca}
            filtroNema={filtroNema}
            setFiltroNema={setFiltroNema}
            filtroCen={filtroCen}
            setFiltroCen={setFiltroCen}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroSubestacion={filtroSubestacion}
            setFiltroSubestacion={setFiltroSubestacion}
            filtroFechaDesde={filtroFechaDesde}
            setFiltroFechaDesde={setFiltroFechaDesde}
            filtroFechaHasta={filtroFechaHasta}
            setFiltroFechaHasta={setFiltroFechaHasta}
            handleSearch={handleSearch}
            handleClearFilters={handleClearFilters}
            handleKeyPress={handleKeyPress}
            handleExportToExcel={handleExportToExcel}
          />
          {/* Separador */}
          <div className="flex items-center mb-8 ">
            <div className="flex-grow border-t border-gray-600"></div>
            <div className="bg-white px-4 rounded-2xl border-gray-600">
              <span className="text-lg font-semibold text-gray-700">Resultados Búsqueda</span>
            </div>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-30 shadow">
          <p className="text-center text-gray-700 font-medium">No hay activos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="top-0 left-0 justify-center shadow-md z-50 ">
        <TopBar_l />
      </div>

      <div className="relative container mx-auto px-4 py-10 mt-16 ">
        {/* Panel de búsqueda */}
        <AssetSearchBar
          filtroMarca={filtroMarca}
          setFiltroMarca={setFiltroMarca}
          filtroNema={filtroNema}
          setFiltroNema={setFiltroNema}
          filtroCen={filtroCen}
          setFiltroCen={setFiltroCen}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          searchBy={searchBy}
          setSearchBy={setSearchBy}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroSubestacion={filtroSubestacion}
          setFiltroSubestacion={setFiltroSubestacion}
          filtroFechaDesde={filtroFechaDesde}
          setFiltroFechaDesde={setFiltroFechaDesde}
          filtroFechaHasta={filtroFechaHasta}
          setFiltroFechaHasta={setFiltroFechaHasta}
          handleSearch={handleSearch}
          handleClearFilters={handleClearFilters}
          handleKeyPress={handleKeyPress}
          handleExportToExcel={handleExportToExcel}
        />
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
            {metadata.total > 0 ? (
              <p className="text-sm text-white">
                Mostrando {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, metadata.total)} de {metadata.total} activos
              </p>
            ) : (
              <p className="text-sm text-white">No se encontraron activos</p>
            )}

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