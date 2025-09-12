import { apiFetch } from "./api";
import type { DataItem } from "../components/ui/Table";


export interface ApiResponse<T> {
    items: T[];
    metadata: {
        total: number;
        page: number;
        pageSize: number;
    };
}

// Define the shape of an Asset (matching your backend’s JSON)
export interface Asset extends DataItem {
    tag: number;
    tag_marca: string;
    tag_estado: string;
    empresa: string;
    nombre_subestacion: string;
    modificado_en: string;
}

// Fetch latest modified assets
export function getLatestAssets(limit: number = 20): Promise<ApiResponse<Asset>> {
    return apiFetch<ApiResponse<Asset>>(`/assets?sort=created_at&order=desc&limit=${limit}`);
}
