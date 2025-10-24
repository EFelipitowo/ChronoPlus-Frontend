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
  json_datos: Record<string, any>; // parsed JSON object
}

export interface AssetFile {
  id: string;
  nombre: string;
  tipo: string;
  fechaSubida: string; // timestamp
  gcs_path: string; 
  categoria: string;// URL para abrir o descargar
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
  fields: string[] = [],               // optional fields to retrieve (field projection)
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
export async function getAssetData(id: string): Promise<ApiSingleResponse<Asset>> {
  const res = await apiFetch<ApiSingleResponse<Asset>>(`/assets/${id}`);

  if (res.items) {
    if (res.items.json_datos) {
      try {
        res.items.json_datos = JSON.parse(res.items.json_datos);
      } catch (err) {
        console.error("Failed to parse json_datos for asset", id, err);
        res.items.json_datos = {};
      }
    } else {
      res.items.json_datos = {};
    }
  } else {
    // Optional: handle missing item gracefully
    console.warn(`Asset with id ${id} not found`);
  }

  return res;
}


// Obtener eventos de un activo segun si ID (tag)
export function getAssetEvents(id: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<AssetEvent>> {
  return apiFetch<ApiResponse<AssetEvent>>(`/assets/${id}/events?page=${page}&pageSize=${pageSize}`);
}

// Generar Excel con los mismos filtros que getLatestAssets en HomePage
export async function generateExcelReport(filterParams: Record<string, any> = {}): Promise<Blob> {
  const params = new URLSearchParams();

  // Añadir filtros (solo si tienen valor)
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== "" && value != null) {
      params.append(key, String(value));
    }
  });

  const response = await apiFetchRaw(`/assets/export?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al generar el Excel: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}

// Subir un archivo asociado a un activo
export async function uploadAssetFile(
  tag: string,
  file: File,
  description: string,
  category: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("nombre", getFileNameWithoutExtension(file));
  formData.append("tipo_archivo", mimeToFriendly(file.type));
  formData.append("descripcion", description);
  formData.append("categoria", category);

  await apiFetchRaw(`/assets/${tag}/documents`, {
    method: "POST",
    body: formData,
    // No establecer Content-Type
  });
}

//Utility
const mimeToFriendly = (mime: string) => {
  if (mime.startsWith("image/")) return "Imagen";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word")) return "Word";
  return "Archivo";
};

const getFileNameWithoutExtension = (file: File) => {
  const nameParts = file.name.split(".");
  if (nameParts.length === 1) return file.name; // no extension
  nameParts.pop(); // remove last part (extension)
  return nameParts.join(".");
};


export const downloadAssetExcel = async (assetId: string) => {
  // Use your wrapper (it will attach the Authorization header)
  const response = await apiFetchRaw(`/assets/${assetId}/events/export`, {
    method: "GET",
  });

  // Convert response to Blob
  const blob = await response.blob();

  // Try to extract the filename from the Content-Disposition header
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `eventos_${assetId}.xlsx`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^"]+)/);
    if (match && match[1]) {
      try {
        filename = decodeURIComponent(match[1]);
      } catch {
        filename = match[1];
      }
    }
  }

  return { blob, filename };
};
