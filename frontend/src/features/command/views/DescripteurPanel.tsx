import { useAuth } from "@/features/auth/auth-context";
import { api } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table'
import { Input } from "@/components/ui/input";

type Descripteur = {
    code: string
    libelle: string
}

export default function DescripteurPanel() {
    const { user } = useAuth() as any;
    const [descripteurs, setDescripteurs] = useState<Descripteur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    const fetchDescripteurs = async () => {
        try{
            setLoading(true)
            setError(null)
            const { data } = await api.get("/api/descripteurs")
            setDescripteurs(data)
            //setMarkets(Array.isArray(data?.rows) ? data.rows : [])
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

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase()
        if(!term) return descripteurs
        return descripteurs.filter(d =>
            [d.code, d.libelle]
            .some(s => s?.toLowerCase().includes(term))
        )
    }, [descripteurs, query]);

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold">Registre des codes descripteurs</h3>
            <p className="text-sm text-neutral-400">Index des codes descripteurs fournis par le BOAMP</p>
            <div className="flex items-center gap-2">
                <div className="w-64">
                    <Input
                    placeholder="Rechercher (code, libellé)…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>Error</p>}

            {!loading && !error && descripteurs.length === 0 && (
                <p>Pas de descripteur.</p>
            )}

            <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-white">Code</TableHead>
                            <TableHead className="text-white">Libellé</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
            
            {filtered.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                        No result.
                    </TableCell>
                </TableRow>
            ) : !loading &&
            !error &&
            filtered.map((descripteur) => (
                        <TableRow key={descripteur.code} className="hover:bug-muted/50">
                            <TableCell>{descripteur.code}</TableCell>
                            <TableCell className="whitespace-normal wrap-break-word">{descripteur.libelle}</TableCell>
                        </TableRow>
            ))}
                </TableBody>
            </Table>
        </div>
    );
}
