import { api } from "@/lib/api";
import { useState } from "react";
import DescripteursMultiSelectForm from "@/features/misc/descripteurs/descripteurs-multi-select-form";



export default function PersonalPreferencesPanel() {  
    return (
        <div className="space-y-2">
            <p className="text-base font-semibold text-neutral-400">Gérer vos préférences personnelles.</p>
            <DescripteursMultiSelectForm />
        </div>
    );
}
