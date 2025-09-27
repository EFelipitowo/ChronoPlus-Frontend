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

export interface ApiSingleResponse<T>{
    items: T,
    metadata:{
        total: number;
        page: number;
        pageSize: number;
    };
}

export interface AssetEvent extends DataItem {
    tag: string;
    id_evento: string;
    estado_menor: string;
    descripcion: string;
    empresa: string;
    subestacion: string;
    encargado: string ;
    observacion: string;
    ocurrencia_evento: string;
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
// Fetch assets with pagination + filters
export function getLatestAssets(
  limit: number = 20,
  page: number = 1,
  fields: string[] = [],               // optional fields to retrieve
  filterParams: Record<string, any> = {} // filters to apply
): Promise<ApiResponse<Asset>> {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    sort: "updated_at",  // or "creado_en", depending on your default
    order: "desc",
  });

  if (fields.length > 0) {
    params.append("fields", fields.join(",")); // comma-separated projection
  }

  // Add filters, skip empty values
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== "" && value != null) {
      params.append(key, String(value));
    }
  });
  console.log("Fetching assets with params:", params.toString());
  return apiFetch<ApiResponse<Asset>>(`/assets?${params.toString()}`);
}



// Obtener activo segun su ID (tag)
export function getAssetData(id : string): Promise<ApiSingleResponse<Asset>> {
    return apiFetch<ApiSingleResponse<Asset>>(`/assets/${id}`);
}

// Obtener eventos de un activo segun si ID (tag)
export function getAssetEvents(id: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<AssetEvent>> {
    return apiFetch<ApiResponse<AssetEvent>>(`/assets/${id}/events?page=${page}&pageSize=${pageSize}`);
}