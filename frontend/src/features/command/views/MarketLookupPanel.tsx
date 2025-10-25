import { useState } from "react";
import { api } from "@/lib/api";
import { z } from 'zod';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

const descripteurIndex = [
  23,
  204,
  97,
  81,
  162,
  454,
  107,
  207,
  338,
  47,
  14,
  453,
  463,
  339,
  402,
  283,
  186,
  2,
  21,
  133,
  171,
  163,
  68,
];

const departementIndex = [
  54,
  55,
  57,
  88,
  67,
  68,
  51,
  52
]

const descripteurFormat = descripteurIndex.toString();
const departementFormat = departementIndex.toString();

const schema = z.object({
  descripteur: z.string().nonempty(),
  departement: z.string().nonempty(),
  fallback_month: z.number().min(1, "Minimum 1 mois").default(48),
  horizon_month: z.number().min(1, "Minimum 1 mois").max(12, "Maximum 12 mois").default(3),
})

type FormSchema = typeof schema;
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function MarketLookupPanel() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormInput) {
    setLoading(true)
    setError(null)
    try {
      const parsed = schema.parse(values)
      const { data } = await api.get(`/api/expiring?departement=${parsed.departement}&descripteur=${parsed.descripteur}&fallbackMonths=${parsed.fallback_month}&horizonMonths=${parsed.horizon_month}`)
      setMarkets(Array.isArray(data?.rows) ? data.rows : [])
    } catch (e: any) {
      setError(e?.message ?? "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-base font-semibold text-neutral-400">Rechercher les attributions au cours de la période sélectionnée.</p>
      <br />
      <form 
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
          <div className="grid gap-2">
            <Label htmlFor='descripteur'>Descripteurs</Label>
            <Input className="w-192" id='descripteur' type='text' {...form.register('descripteur')} defaultValue={descripteurFormat} />
            {
              form.formState.errors.descripteur && (
                <p className="text-sm text-destructive">{form.formState.errors.descripteur.message}</p>
              )
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor='departement'>Départements</Label>
            <Input className="w-lg" id='departement' type='text' {...form.register('departement')} defaultValue={departementFormat} />
            {
              form.formState.errors.departement && (
                <p className="text-sm text-destructive">{form.formState.errors.departement.message}</p>
              )
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor='fallback_month'>Mois en arrière</Label>
            <Input className="w-64" id='fallback_month' type='number' {...form.register('fallback_month', {valueAsNumber: true})} defaultValue="48" />
            {
              form.formState.errors.fallback_month && (
                <p className="text-sm text-destructive">{form.formState.errors.fallback_month.message}</p>
              )
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor='horizon_month'>Nombre de mois à rechercher</Label>
            <Input className="w-64" id='horizon_month' type='number' {...form.register('horizon_month', {valueAsNumber:true})} defaultValue="3" />
            {
              form.formState.errors.horizon_month && (
                <p className="text-sm text-destructive">{form.formState.errors.horizon_month.message}</p>
              )
            }
          </div>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Recherche en cours...</> : "Rechercher"}
            </Button>
      </form>
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
              {/**<TableHead className="text-white">Info renew</TableHead>*/}
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
                {/**<TableCell className="whitespace-normal wrap-break-word">{market.renouvellement}</TableCell>*/}
                <TableCell>{market.annonce_lie ? <Link to={`https://www.boamp.fr/pages/avis/?q=idweb:${market.annonce_lie}`} target="_blank" rel="noopener noreferrer" >GO</Link> : ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
