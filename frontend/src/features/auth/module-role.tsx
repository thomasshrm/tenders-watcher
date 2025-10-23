import { type ReactNode } from "react";
import { useAuth } from "./auth-context";

export function ModuleRole({ roles, children }: { roles?: string[]; children: ReactNode }) {
    const { hasRole } = useAuth();
    if (roles && !hasRole(...roles)) return null;
    return <>{children}</>;
}