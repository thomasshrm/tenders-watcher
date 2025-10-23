export const paths = {
    home: "/",
    login: "/login",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];