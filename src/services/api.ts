const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; 


export async function apiFetch<T>(
        endpoint: string,
        options: RequestInit & { responseType?: 'json' | 'blob' | 'text'; rawResponse?: boolean } = {}
    ): Promise<T | Response> {
        const token = localStorage.getItem("token");
        const { responseType = 'json', rawResponse = false, ...fetchOptions } = options;

        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                ...(responseType !== 'blob' ? { "Content-Type": "application/json" } : {}), // skip JSON header for blobs
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(fetchOptions.headers || {}),
            },
            ...fetchOptions,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // If caller wants the raw Response object (to access headers, etc.)
        if (rawResponse) {
            return response;
        }

        // Handle different response types
        switch (responseType) {
            case 'blob':
                 return (await response.blob()) as T;
            case 'text':
                return (await response.text()) as T;
            default:
                 return (await response.json()) as T;
        }
}

