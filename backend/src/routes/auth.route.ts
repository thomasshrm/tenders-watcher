import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../auth/jwt";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * POST /auth/login { email, password }
 * -> { accessToken, refreshToken }
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const [u] = await db
        .select()
        .from(users)
        .where(
            eq(users.email, email)
        )
        .limit(1);
    if(!u || !u.isActive) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, u.passwordHash);
    if(!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken({ 
        sub: u.id, 
        email: u.email,
        name: u.name,
        role: u.role,
    });
    const refreshToken = signRefreshToken({
        sub: u.id,
        email: u.email,
    });

    return res.json({ accessToken, refreshToken });
});

/**
 * POST /auth/refresh { refreshToken }
 * -> { accessToken }
 */
router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });

    try {
        const { sub, email } = verifyRefreshToken(refreshToken);
        const [u] = await db
            .select()
            .from(users)
            .where(
                eq(users.id, sub)
            )
            .limit(1);
        if (!u || u.email !== email || !u.isActive) return res.status(401).json({ error: "Invalid refresh" });
        
        const accessToken = signAccessToken({ 
            sub: u.id, 
            email: u.email,
            name: u.name,
            role: u.role,
        });
        return res.json({ accessToken });
    } catch {
        return res.status(401).json({ error: "Invalid refresh" });
    }
});

/**
 * GET /auth/me
 */
router.get("/me", requireAuth, (req, res) => {
    res.json((req as any).user);
})

export default router;