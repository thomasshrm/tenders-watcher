import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, AuthTokens } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

type UserJwt = {
    sub: number;
    email: string;
    name: string;
    role: string;
    exp: number;
};

type AuthState = {
    user: UserJwt | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    hasRole: (...roles: string[]) => boolean;
};

const Ctx = createContext<AuthState>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserJwt | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        AuthTokens.load();
        api.get("/auth/me")
            .then(({data}) => setUser(data))
            .catch(() => {
                setUser(null);
            })
            .finally(() => setHydrated(true));
    }, []);

    async function login(email: string, password: string) {
        const { data } = await api.post("/auth/login", { email, password });
        AuthTokens.save(data.accessToken, data.refreshToken);
        const decoded: UserJwt = jwtDecode(data.accessToken);
        setUser(decoded);
    }

    function logout() {
        AuthTokens.clear();
        setUser(null);
    }

    const hasRole = (...roles: string[]) => !!user && roles.includes(user.role);

    const value = useMemo(() => ({ user, login, logout, hasRole }), [user]);

    if (!hydrated) {
        return <div className="p-6 text-muted-foreground">Chargement...</div>
    }

    return (
        <Ctx.Provider value={ { user, login, logout, hasRole, hydrated } as any }>
            {children}
        </Ctx.Provider>
    );
}

export function useAuth() {
    return useContext(Ctx);
}