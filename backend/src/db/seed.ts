import * as dotenv from 'dotenv';
dotenv.config();

import bcrypt from "bcrypt";
import { db } from "./client";
import { users } from './schema';

type Role = "admin" | "user";

function toRole(value: string | undefined, fallback: Role = "user"):Role {
    const v = (value ?? fallback).toLowerCase();
    if(v === "admin" || v === "user") return v;
    return fallback;
}

async function upsertUser(opts: {
        email: string;
        name: string;
        plainPassword: string;
        role: string;
        compositeUnique?: boolean;
    }) {
        const { email, name, plainPassword } = opts;
        const role = toRole(opts.role, "user");
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        if (opts.compositeUnique) {
            await db
                .insert(users)
                .values({ email, name, passwordHash, role })
                .onConflictDoUpdate({
                    target: [users.email, users.name],
                    set: { passwordHash, role },
                });
        } else {
            await db
                .insert(users)
                .values({ email, name, passwordHash, role })
                .onConflictDoUpdate({
                    target: users.email,
                    set: { name, passwordHash, role },
                });
        }

        return `Upserted: ${email} (${name}) [${role}]`;
}

async function main() {
    const { APP_DEFAULT_EMAIL, APP_DEFAULT_USER, APP_DEFAULT_PASSWORD } = process.env;
    if (!APP_DEFAULT_EMAIL) throw new Error("APP_DEFAULT_EMAIL is missing");
    if (!APP_DEFAULT_USER) throw new Error("APP_DEFAULT_USER is missing");
    if (!APP_DEFAULT_PASSWORD) throw new Error("APP_DEFAULT_PASSWORD is missing");

    const results: string[] = [];

    // Admin (from .env)
    results.push(
        await upsertUser({
            email: APP_DEFAULT_EMAIL,
            name: APP_DEFAULT_USER,
            plainPassword: APP_DEFAULT_PASSWORD,
            role: "admin",
            compositeUnique: true,
        })
    );

    console.log(results.join("\n"));
    console.log("✅ Seeding done")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Erreur de seed:", e);
        process.exit(1);
    });