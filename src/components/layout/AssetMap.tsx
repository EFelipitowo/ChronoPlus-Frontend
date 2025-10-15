import "../../pages/styles/style.css"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { assetsToGeoJSON } from '../../utils/geojson';
import { haversineDistance } from "../../utils/distance";

export interface MapAsset {
    tag: string;
    latitud: number;
    longitud: number;
    subestacion: string;
    empresa: string;
    estado: string
}

interface AssetMapProps {
    assets: MapAsset[];
}

declare global {
    interface Window {
        openAsset?: (tag: string) => void;
    }
}

const AssetMap: React.FC<AssetMapProps> = ({ assets }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const navigate = useNavigate();
    const [visibleAssets, setVisibleAssets] = useState<MapAsset[]>([]);


    const getEstadoClass = (estado: string | number): string => {
        const str = String(estado);
        const firstChar = str[0];
        if (firstChar === "1") return "bg-blue-100 text-blue-800";
        if (firstChar === "2") return "bg-green-100 text-green-800";
        if (firstChar === "3") return "bg-yellow-100 text-yellow-800";
        if (firstChar === "4") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    // ⚡️ Definir la función global para usar en el popup
    useEffect(() => {
        window.openAsset = (tag: string) => {
            navigate(`/asset/${tag}`);
        };
    }, [navigate]);

    // Función para obtener activos visibles
    const updateVisibleAssets = useCallback(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        try {
            const bounds = map.current.getBounds();
            const west = bounds.getWest();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const north = bounds.getNorth();

            const visible = assets.filter(asset => {
                const lng = asset.longitud;
                const lat = asset.latitud;
                return lng >= west && lng <= east && lat >= south && lat <= north;
            });

            setVisibleAssets(visible);
        } catch (err) {
            console.error('Error al filtrar activos visibles:', err);
            setVisibleAssets([]);
        }
    }, [assets]); // ✅ Depende de `assets`

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/satellite/style.json?key=k8MtGKJUXflWjgNmQzoo',
            center: [-71.5, -37.7],
            zoom: 3,
        });

        

        map.current.on('load', () => {

            const handleUpdate = () => {
                updateVisibleAssets();
            };

            const geoData = assetsToGeoJSON(assets);

            // Fuente
            map.current!.addSource('assets', {
                type: 'geojson',
                data: geoData,
                cluster: true,
                clusterMaxZoom: 9,
                clusterRadius: 15,
            });

            // Capa de clusters
            map.current!.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'assets',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#d32f2f',
                        50,
                        '#ba4747',
                        100,
                        '#752d2d',
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        10,
                        30,
                        50,
                        40,
                    ],
                },
            });

            // Etiquetas
            map.current!.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'assets',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                },
                paint: { 'text-color': '#fff' },
            });

            // Puntos individuales
            map.current!.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'assets',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#e53935',
                    'circle-radius': 8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff',
                },
            });

            // Click en cluster → zoom
            map.current!.on('click', 'clusters', async (e) => {
                const feature = e.features?.[0];
                if (!feature || !feature.geometry || !feature.properties) return;

                const clusterId = feature.properties.cluster_id;
                if (typeof clusterId !== 'number') return;

                const source = map.current!.getSource('assets') as maplibregl.GeoJSONSource;
                if (!source) return;

                const zoom = await source.getClusterExpansionZoom(clusterId);
                const coords = (feature.geometry as GeoJSON.Point).coordinates;
                if (!Array.isArray(coords) || coords.length < 2) return;

                map.current!.flyTo({
                    center: [coords[0], coords[1]] as [number, number],
                    zoom: zoom + 1,
                    essential: true,
                });
            });

            // Click en punto individual
            map.current!.on('click', 'unclustered-point', (e) => {
                const features = map.current!.queryRenderedFeatures(e.point, {
                    layers: ['unclustered-point'],
                });
                if (features.length === 0) return;
                // Coordenadas del clic (en [lng, lat])
                const clickCoords = e.lngLat.toArray(); // [lng, lat]
                const clickLat = clickCoords[1];
                const clickLng = clickCoords[0];

                // Filtrar por distancia real (menos de 50 metros)
                const nearbyAssets = features.filter(f => {
                    const assetLng = (f.geometry as GeoJSON.Point).coordinates[0];
                    const assetLat = (f.geometry as GeoJSON.Point).coordinates[1];
                    const distance = haversineDistance(clickLat, clickLng, assetLat, assetLng);
                    return distance <= 200; // metros
                });

                if (nearbyAssets.length === 0) return;

                // Generar HTML con todos los activos cercanos
                const listItems = nearbyAssets.map(f => {
                    const estado = String(f.properties.estado);
                    let estadoClass = "bg-gray-100 text-gray-800";
                    if (estado[0] === "1") {
                        estadoClass = "bg-blue-100 text-blue-800";
                    } else if (estado[0] === "2") {
                        estadoClass = "bg-green-100 text-green-800";
                    } else if (estado[0] === "3") {
                        estadoClass = "bg-yellow-100 text-yellow-800";
                    } else if (estado[0] === "4") {
                        estadoClass = "bg-red-100 text-red-800";
                    }

                    return `
                    <div class="mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0">
                    <h4 class="font-bold text-sm">Equipo: ${f.properties.TAG}</h4>
                    <p class="text-sm">
                        <span class="font-bold">Estado:</span>
                        <span class="font-bold ml-1 px-2 rounded-full ${estadoClass}">${f.properties.estado.substring(0, 3)}</span>
                    </p>
                    <p class="text-xs"><strong>Empresa:</strong> ${f.properties.empresa}</p>
                    <p class="text-xs"><strong>Subestación:</strong> ${f.properties.subestacion}</p>
                    <button 
                        onclick="window.openAsset('${f.properties.TAG}')"
                        class="mt-1 text-blue-600 underline text-xs map-button"
                    >
                        Ver detalles
                    </button>
                    </div>
                `}).join('');

                const props = e.features?.[0]?.properties;
                if (!props) return;

                const popup = new maplibregl.Popup({
                    closeButton: false,
                    closeOnMove: true, // si mueves el mapa, se cierra el popup
                    maxWidth: "320px",
                    offset: [0, -10]
                })
                    .setLngLat(e.lngLat)
                    .setHTML(`<div class="p-2 max-w-xs max-h-72 overflow-y-auto overflow-x-hidden scroll-bar-map">${listItems}</div>`)
                /*
                const mapHeight = map.current!.getContainer().offsetHeight;
                const popupOffset = mapHeight * 0.15; // mueve un 15% hacia arriba
                map.current!.panBy([0, -popupOffset / 2], { duration: 300 });
                */
                popup.addTo(map.current!);
            });



            // Cursor
            const setCursor = (cursor: string) => () =>
                (map.current!.getCanvas().style.cursor = cursor);
            map.current!.on('mouseenter', 'clusters', setCursor('pointer'));
            map.current!.on('mouseleave', 'clusters', setCursor(''));
            map.current!.on('mouseenter', 'unclustered-point', setCursor('pointer'));
            map.current!.on('mouseleave', 'unclustered-point', setCursor(''));
            // ✅ 1. Actualizar una vez cuando el mapa esté completamente inactivo (todo renderizado)
            const onIdleOnce = () => {
                updateVisibleAssets();
                map.current!.off('idle', onIdleOnce); // auto-limpieza
            };
            map.current!.on('idle', onIdleOnce);

            // ✅ 2. Escuchar cambios posteriores
            map.current!.on('moveend', handleUpdate);
            map.current!.on('zoomend', handleUpdate);
        });

        return () => {
            if (map.current) {
                // ✅ Limpiar listeners para evitar memory leaks
                map.current.off('moveend', updateVisibleAssets);
                map.current.off('zoomend', updateVisibleAssets);
                map.current.remove();
            }
        };
    }, [assets, updateVisibleAssets]);

    return (
        <div className="flex flex-col sm:flex-row w-full h-[500px] sm:h-[600px] rounded-xl shadow-md border-2 border-black">
            {/* Panel lateral */}
            <div className="w-full sm:w-64 bg-white p-4 overflow-y-auto shadow-md">
                <h3 className="font-bold text-lg mb-3">Activos en vista</h3>
                {visibleAssets.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay activos visibles.</p>
                ) : (
                    <ul className="space-y-3">
                        {visibleAssets.map((asset, idx) => {
                            const estadoClass = getEstadoClass(asset.estado);

                            return (
                                <li key={idx} className="border-b pb-2 last:border-0">
                                    <h4 className="font-semibold text-sm">{asset.tag}</h4>
                                    <p className="text-xs text-gray-600">
                                        <span className="font-medium">Estado:</span>
                                        <span className={`ml-1 px-2 rounded-full text-xs font-medium ${estadoClass}`}>
                                            {asset.estado.substring(0, 3)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-600">Empresa: {asset.empresa}</p>
                                    <p className="text-xs text-gray-600">Subestación: {asset.subestacion}</p>
                                    <button
                                        onClick={() => navigate(`/asset/${asset.tag}`)}
                                        className="mt-1 text-black underline text-xs map-button"
                                    >
                                        Ver detalles
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <div
                ref={mapContainer}
                className="flex-1 w-full"
            />
        </div>
    );
};

export default AssetMap;