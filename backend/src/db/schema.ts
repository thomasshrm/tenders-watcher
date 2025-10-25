import { pgEnum, pgTable, serial, varchar, boolean, timestamp, uniqueIndex, numeric } from "drizzle-orm/pg-core";

// ENUMS
export const accountRoleEnum    = pgEnum("account_role", ["admin", "user"]);

// USERS (Basic Auth)
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 40 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: accountRoleEnum("role").notNull().default("user"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    }, (t) => ({
        "uq_email_display": uniqueIndex("uq_users_email_display").on(t.email, t.name),
    })
);

export const marketCodes = pgTable("market_codes", {
    id: serial("id").primaryKey(),
    code: varchar("code").notNull().unique(),
    libelle: varchar("libelle", { length: 100 }).notNull(),
});