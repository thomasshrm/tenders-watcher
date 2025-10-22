import "dotenv/config";
import express from "express";
import { router as api } from "./routes/api";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use("/api", api);
app.get("/api/ping", (_req,res)=>res.json({pong:true}));

const PORT = Number(process.env.PORT);
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
});