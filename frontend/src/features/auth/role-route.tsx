import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

export function RoleRoute({ roles }: {roles: string[] }) {
    const { user, hydrated } = useAuth() as any;
    if (!hydrated) return <div className="p-6 text-muted-foreground">Chargement…</div>;
    if(!user) return <Navigate to="/login" replace />;
    if(!roles.includes(user.role)) return <Navigate to="/forbidden" replace />;
    return <Outlet />;
}