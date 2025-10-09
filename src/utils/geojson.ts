import type { MapAsset } from "../components/layout/AssetMap";
import "../pages/styles/style.css"

export const assetsToGeoJSON = (assets: MapAsset[]): GeoJSON.FeatureCollection => {
    return {
        type: 'FeatureCollection',
        features: assets.map((a) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [a.longitud, a.latitud], // ¡Ojo! GeoJSON usa [lng, lat]
            },
            properties: {
                TAG: a.tag,
                empresa: a.empresa,
                subestacion: a.subestacion,
            },
        })),
    };
};