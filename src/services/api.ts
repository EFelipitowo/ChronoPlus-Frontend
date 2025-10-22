const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Returns JSON data by default, but can also return Blob or text based on responseType
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit & { responseType?: 'json' | 'blob' | 'text' } = {}
): Promise<T> {
    const { responseType = 'json', ...fetchOptions } = options;

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            ...(responseType !== 'blob' ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(fetchOptions.headers || {}),
        },
        ...fetchOptions,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    switch (responseType) {
        case 'blob':
            return (await response.blob()) as T;
        case 'text':
            return (await response.text()) as T;
        default:
            return (await response.json()) as T;
    }
}

// Returns the raw Response object for more control over headers, status, etc.
export async function apiFetchRaw(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response; // ✅ raw Response object
}



