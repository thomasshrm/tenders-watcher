import { Router } from "express";
import { fetchContractsByClient, fetchExpiringContracts } from "../services/boamp";
import { db } from "../db/client";
import { marketCodes, userMarketCodes } from "../db/schema";
import { getAuthUser, requireAuth } from "../middlewares/auth.middleware";
import { eq } from "drizzle-orm";

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
router.get("/expiring", requireAuth, async (req, res) => {
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

router.get("/client", requireAuth, async (req, res) => {
    try {
        const client = req.query.client ? String(req.query.client) : undefined;
        const rows = await fetchContractsByClient({
            client,
        });
        res.json({ rows });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e?.message ?? "Internal error" });
    }
});

router.get("/descripteurs", requireAuth, async (req, res) => {
    const rows = await db
        .select({
            code: marketCodes.code,
            libelle: marketCodes.libelle,
        })
        .from(marketCodes);
    res.json(rows);
});

router.post("/descripteurs", requireAuth, async (req, res) => {
    const user = getAuthUser(req);
    const { codes } = req.body ?? {};

    console.log(req)
});

router.get("/user_descripteurs", requireAuth, async (req, res) => {
    const user = getAuthUser(req);
    const rows = await db
        .select()
        .from(userMarketCodes)
        .where(
            eq(userMarketCodes.ownerUserId, user.sub)
        )
        .limit(1);
    if(!rows) return res.json({})
    res.json(rows)
})

// ✅ Répondre quelque chose
router.get("/status", (_req, res) => {
  return res.json({ ok: true, uptime: process.uptime() });
});

export default router;