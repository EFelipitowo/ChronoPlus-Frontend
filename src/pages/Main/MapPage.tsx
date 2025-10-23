import React, { useEffect, useState, useCallback } from "react";
import "../styles/style.css";
import TopBar_l from "../../components/layout/TopBar_logged";
import AssetMap from "../../components/layout/AssetMap";
import MapSearchBar from "../../components/layout/MapSearchBar";
import { getAllAssets, getLatestAssets } from "../../services/assetService";
import type { Asset } from "../../services/assetService";

const MapPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Estados para la búsqueda
    const [searchValue, setSearchValue] = useState("");
    const [searchBy, setSearchBy] = useState("tag");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroSubestacion, setFiltroSubestacion] = useState("");

    useEffect(() => {
        document.title = "Mapa de Activos";
    }, []);

    // Cargar activos
    useEffect(() => {
        async function fetchAssets() {
            try {
                setLoading(true);
                const { items } = await getAllAssets([
                    "tag",
                    "latitud",
                    "longitud",
                    "substation_name",
                    "company",
                    "status"
                ]);

                setAssets(items ?? []);
                setFilteredAssets(items ?? []);
            } catch (err) {
                console.error(err);
                setError("Error al cargar los activos del mapa");
            } finally {
                setLoading(false);
            }
        }

        fetchAssets();
    }, []);

    // Función para aplicar filtros
    const applyFilters = useCallback(() => {
        let filtered = [...assets];

        // Filtro por búsqueda principal
        if (searchValue.trim()) {
            filtered = filtered.filter(asset => {
                const value = searchValue.toLowerCase().trim();
                switch (searchBy) {
                    case "tag":
                        return asset.tag?.toLowerCase().includes(value);
                    case "status":
                        return asset.tag_estado?.toLowerCase().startsWith(value);
                    case "substation_name":
                        return asset.nombre_subestacion?.toLowerCase().includes(value);
                    default:
                        return true;
                }
            });
        }

        // Filtro por estado
        if (filtroEstado) {
            filtered = filtered.filter(asset => 
                asset.tag_estado?.startsWith(filtroEstado)
            );
        }

        // Filtro por subestación
        if (filtroSubestacion.trim()) {
            filtered = filtered.filter(asset =>
                asset.nombre_subestacion?.toLowerCase().includes(filtroSubestacion.toLowerCase().trim())
            );
        }

        setFilteredAssets(filtered);
    }, [assets, searchValue, searchBy, filtroEstado, filtroSubestacion]);

    // Aplicar filtros automáticamente cuando cambien los criterios
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Manejar búsqueda con Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchValue("");
        setSearchBy("tag");
        setFiltroEstado("");
        setFiltroSubestacion("");
        setFilteredAssets(assets);
    };

    const formattedAssets = filteredAssets
        .filter((a) => a.latitud && a.longitud)
        .map((a) => ({
            tag: a.tag,
            latitud: a.latitud,
            longitud: a.longitud,
            subestacion: a.nombre_subestacion,
            empresa: a.empresa,
            estado: a.tag_estado
        }));

    return (
        <div>
            <div className="top-0 left-0 justify-center shadow-md z-50 ">
                <TopBar_l />
            </div>
            <div className="relative container mx-auto px-4 py-10 mt-16">
            <MapSearchBar
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
                        handleSearch={applyFilters}
                        handleClearFilters={handleClearFilters}
                        handleKeyPress={handleKeyPress}
                    />
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-start">
                
                

                {loading ? (
                    <div className="bg-gray-100 border border-black rounded-2xl p-4 w-full max-w-sm mx-auto mt-20 shadow">
                        <p className="text-center text-gray-700 font-medium">Cargando activos...</p>
                    </div>
                ) : error ? (
                    <div className="bg-gray-100 border border-black rounded-2xl p-4 w-full max-w-sm mx-auto mt-20 shadow">
                        <p className="text-center text-red-600">{error}</p>
                    </div>

                ) : (
                    <div className="w-full max-w-6xl">
                        <AssetMap assets={formattedAssets} />
                    </div>
                )}
            </div>
            <div className="mt-6"></div>
        </div>
    );
};

export default MapPage;