import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(a: string | null, r: string | null) {
    accessToken = a;
    refreshToken = r;
}

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let refreshing = false;
let subscribers: ((t: string) => void)[] = [];
function onRefreshed(t: string) {
    subscribers.forEach(cb => cb(t));
    subscribers = [];
}

api.interceptors.response.use(
    r => r,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry && refreshToken) {
            if (refreshing) {
                return new Promise((resolve) => {
                    subscribers.push((t) => {
                        original.headers.Authorization = `Bearer ${t}`;
                        resolve(api(original));
                    });
                });
            }
            original._retry = true;
            refreshing = true;
            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                accessToken = data.accessToken;
                onRefreshed(accessToken!);
                return api(original);
            } finally {
                refreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export const AuthTokens = {
    load() {
        const raw = localStorage.getItem("auth");
        if (raw) {
            const { accessToken: a, refreshToken: r } = JSON.parse(raw);
            setTokens(a, r);
        }
    },
    save(a: string, r: string) {
        setTokens(a, r);
        localStorage.setItem("auth", JSON.stringify({ accessToken: a, refreshToken: r }));
    },
    clear() {
        setTokens(null, null);
        localStorage.remove("auth");
    },
}

AuthTokens.load();