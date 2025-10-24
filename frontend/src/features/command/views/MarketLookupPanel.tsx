import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table'

type Market = {
  idweb: string
  id: string
  objet: string
  nomacheteur: string
  dateparution: string
  url_avis: string
  donnees: string
  descripteur_libelle: string
  type_marche_facette: string
  annonce_lie: string
  duree: string
  renouvellement: string
}

export default function MarketLookupPanel() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth() as any;

  const fetchMarkets = async () => {
    try{
      setLoading(true)
      setError(null)
      const { data } = await api.get("/api/expiring?keywords=informatique&departement=54,57,88&cpv=48000000,72000000,30200000&fallbackMonths=42&horizonMonths=6")
      console.log(data)
      setMarkets(Array.isArray(data?.rows) ? data.rows : [])
    } catch (e: any) {
      setError(e?.message ?? "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchMarkets();
  }, [user]);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Market Lookup</h3>
      <p className="text-sm text-neutral-400">Rechercher les attributions au cours de la période sélectionnée.</p>
      {loading && <p>Loading...</p>}
      {error && <p>Error</p>}

      {!loading && !error && markets.length === 0 && (
        <p>No market.</p>
      )}

      <div className="max-w-full overflow-x-auto rounded-md border border-neutral-800">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-white">ID</TableHead>
              <TableHead className="w-[150px] text-white">Client</TableHead>
              <TableHead className="text-white">Objet</TableHead>
              <TableHead className="w-[120px] text-white">Date avis</TableHead>
              <TableHead className="w-[60px] text-white">Durée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading &&
            !error &&
            markets.map((market) => (
              <TableRow key={market.idweb} className="hover:bug-muted/50">
                <TableCell>{market.idweb}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.nomacheteur}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.objet}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.dateparution}</TableCell>
                <TableCell>{market.duree}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
