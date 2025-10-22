import { apiFetch, apiFetchRaw } from "./api";
import type { DataItem } from "../components/ui/Table";


export interface ApiResponse<T> {
  items: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ApiSingleResponse<T> {
  items: T,
  metadata: {
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
  encargado: string;
  observacion: string;
  ocurrencia_evento: string;
}

// Define the shape of an Asset (matching your backend’s JSON)
export interface Asset extends DataItem {
  tag: string;
  tag_marca: string;
  tag_estado: string;
  empresa: string;
  nombre_subestacion: string;
  modificado_en: string;
  nema: string;
  latitud: number;
  longitud: number;
}

export interface AssetFile {
  id: string;
  nombre: string;
  tipo: string;
  fechaSubida: string; // timestamp
  gcs_path: string; // URL para abrir o descargar
}

export function getAssetFiles(id: string): Promise<ApiResponse<AssetFile>> {
  const params = new URLSearchParams({
    sort: "fechaSubida",
    order: "desc",
  });
  return apiFetch<ApiResponse<AssetFile>>(`/assets/${id}/documents`);
}

export async function downloadAssetFile(fileId: string): Promise<{ blob: Blob; filename: string }> {
  const response = await apiFetchRaw(`/documents/${fileId}/download`, {
    method: "GET"
  });

  // 👇 Log all headers to inspect what the backend actually sends
  console.log("Response headers:", Array.from(response.headers.entries()));

  const disposition = response.headers.get("Content-Disposition");
  console.log("Content-Disposition:", disposition); // 👈 specifically check this one

  let filename = "archivo";

  if (disposition) {
    // Try RFC 5987 (filename*="UTF-8''...")
    const utf8FilenameRegex = /filename\*\s*=\s*UTF-8''([^;]+)/i;
    const asciiFilenameRegex = /filename\s*=\s*["']?([^;"']+)["']?/i;

    const utf8Match = utf8FilenameRegex.exec(disposition);
    const asciiMatch = asciiFilenameRegex.exec(disposition);

    if (utf8Match) {
      filename = decodeURIComponent(utf8Match[1]);
    } else if (asciiMatch) {
      filename = asciiMatch[1];
    }
  }

  const blob = await response.blob();
  return { blob, filename };
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

// Get all assets (using total count dinamymically)
export async function getAllAssets(fields: string[] = [], filterParams: Record<string, any> = {}) {
  const countRes = await apiFetch<{ count: number }>("/assets/count");
  const total = countRes.count;
  return getLatestAssets(total, 1, fields, filterParams);
}



// Obtener activo segun su ID (tag)
export function getAssetData(id: string): Promise<ApiSingleResponse<Asset>> {
  return apiFetch<ApiSingleResponse<Asset>>(`/assets/${id}`);
}

// Obtener eventos de un activo segun si ID (tag)
export function getAssetEvents(id: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<AssetEvent>> {
  return apiFetch<ApiResponse<AssetEvent>>(`/assets/${id}/events?page=${page}&pageSize=${pageSize}`);
}