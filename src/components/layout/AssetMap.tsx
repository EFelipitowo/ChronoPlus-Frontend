import "../../pages/styles/style.css"
import React, { useEffect, useRef } from 'react';
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

        map.current.on('load', () => {
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
                const clusterId = feature?.properties?.cluster_id;
                const source = map.current!.getSource('assets') as maplibregl.GeoJSONSource;
                if (typeof clusterId !== 'number' || !source) return;
                const zoom = await source.getClusterExpansionZoom(clusterId);
                map.current!.flyTo({
                    center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
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
                const mapHeight = map.current!.getContainer().offsetHeight;
                const popupOffset = mapHeight * 0.15; // mueve un 15% hacia arriba
                map.current!.panBy([0, -popupOffset / 2], { duration: 300 });

                popup.addTo(map.current!);
                });

            

            // Cursor
            const setCursor = (cursor: string) => () =>
                (map.current!.getCanvas().style.cursor = cursor);
            map.current!.on('mouseenter', 'clusters', setCursor('pointer'));
            map.current!.on('mouseleave', 'clusters', setCursor(''));
            map.current!.on('mouseenter', 'unclustered-point', setCursor('pointer'));
            map.current!.on('mouseleave', 'unclustered-point', setCursor(''));
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