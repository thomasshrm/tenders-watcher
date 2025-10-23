import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth/jwt";

export type AuthUser = {
    sub: number;
    email: string;
    name: string;
    role: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        const payload = verifyAccessToken(token);
        (req as any).user = payload as AuthUser;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

export function requireRoles(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as AuthUser | undefined;
        if (!user) return res.status(401).json({ error: "Unauthorized" });
        if (!roles.includes(user.role)) return res.status(403).json({ error: "Forbidden (role)" });
        next();
    };
}

export function getAuthUser(req: Request): AuthUser {
    const user = (req as any).user as AuthUser | undefined;
    if (!user) throw new Error("No authenticated user in request");
    return user;
}