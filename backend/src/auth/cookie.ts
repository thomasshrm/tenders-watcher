export function cookieOptsAccess() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,   // 👈 literal, plus "string"
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
}

export function cookieOptsRefresh() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,   // idem
    path: "/auth/refresh",
    maxAge: 7 * 24 * 3600 * 1000,
  };
}