import { Router } from "express";
import { fetchExpiringContracts } from "../services/boamp";

export const router = Router();

/**
 * GET /api/expiring
 * Query:
 *   keywords: string (comma-separated)
 *   region?: string
 *   max?: number (default 200)
 *   fallbackMonths?: number
 *   horizonMonths?: number (default 6)
 */
//GET /api/expiring?keywords=informatique&departement=54,57,88&cpv=48000000,72000000,30200000&fallbackMonths=48&horizonMonths=6
router.get("/expiring", async (req, res) => {
    try {
        const keywords = String(req.query.keywords ?? "").trim();
        if (!keywords) return res.status(400).json({ error: "keywords is required (comma-separated)" });

        const departement = req.query.departement ? String(req.query.departement) : undefined;
        const cpv = req.query.cpv ? String(req.query.cpv) : undefined;
        const max = req.query.max ? Number(req.query.max) : 200;
        const fallbackMonths = req.query.fallbackMonths ? Number(req.query.fallbackMonths) : undefined;
        const horizonMonths = req.query.horizonMonths ? Number(req.query.horizonMonths) : 6;

        const rows = await fetchExpiringContracts({
            keywordsCSV: keywords,
            departement,
            cpv,
            maxResults: max,
            fallbackMonths,
            horizonMonths
        });

        res.json({ rows });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e?.message ?? "Internal error" });
    } 
});

// ✅ Répondre quelque chose
router.get("/status", (_req, res) => {
  return res.json({ ok: true, uptime: process.uptime() });
});