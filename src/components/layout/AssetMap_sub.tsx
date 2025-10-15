import "../../pages/styles/style.css"
import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import chroma from "chroma-js";

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

const AssetMap: React.FC<AssetMapProps> = ({ assets }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const navigate = useNavigate();

    // ⚡️ Definir la función global para usar en el popup
    useEffect(() => {
        (window as any).openAsset = (tag: string) => {
            navigate(`/asset/${tag}`);
        };
    }, [navigate]);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/satellite/style.json?key=k8MtGKJUXflWjgNmQzoo',
            center: [-71.5, -37.7],
            zoom: 3,
        });

        map.current.on("load", () => {
            // 🎨 Crear una paleta de colores para las subestaciones
            const uniqueSubs = [...new Set(assets.map(a => a.subestacion))];
            const palette = chroma.scale("Paired").colors(uniqueSubs.length);
            const subColors: Record<string, string> = {};
            uniqueSubs.forEach((s, i) => (subColors[s] = palette[i]));

            // 🚀 Crear una fuente y capas por cada subestación
            uniqueSubs.forEach((sub) => {
                const color = subColors[sub];
                const subAssets = assets.filter(a => a.subestacion === sub);
                const geoData = assetsToGeoJSON(subAssets);

                map.current!.addSource(`assets-${sub}`, {
                    type: "geojson",
                    data: geoData,
                    cluster: true,
                    clusterMaxZoom: 9,
                    clusterRadius: 20,
                });

                // 🔵 Capa de clusters
                map.current!.addLayer({
                    id: `clusters-${sub}`,
                    type: "circle",
                    source: `assets-${sub}`,
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": color,
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            15, 10, 25, 30, 35
                        ],
                        "circle-stroke-color": "#fff",
                        "circle-stroke-width": 1,
                    },
                });

                // 🔢 Número dentro del cluster
                map.current!.addLayer({
                    id: `cluster-count-${sub}`,
                    type: "symbol",
                    source: `assets-${sub}`,
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": sub.substring(0, 2).toUpperCase(),
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                    },
                    paint: { "text-color": "#fff" },
                });

                // 🔴 Puntos individuales
                map.current!.addLayer({
                    id: `unclustered-point-${sub}`,
                    type: "circle",
                    source: `assets-${sub}`,
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": color,
                        "circle-radius": 8,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff",
                    },
                });


                const sourceId = `assets-${sub}`;

                // Click en cluster de esta subestación → zoom
                map.current!.on('click', `clusters-${sub}`, async (e) => {
                    const features = map.current!.queryRenderedFeatures(e.point, {
                        layers: [`clusters-${sub}`],
                    });
                    const feature = features[0];
                    if (!feature) return;

                    const clusterId = feature.properties?.cluster_id;
                    if (typeof clusterId !== 'number') return;

                    const source = map.current!.getSource(sourceId) as maplibregl.GeoJSONSource;
                    if (!source) return;

                    try {
                        const zoom = await source.getClusterExpansionZoom(clusterId);
                        map.current!.flyTo({
                            center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
                            zoom: Math.min(zoom + 1, 20),
                            essential: true,
                        });
                    } catch (err) {
                        console.warn('Error al expandir cluster:', err);
                    }
                });

                // Click en punto individual de esta subestación
                map.current!.on('click', `unclustered-point-${sub}`, (e) => {
                    const features = map.current!.queryRenderedFeatures(e.point, {
                        layers: [`unclustered-point-${sub}`],
                    });
                    if (features.length === 0) return;

                    const clickLat = e.lngLat.lat;
                    const clickLng = e.lngLat.lng;

                    const nearbyAssets = features.filter(f => {
                        const [assetLng, assetLat] = (f.geometry as GeoJSON.Point).coordinates;
                        const distance = haversineDistance(clickLat, clickLng, assetLat, assetLng);
                        return distance <= 200;
                    });

                    if (nearbyAssets.length === 0) return;

                    const listItems = nearbyAssets.map(f => `
      <div class="mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0">
        <h4 class="font-bold text-sm">Equipo: ${f.properties.TAG}</h4>
        <p class="text-xs"><strong>Empresa:</strong> ${f.properties.empresa}</p>
        <p class="text-xs"><strong>Subestación:</strong> ${f.properties.subestacion}</p>
        <button 
          onclick="window.openAsset('${f.properties.TAG}')"
          class="mt-1 text-blue-600 underline text-xs map-button"
        >
          Ver detalles
        </button>
      </div>
    `).join('');

                    const popup = new maplibregl.Popup({
                        closeButton: false,
                        closeOnMove: true,
                        maxWidth: "320px",
                        offset: [0, -10]
                    })
                        .setLngLat(e.lngLat)
                        .setHTML(`<div class="p-2 max-w-xs max-h-72 overflow-y-auto overflow-x-hidden scroll-bar-map">${listItems}</div>`);

                    const mapHeight = map.current!.getContainer().offsetHeight;
                    map.current!.panBy([0, -mapHeight * 0.075], { duration: 300 });
                    popup.addTo(map.current!);
                });

                // Cursor interactions
                const setCursor = (cursor: string) => () =>
                    (map.current!.getCanvas().style.cursor = cursor);

                map.current!.on('mouseenter', `clusters-${sub}`, setCursor('pointer'));
                map.current!.on('mouseleave', `clusters-${sub}`, setCursor(''));
                map.current!.on('mouseenter', `unclustered-point-${sub}`, setCursor('pointer'));
                map.current!.on('mouseleave', `unclustered-point-${sub}`, setCursor(''));
            });
        });

        return () => {
            map.current?.remove();
        };
    }, [assets]);

    return (
        <div
            ref={mapContainer}
            className="border-2 border-black w-full h-[500px] sm:h-[600px] rounded-xl shadow-md "
        />
    );
};

export default AssetMap;