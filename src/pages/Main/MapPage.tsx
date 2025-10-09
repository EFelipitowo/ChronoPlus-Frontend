import React, { useEffect, useState } from "react";
import "../styles/style.css";
import TopBar_l from "../../components/layout/TopBar_logged";
import AssetMap from "../../components/layout/AssetMap";
import { getLatestAssets } from "../../services/assetService";
import type { Asset } from "../../services/assetService";

const MapPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchAssets() {
            try {
                setLoading(true);
                const { items } = await getLatestAssets(7000, 1, [
                    "tag",
                    "latitud",
                    "longitud",
                    "substation_name",
                    "company",
                    "status"
                ]);

                setAssets(items ?? []);
            } catch (err) {
                console.error(err);
                setError("Error al cargar los activos del mapa");
            } finally {
                setLoading(false);
            }
        }

        fetchAssets();
    }, []);

    const formattedAssets = assets
        .filter((a) => a.latitud && a.longitud)
        .map((a) => ({
            tag: a.tag,
            latitud: a.latitud,
            longitud: a.longitud,
            subestacion: a.nombre_subestacion,
            empresa: a.empresa,
        }));

    return (
        <div>
            <div className="top-0 left-0 justify-center shadow-md z-50 ">
                <TopBar_l />
            </div>

            <div className="flex-grow flex flex-col items-center justify-start">
                <div className="relative container mx-auto px-4 py-10 mt-12">
                    <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-300">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800">
                            Mapa de Equipos
                        </h1>
                    </div>
                </div>

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
            <div className = "mt-6"></div>
        </div>
    );
};

export default MapPage;
