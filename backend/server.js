/**
 * server.js — Express application entry point
 * Bootstraps middleware, routes, and error handling.
 */

require("express-async-errors");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const repoRoutes = require("./routes/repo.routes");
const queryRoutes = require("./routes/query.routes");
const { errorHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Ensure repos directory exists ──────────────────────────────────────────
const reposDir = path.resolve(process.env.REPOS_DIR || "./repos");
if (!fs.existsSync(reposDir)) {
  fs.mkdirSync(reposDir, { recursive: true });
}

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/repo", repoRoutes);
app.use("/api/query", queryRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "codebase-explainer-backend" });
});
// Also expose under /api/health so the Vercel rewrite proxy can reach it
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "codebase-explainer-backend" });
});

// ── Warmup endpoint — wakes BOTH backend AND RAG service ─────────────────────
// Frontend calls /api/warmup on page load so both Render free-tier services
// are awake before the user hits "Load Repo"
app.get("/api/warmup", async (_req, res) => {
  const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
  try {
    await axios.get(`${RAG_SERVICE_URL}/health`, { timeout: 60_000 });
    res.json({ backend: "ok", rag: "ok" });
  } catch (err) {
    // Still respond OK — backend is alive even if RAG is still waking
    res.json({ backend: "ok", rag: "waking", detail: err.message });
  }
});

// ── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);

  // Silently wake up the RAG service so it’s ready when the first user request arrives
  const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
  axios.get(`${RAG_SERVICE_URL}/health`, { timeout: 30_000 })
    .then(() => console.log("[warm-up] RAG service is awake ✅"))
    .catch(() => console.log("[warm-up] RAG service is sleeping — will wake on first request"));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Close the other process or set a different PORT in backend/.env.`);
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

module.exports = app;
