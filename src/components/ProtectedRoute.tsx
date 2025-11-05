import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // No token → redirect to login
        return <Navigate to="/" replace />;
    }

    // Optional: check if token is expired
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expired = Date.now() >= payload.exp * 1000;
        if (expired) {
            localStorage.removeItem("token");
            return <Navigate to="/" replace />;
        }
    } catch {
        // Token invalid or corrupted
        localStorage.removeItem("token");
        return <Navigate to="/" replace />;
    }

    // Token OK → allow access
    return <>{children}</>;
};

export default ProtectedRoute;
