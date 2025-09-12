const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; 


export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
    ): Promise<T> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}
