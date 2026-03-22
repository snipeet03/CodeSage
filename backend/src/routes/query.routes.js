import { Router } from "express";
import { handleQuery } from "../controllers/query.controller.js";

export const queryRoutes = Router();

// POST /api/query — answer a developer question about the loaded codebase
queryRoutes.post("/query", handleQuery);
