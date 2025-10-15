// utils/groupAssets.ts
import type { MapAsset } from "../components/layout/AssetMap";
import { haversineDistance } from "./distance";

export type GroupingMode = 'substation' | 'distance';

interface GroupedFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    properties: {
        groupKey: string;
        assetCount: number;
        assets: MapAsset[];
    };
}

const DISTANCE_THRESHOLD_METERS = 1000; // ajusta según necesidad

export const groupAssets = (
    assets: MapAsset[],
    mode: GroupingMode
): GeoJSON.FeatureCollection => {
    if (mode === 'substation') {
        const groups = new Map<string, MapAsset[]>();
        assets.forEach(asset => {
            const key = asset.subestacion || 'Sin subestación';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(asset);
        });

        const features: GroupedFeature[] = Array.from(groups.entries()).map(
            ([subestacion, assetsInGroup]) => {
                // Usamos el primer activo como representante (o promedio si quieres)
                const representative = assetsInGroup[0];
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [representative.longitud, representative.latitud],
                    },
                    properties: {
                        groupKey: subestacion,
                        assetCount: assetsInGroup.length,
                        assets: assetsInGroup,
                    },
                };
            }
        );

        return { type: 'FeatureCollection', features };
    }

    // Modo 'distance': agrupamiento por proximidad (simple greedy)
    let ungrouped = [...assets];
    const groups: MapAsset[][] = [];

    while (ungrouped.length > 0) {
        const current = ungrouped.shift()!;
        const group = [current];
        const remaining = [];

        for (const asset of ungrouped) {
            const dist = haversineDistance(
                current.latitud,
                current.longitud,
                asset.latitud,
                asset.longitud
            );
            if (dist <= DISTANCE_THRESHOLD_METERS) {
                group.push(asset);
            } else {
                remaining.push(asset);
            }
        }

        groups.push(group);
        ungrouped = remaining;
    }

    const features: GroupedFeature[] = groups.map(group => {
        const representative = group[0];
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [representative.longitud, representative.latitud],
            },
            properties: {
                groupKey: `Cluster (${group.length})`,
                assetCount: group.length,
                assets: group,
            },
        };
    });

    return { type: 'FeatureCollection', features };
};