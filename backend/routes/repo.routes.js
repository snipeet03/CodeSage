/**
 * routes/repo.routes.js
 * Handles repository ingestion endpoints.
 */

const express = require("express");
const router = express.Router();
const repoController = require("../services/repo.service");

/**
 * POST /api/repo/load
 * Body: { repoUrl: string }
 * Clones the GitHub repo and triggers indexing in the RAG service.
 */
router.post("/load", repoController.loadRepo);

module.exports = router;
