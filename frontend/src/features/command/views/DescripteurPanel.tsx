import { useAuth } from "@/features/auth/auth-context";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table'

type Descripteur = {
    mc_code: number
    mc_libelle: string
}

export default function DescripteurPanel() {
    const { user } = useAuth() as any;
    const [descripteurs, setDescripteurs] = useState<Descripteur[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const fetchDescripteurs = async () => {
        try{
            setLoading(true)
            setError(null)
            const { data } = await api.get("/api/descripteurs")
            setDescripteurs(Array.isArray(data?.rows) ? data.rows : [])
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

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold">Registre des codes descripteurs</h3>
            <p className="text-sm text-neutral-400">Index des codes descripteurs fournis par le BOAMP</p>
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
            {!loading &&
            !error &&
            descripteurs.map((descripteur) => (
                
                    <TableBody>
                        <TableRow key={descripteur.mc_code} className="hover:bug-muted/50">
                            <TableCell>{descripteur.mc_code}</TableCell>
                            <TableCell className="whitespace-normal wrap-break-word">{descripteur.mc_libelle}</TableCell>
                        </TableRow>
                    </TableBody>
            ))}
            </Table>
        </div>
    );
}
