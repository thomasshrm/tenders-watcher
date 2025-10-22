import { Outlet } from "react-router-dom";
import { CommandBar } from "@/components/layout/CommandBar";
import DraggableCommandModal from "@/features/command/DraggableCommandModal";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <CommandBar />
            <main className="mx-auto max-w-6xl px-4 py-6">
                <Outlet />
            </main>
            <DraggableCommandModal />
        </div>
    )
}