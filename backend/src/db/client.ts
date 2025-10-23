import * as dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import postgres from 'postgres';
import { drizzle } from "drizzle-orm/postgres-js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing in .env file");

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const queryClient = postgres(process.env.DATABASE_URL, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 30,
});

export const db = drizzle(queryClient);
export { queryClient };

export async function testDb() {
    const r = await pool.query("select now()");
    console.log("DB OK @", r.rows[0].now);
}