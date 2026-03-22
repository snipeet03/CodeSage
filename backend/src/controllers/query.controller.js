import { hybridRetrieval } from "../rag/retriever.js";
import { buildContext } from "../rag/contextBuilder.js";
import { askLLM } from "../rag/llm.js";
import { vectorStore } from "../rag/vectorStore.js";
import { cleanQuery, extractKeywords } from "../utils/queryUtils.js";

// ─── POST /api/query ──────────────────────────────────────────────────────────
export const handleQuery = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: "Please provide a valid question." });
    }

    // Check if a codebase is indexed
    const stats = vectorStore.getStats();
    if (stats.totalChunks === 0) {
      return res.status(400).json({
        error: "No codebase is indexed yet. Please load and index a repository first.",
      });
    }

    // 1. Clean and expand the query
    const cleanedQuery = cleanQuery(question);
    const keywords = extractKeywords(cleanedQuery);

    // 2. Hybrid retrieval: semantic + keyword + metadata
    const chunks = await hybridRetrieval(cleanedQuery, keywords, { topK: 8 });

    if (chunks.length === 0) {
      return res.json({
        answer:
          "I couldn't find relevant code for your question. Try rephrasing or ask about a specific file or function.",
        sources: [],
      });
    }

    // 3. Build structured context from retrieved chunks
    const context = buildContext(chunks);

    // 4. Ask the LLM
    const answer = await askLLM(question, context);

    // 5. Return answer + source attribution
    const sources = [
      ...new Map(chunks.map((c) => [c.metadata.filePath, c.metadata])).values(),
    ];

    res.json({ answer, sources, chunksUsed: chunks.length });
  } catch (err) {
    next(err);
  }
};
