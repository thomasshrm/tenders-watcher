export const paths = {
    home: "/",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];