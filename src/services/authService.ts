import { apiFetch } from "./api";

//export interface LoginResponse {
//    token: string;
//    user: { id: string; email: string };
//}

export interface LoginResponse {
    accessToken: string;
}

export function login(email: string, password: string) {
    return apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}
