import { addMonths, isAfter, isBefore, isValid, parseISO } from "date-fns";

/** Record du dataset boamp-datadila (simplifié) */
type OdsRecord = {
  idweb?: string;
  id?: string;
  objet?: string;
  titulaire?: string;
  departement?: string;
  nomacheteur?: string;
  dateparution?: string;         // "YYYY-MM-DD"
  url_avis?: string;
  donnees?: string;              // JSON string contenant plein d'infos (dont NB_ANNEE parfois)
  descripteur_libelle?: string[]; // mots-clés
  type_marche_facette?: string[]; // "Services", ...
  annonce_lie?: string[];
  duree?: number;
  renouvellement?: string;
  datefin?: string;
  // ... d'autres champs dispo si besoin
};

function parseMaybeDate(s?: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseMonthsFromDonnees(donnees?: string): number | undefined {
  if (!donnees) return;
  try {
    const obj = JSON.parse(donnees);
    // Souvent: donnees.ATTRIBUTION.DECISION.RENSEIGNEMENT.NB_ANNEE = "2"
    const nbAnnees = obj?.ATTRIBUTION?.DECISION?.RENSEIGNEMENT?.NB_ANNEE;
    if (nbAnnees) {
      const y = Number(String(nbAnnees).replace(",", "."));
      if (!Number.isNaN(y)) return Math.round(y * 12);
    }
    // On tente aussi “durée ... mois/ans” dans donnees (fallback très simple)
    const txt = JSON.stringify(obj).toLowerCase();
    const mY = /(\d+(?:[.,]\d+)?)\s*(ans|year)/i.exec(txt);
    if (mY) {
      const y = Number(mY[1]?.replace(",", "."));
      if (!Number.isNaN(y)) return Math.round(y * 12);
    }
    const mM = /(\d+)\s*(mois|months?)/i.exec(txt);
    if (mM) {
      const mo = Number(mM[1]);
      if (!Number.isNaN(mo)) return mo;
    }
  } catch {
    /* ignore JSON errors */
  }
  return;
}

function toISODate(d?: Date): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

export async function fetchExpiringContracts(opts: {
  keywordsCSV: string;
  departement?: string;            // (peut se matcher dans texte via search)
  cpv?: string;
  maxResults?: number;        // pagination
  fallbackMonths?: number;
  horizonMonths?: number;     // default 6
}) {
    const apiUrl = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp"

    const keywords = opts.keywordsCSV.split(",").map(s => s.trim()).filter(Boolean);
    if (!keywords.length) throw new Error("Provide at least one keyword");

    const limit = Math.min(100, opts.maxResults ?? 200);

    // Construction de la requête ODS
    // - dataset = boamp
    // - refine=nature:ATTRIBUTION
    // - search : mots-clés + (optionnel) region concaténés pour un "full-text"
    const params = new URLSearchParams();

    // gestion de la limite de résultats
    params.set("limit", String(limit));

    // gestion de la date
    
    const now = new Date();
    const horizonMonths = opts.horizonMonths ?? 6;
    const fallbackMonths = opts.fallbackMonths ?? 48;
    const from = new Date(now);
    from.setMonth(from.getMonth() - fallbackMonths);
    const to = new Date(now);
    to.setMonth(to.getMonth() + horizonMonths - fallbackMonths);
    const fromISO = from.toISOString().slice(0, 10);
    const toISO = to.toISOString().slice(0, 10);
    params.set("where", `dateparution >= "${fromISO}" AND dateparution <= "${toISO}"`);
    params.append("refine", "nature:ATTRIBUTION");

    // gestion des départements
    if (opts.departement) {
        const depts = opts.departement
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        if(depts.length) {
            const clause = depts
                .map(d => `code_departement = "${d}"`)
                .join(" OR ");
            const existing = params.get("where");
            if (existing) {
                params.set("where", `${existing} AND (${clause})`);
            } else {
                params.set("where", `(${clause})`);
            }
        }
    }

    // gestion des CPV
    if (opts.cpv) {
        const cpvList = opts.cpv
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        if (cpvList.length) {
            const cpVClause = cpvList
                .map(c => `search(donnees, "${c}")`)
                .join(" OR ");
            const existing = params.get("where");
            if (existing) {
                params.set("where", `${existing} AND (${cpVClause})`);
            } else {
                params.set("where", `(${cpVClause})`)
            }
        }
    }

    /**const searchTerms = [...keywords];
    if (searchTerms.length) params.set("search", searchTerms.join(" "));*/

    // Filtre temporel serveur (ex: dernières X années) via where sur dateparution, pour éviter trop de bruit
    // Exemple: WHERE dateparution >= "2018-01-01"
    // Tu peux durcir si besoin : params.set("where", `dateparution >= date("2020-01-01")`);
    // On laisse sans where strict ici, le filtrage final se fait sur expiration.

    const url = `${apiUrl}/records?${params.toString()}`;

    const r = await fetch(url, { method: "GET" });
    if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(`Datadila error ${r.status}: ${txt}`);
    }
    const data: any = await r.json();

    const totalCount = data.total_count

    if (totalCount === 0) return [];

    const results = data.results

    const items: OdsRecord[] = []

    for (let i = 0; i <= totalCount - 1; i++) {
        const linkedAnnonce = results[i].annonce_lie ? results[i].annonce_lie[0] : undefined;
        let duree: number | undefined;
        let renouvellement: string | undefined;
        let datefin: string | undefined;
        const parutionStr: string | undefined = results[i]?.dateparution;
        const baseDate = parutionStr ? parseISO(parutionStr) : undefined;

        if (linkedAnnonce) {
          const urlLinked = `${apiUrl}/records?refine=idweb%3A${linkedAnnonce}`;

          const r = await fetch(urlLinked, { method: "GET" });
          if (!r.ok) {
              const txt = await r.text().catch(() => "");
              throw new Error(`Datadila error ${r.status}: ${txt}`);
          }

          const linkedData: any = await r.json();
          const first = Array.isArray(linkedData.results) ? linkedData.results[0] : undefined;
          if (first?.donnees) {
            try {
              const donnees = JSON.parse(first.donnees);

              const lot = Array.isArray(donnees?.OBJET?.LOTS?.LOT)
                ? donnees.OBJET.LOTS.LOT[0]
                : donnees?.OBJET?.LOTS?.LOT;

              const rawDuree = lot?.DUREE_MOIS ?? lot?.CARACTERISTIQUES?.DUREE_MOIS ?? null;
              if (rawDuree != null) {
                const n = Number(String(rawDuree).replace(",", "."));
                if (!Number.isNaN(n) && n > 0) duree = Number(Math.round(n));
              }
              renouvellement = lot?.RENOUVELLEMENT_DESCRIPTION ?? undefined;
              if (baseDate && isValid(baseDate) && typeof duree === "number" && Number.isFinite(duree)) {
                const d = addMonths(baseDate, duree);
                datefin = d.toISOString().slice(0, 10);
              } else {
                datefin = undefined;
              }
            } catch (e) {
              console.warn("JSON donnees parse error: ", e);
            }
          }
        } else {
          duree = undefined;
          renouvellement = undefined;
        }

        let titulaire = results[i]?.titulaire ? results[i]?.titulaire[0] : undefined;
        let departement = results[i]?.code_departement ? results[i]?.code_departement[0] : undefined;

        items.push({
            idweb: results[i].idweb,
            id: results[i].id,
            objet: results[i].objet,
            departement: departement,
            titulaire: titulaire,
            nomacheteur: results[i].nomacheteur,
            dateparution: results[i].dateparution,         // "YYYY-MM-DD"
            url_avis: results[i].url_avis,
            donnees: results[i].gestion,             // JSON string contenant plein d'infos (dont NB_ANNEE parfois)
            descripteur_libelle: results[i].descripteur_libelle, // mots-clés
            type_marche_facette: results[i].type_marche_facette,
            annonce_lie: results[i].annonce_lie ? results[i].annonce_lie[0] : undefined,
            duree: duree,
            renouvellement: renouvellement,
            datefin: datefin,
        });
    }

    return items;

    //const items: OdsRecord[] = Array.isArray(data?.results) ? data.results : [];

    // Enrichissement: trouve la durée et la base date (parution comme fallback),
    // calcule expiration, filtre horizon
    /**const now = new Date();
     const horizon = addMonths(now, horizonMonths);

    const rows = items.flatMap((src) => {
    // tentative: chercher une date d'attribution dans `donnees` si présente
    let base: Date | undefined =
      parseMaybeDate(src.dateparution);

    try {
      if (src.donnees) {
            const obj = JSON.parse(src.donnees);
            const dateAttr =
            obj?.ATTRIBUTION?.DECISION?.RENSEIGNEMENT?.DATE_ATTRIBUTION ||
            obj?.ATTRIBUTION?.DECISION?.RENSEIGNEMENT?.DATE_NOTIFICATION;
            const dAttr = parseMaybeDate(dateAttr);
            if (dAttr) base = dAttr;
        }
        } catch {
        
        }

        const months =
        parseMonthsFromDonnees(src.donnees) ??
        (opts.fallbackMonths ?? undefined);

        const expiration = base && months ? addMonths(base, months) : undefined;

        if (!expiration) return [];

        if (!(isAfter(expiration, now) && isBefore(expiration, horizon))) {
        return [];
        }

        return [{
            id: src.id ?? src.idweb,
            numeroAnnonce: src.idweb ?? src.id,
            objet: src.objet,
            acheteur_nom: src.nomacheteur,
            lieuExecution: undefined,                 // ODS n’a pas toujours ce champ direct
            lot_intitule: null,
            lot_description: null,
            datePublication: src.dateparution,
            dateNotification: undefined,              // si trouvée dans donnees, on pourrait l’exposer
            months_inferred: months,
            base_date_used: "date_attribution_or_parution",
            base_date_value: toISODate(base),
            expiration_inferred: toISODate(expiration),
            source_url: src.url_avis
        }];
    });

    console.log(rows)

    // Tri par expiration puis acheteur
    rows.sort((a, b) => {
        const da = (a.expiration_inferred ?? "").localeCompare(b.expiration_inferred ?? "");
        if (da !== 0) return da;
        return (a.acheteur_nom ?? "").localeCompare(b.acheteur_nom ?? "");
    });

    return rows;*/
}
