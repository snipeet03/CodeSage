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

// ── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
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
