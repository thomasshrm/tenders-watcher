import { Outlet } from "react-router-dom";
import { CommandBar } from "@/components/layout/CommandBar";
import { CommandWindowProvider } from "@/features/command/command-window-store";
import CommandWindowsLayer from "@/features/command/CommandWindowsLayer";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <CommandWindowProvider>
                <CommandBar />
                <main className="mx-auto max-w-6xl px-4 py-6">
                <Outlet />
                </main>
                <CommandWindowsLayer />
            </CommandWindowProvider>
        </div>
    )
}