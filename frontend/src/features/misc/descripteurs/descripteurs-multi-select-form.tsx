import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';


type Descripteur = {
    code: string
    libelle: string
}

export default function DescripteursMultiSelectForm() {
    const [descripteurs, setDescripteurs] = useState<Descripteur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth() as any;
    
    const fetchDescripteurs = async () => {
        try{
            setLoading(true)
            setError(null)
            const { data } = await api.get("/api/descripteurs")
            console.log(data)
            setDescripteurs(data)
        } catch (e: any) {
            setError(e?.message ?? "Erreur inconnue")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) return;
        fetchDescripteurs();
    }, [user]);

    return (
        <MultiSelect>
            <MultiSelectTrigger className="w-full max-w-[400px]">
                <MultiSelectValue placeholder="Sélectionner vos marchés préférés..." />
            </MultiSelectTrigger>
            <MultiSelectContent>
                <MultiSelectGroup>
                    {loading && <MultiSelectItem value="">Chargement en cours</MultiSelectItem>}
                    {error && <MultiSelectItem value="">Erreur lors du chargement</MultiSelectItem>}

                    {!loading &&
                    !error &&
                    descripteurs.map((descripteur) => (
                        <MultiSelectItem value={descripteur.code}>{descripteur.libelle}</MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}