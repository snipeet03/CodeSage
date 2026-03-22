/**
 * routes/query.routes.js
 * Handles natural language query endpoints.
 */

const express = require("express");
const router = express.Router();
const queryController = require("../services/query.service");

/**
 * POST /api/query
 * Body: { question: string }
 * Forwards the question to the Python RAG service and returns the answer.
 */
router.post("/", queryController.handleQuery);

module.exports = router;
