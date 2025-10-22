import React from "react";
import { CommandBar } from "@/components/CommandBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <CommandBar />
            <main className="pt-10">{children}</main>
        </div>
    )
}