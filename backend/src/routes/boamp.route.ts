import { Router } from "express";
import { fetchExpiringContracts } from "../services/boamp";
import { open, readFileSync } from 'node:fs';

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
        /**const keywords = String(req.query.keywords ?? "").trim();
        if (!keywords) return res.status(400).json({ error: "keywords is required (comma-separated)" });*/

        const departement = req.query.departement ? String(req.query.departement) : undefined;
        const descripteur = req.query.descripteur ? String(req.query.descripteur) : undefined;
        const max = req.query.max ? Number(req.query.max) : 200;
        const fallbackMonths = req.query.fallbackMonths ? Number(req.query.fallbackMonths) : undefined;
        const horizonMonths = req.query.horizonMonths ? Number(req.query.horizonMonths) : 6;

        const rows = await fetchExpiringContracts({
            departement,
            descripteur,
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

router.get("/descripteurs", async (req, res) => {
    try {
        const data = readFileSync("./src/resources/boamp/descripteurs.json", "utf-8");
        const descripteurs = JSON.parse(data);
        const rows = Object.keys(descripteurs).map(function (key) {
            return descripteurs[key];
        }).sort((a, b) => Number(a.mc_code) - Number(b.mc_code)); 
        res.json({rows});
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e?.message ?? "Internal error" });
    }
});

// ✅ Répondre quelque chose
router.get("/status", (_req, res) => {
  return res.json({ ok: true, uptime: process.uptime() });
});

export default router;