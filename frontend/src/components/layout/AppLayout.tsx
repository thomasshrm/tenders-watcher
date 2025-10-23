import { Outlet, Navigate, useLocation } from "react-router-dom";
import { CommandBar } from "@/components/layout/CommandBar";
import { CommandWindowProvider } from "@/features/command/command-window-store";
import CommandWindowsLayer from "@/features/command/CommandWindowsLayer";
import { useAuth } from "@/features/auth/auth-context";
import { ModuleIfGuest } from "@/features/auth/module-if-guest";
import { ModuleIfAuth } from "@/features/auth/module-if-auth";

export default function AppLayout() {
    const location = useLocation();
    const auth = useAuth();

    if (!auth) return null;
    const { user } = auth;

    if (!user && location.pathname !== "/login") {
        return <Navigate to="/login" replace />
    }

    return (
        <div>
            <ModuleIfAuth>
                <div className="min-h-full bg-neutral-900 text-white">
                <CommandWindowProvider>
                    <CommandBar />
                    <main className="mx-auto max-w-6xl px-4 py-6">
                    <Outlet />
                    </main>
                    <CommandWindowsLayer />
                </CommandWindowProvider>
                </div>
            
            </ModuleIfAuth>
            <ModuleIfGuest>
                <Outlet />
            </ModuleIfGuest>
        </div>
    )
}