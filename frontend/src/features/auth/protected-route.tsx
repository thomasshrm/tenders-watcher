import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

export function ProtectedRoute() {
    const { user, hydrated } = useAuth() as any;
    if (!hydrated) return <div className="p-6 text-muted-foreground">Chargement…</div>;
    if(!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}