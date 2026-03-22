import { Router } from "express";
import { loadRepo, indexRepo, getRepoStatus } from "../controllers/repo.controller.js";

export const repoRoutes = Router();

// POST /api/load-repo  — clone the GitHub repo
repoRoutes.post("/load-repo", loadRepo);

// POST /api/index-repo — parse, chunk, embed, and store
repoRoutes.post("/index-repo", indexRepo);

// GET  /api/repo-status — get current indexing state
repoRoutes.get("/repo-status", getRepoStatus);
