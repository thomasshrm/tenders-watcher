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
import { Link } from "react-router-dom";

type Market = {
  idweb: string
  id: string
  objet: string
  departement: string
  titulaire: string
  nomacheteur: string
  dateparution: string
  url_avis: string
  donnees: string
  descripteur_libelle: string
  type_marche_facette: string
  annonce_lie: string
  duree: number
  renouvellement: string
  datefin: string
}

const cpvInspect = [
  "48972000",
  "48730000",
  "48931000",
  "48219200",
  "72212600",
  "72126100",
  "48321000",
  "48518000",
  "72212442",
  "48131000",
  "72227000",
  "72212900",
  "48325000",
  "72223000",
  "72212463",
  "48942000",
  "72140000",
  "48312000",
  "48700000",
  "48317000",
  "48217000",
  "48000000",
  "72000000",
  "30200000",
  "72212911",
  "48110000",
  "48200000",
  "48000000",
  "48300000",
  "48400000",
  "48500000",
  "48700000",
];

export default function MarketLookupPanel() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth() as any;

  const fetchMarkets = async () => {
    try{
      setLoading(true)
      setError(null)
      let cpvFormat = cpvInspect.toString();
      const { data } = await api.get(`/api/expiring?keywords=informatique&departement=54,57,88,55,51,52,67,68&cpv=${cpvFormat}&fallbackMonths=48&horizonMonths=6`)
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
              <TableHead className="w-[40px] text-white">DPT</TableHead>
              <TableHead className="w-[150px] text-white">Client</TableHead>
              <TableHead className="text-white">Objet</TableHead>
              <TableHead className="w-[120px] text-white">Date avis</TableHead>
              <TableHead className="w-[120px] text-white">Titulaire</TableHead>
              <TableHead className="w-[60px] text-white">Durée</TableHead>
              <TableHead className="w-[60px] text-white">Renew</TableHead>
              <TableHead className="w-[120px] text-white">Date fin</TableHead>
              <TableHead className="text-white">Info renew</TableHead>
              <TableHead className="w-[60px] text-white">Lien</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading &&
            !error &&
            markets.map((market) => (
              <TableRow key={market.idweb} className="hover:bug-muted/50">
                <TableCell>{market.idweb}</TableCell>
                <TableCell>{market.departement}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.nomacheteur}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.objet}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.dateparution}</TableCell>
                <TableCell className="whitespace-normal wrap-break-word">{market.titulaire}</TableCell>
                <TableCell>{market.duree}</TableCell>
                { market.datefin && market.renouvellement ? 
                  <TableCell className="text-red-400">Oui</TableCell> :
                  market.renouvellement && !market.datefin ?
                  <TableCell>Oui</TableCell> :
                  !market.renouvellement && market.datefin ?
                  <TableCell className="text-green-300">Non</TableCell> :
                  <TableCell>Non</TableCell>
                }
                { market.datefin && !market.renouvellement ? 
                  <TableCell className="text-green-300">{market.datefin}</TableCell> : 
                  market.datefin && market.renouvellement ?
                  <TableCell className="text-red-400">{market.datefin}</TableCell> : 
                  <TableCell></TableCell> }
                <TableCell className="whitespace-normal wrap-break-word">{market.renouvellement}</TableCell>
                <TableCell>{market.annonce_lie ? <Link to={`https://www.boamp.fr/pages/avis/?q=idweb:${market.annonce_lie}`} target="_blank" rel="noopener noreferrer" >GO</Link> : ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
