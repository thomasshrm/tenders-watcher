import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// On garde les durées lisibles ("15m", "7d") et on les caste au moment de signer
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? "7d";

/**
 * Payload applicatif embarqué dans le token d'accès.
 * On ne dépend PAS du type JwtPayload de la lib (qui varie selon versions).
 */
export type AppJwtPayload = {
  sub: number;        // id utilisateur (nous on veut un number)
  email: string;
  name: string;
  role: string;
};

const commonOpts: Pick<SignOptions, "issuer" | "algorithm"> = {
  issuer: "tenders-watcher",
  algorithm: "HS256",
};

/** Génère un access token (15m par défaut) */
export function signAccessToken(payload: AppJwtPayload): string {
  const opts: SignOptions = { ...commonOpts, expiresIn: ACCESS_EXPIRES as any };
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    ACCESS_SECRET,
    opts
  );
}

/** Génère un refresh token (7d par défaut) – plus léger */
export function signRefreshToken(payload: Pick<AppJwtPayload, "sub" | "email">): string {
  const opts: SignOptions = { ...commonOpts, expiresIn: REFRESH_EXPIRES as any };
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
    },
    REFRESH_SECRET,
    opts
  );
}

/** Vérifie et décode un access token */
export function verifyAccessToken(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, ACCESS_SECRET, { issuer: commonOpts.issuer });
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload type");
  }
  // On mappe vers notre type applicatif en contrôlant les champs attendus
  const d = decoded as any;
  return {
    sub: typeof d.sub === "number" ? d.sub : Number(d.sub),
    email: String(d.email),
    name: String(d.name),
    role: String(d.role ?? ""),
  };
}

/** Vérifie et décode un refresh token */
export function verifyRefreshToken(
  token: string
): Pick<AppJwtPayload, "sub" | "email"> {
  const decoded = jwt.verify(token, REFRESH_SECRET, { issuer: commonOpts.issuer });
  if (typeof decoded === "string") {
    throw new Error("Invalid refresh token payload type");
  }
  const d = decoded as any;
  return {
    sub: typeof d.sub === "number" ? d.sub : Number(d.sub),
    email: String(d.email),
  };
}