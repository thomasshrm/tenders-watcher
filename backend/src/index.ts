import "dotenv/config";
import express from "express"
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config()

import { testDb } from "./db/client";

const PORT = Number(process.env.PORT);

const defaultAllowed = [
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost",
  "http://127.0.0.1",
].filter(Boolean);

const extraAllowed = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowed, ...extraAllowed]));

import authRoutes from "./routes/auth.route";
import boampRoutes from "./routes/boamp.route";

const app = express();
app.use(express.json());
app.use(cors({
  origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/api", boampRoutes);
app.get("/api/ping", (_req,res)=>res.json({pong:true}));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
});

testDb().catch(err => {
  console.error("DB connection failed:", err);
  process.exit(1);
});

export default app;