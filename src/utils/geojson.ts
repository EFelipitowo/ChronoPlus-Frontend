// utils/geojson.ts
import type { MapAsset } from "../components/layout/AssetMap";
import type { Feature, FeatureCollection, Point } from 'geojson';

// 📍 Convierte cada activo en un punto individual (para uso geográfico normal)
export const assetsToGeoJSON = (assets: MapAsset[]): FeatureCollection => {
    return {
        type: 'FeatureCollection',
        features: assets.map((a) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [a.longitud, a.latitud], // [lng, lat] en GeoJSON
            },
            properties: {
                TAG: a.tag,
                empresa: a.empresa,
                subestacion: a.subestacion,
                estado : a.estado
            },
        })),
    };
};

// 🏢 Agrupa lógicamente por subestación: un punto por subestación (centroide)
export const substationToGeoJSON = (assets: MapAsset[]): FeatureCollection => {
    const grouped: Record<string, MapAsset[]> = {};
    assets.forEach(asset => {
        if (!grouped[asset.subestacion]) {
            grouped[asset.subestacion] = [];
        }
        grouped[asset.subestacion].push(asset);
    });

    const features: Feature<Point>[] = Object.entries(grouped).map(([subestacion, assetList]) => {
        const sumLng = assetList.reduce((sum, a) => sum + a.longitud, 0);
        const sumLat = assetList.reduce((sum, a) => sum + a.latitud, 0);
        const avgLng = sumLng / assetList.length;
        const avgLat = sumLat / assetList.length;

        const feature: Feature<Point> = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [avgLng, avgLat],
            },
            properties: {
                subestacion,
                count: assetList.length,
                assets: assetList.map(a => ({
                    TAG: a.tag,
                    latitud: a.latitud,
                    longitud: a.longitud,
                    empresa: a.empresa,
                    subestacion: a.subestacion,
                })),
            },
        };

        return feature;
    });

    return {
        type: 'FeatureCollection',
        features,
    };
};