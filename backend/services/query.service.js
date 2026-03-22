/**
 * services/query.service.js
 * Forwards user questions to the Python RAG /query endpoint.
 */

const axios = require("axios");

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";

/**
 * handleQuery — Express route handler
 */
async function handleQuery(req, res) {
  const { question } = req.body;

  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "question is required." });
  }

  console.log(`[query.service] Forwarding question to RAG service: "${question}"`);

  const ragResponse = await axios.post(`${RAG_SERVICE_URL}/query`, {
    question: question.trim(),
  });

  return res.json(ragResponse.data);
}

module.exports = { handleQuery };
