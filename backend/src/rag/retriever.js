import { generateEmbedding } from "./embedder.js";
import { vectorStore } from "./vectorStore.js";

// Weights for combining semantic and keyword scores (RRF-style fusion)
const SEMANTIC_WEIGHT = 0.6;
const KEYWORD_WEIGHT = 0.4;

// ─── Hybrid retrieval: semantic + keyword + optional metadata filter ──────────
export const hybridRetrieval = async (query, keywords = [], options = {}) => {
  const { topK = 8, roleFilter, languageFilter } = options;

  // 1. Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Semantic search
  const semanticResults = vectorStore.semanticSearch(queryEmbedding, topK * 2);

  // 3. Keyword search
  const keywordResults = vectorStore.keywordSearch(keywords, topK * 2);

  // 4. Reciprocal Rank Fusion (RRF)
  // Assigns a score to each chunk based on its rank in each result list
  const scoreMap = new Map();

  const addToScoreMap = (results, weight) => {
    results.forEach((item, rank) => {
      const existing = scoreMap.get(item.id) || { item, score: 0 };
      // RRF formula: weight / (k + rank)  where k = 60 is standard
      existing.score += weight / (60 + rank + 1);
      scoreMap.set(item.id, existing);
    });
  };

  addToScoreMap(semanticResults, SEMANTIC_WEIGHT);
  addToScoreMap(keywordResults, KEYWORD_WEIGHT);

  // 5. Sort by combined score
  let merged = [...scoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  // 6. Optional metadata filtering
  if (roleFilter) {
    const roleFiltered = merged.filter((c) => c.metadata.role === roleFilter);
    // Fall back to unfiltered if nothing matches
    if (roleFiltered.length > 0) merged = roleFiltered;
  }

  if (languageFilter) {
    const langFiltered = merged.filter((c) => c.metadata.language === languageFilter);
    if (langFiltered.length > 0) merged = langFiltered;
  }

  // 7. Diversity: avoid returning 5 chunks from the same file
  const deduplicated = deduplicateByFile(merged, topK);

  return deduplicated;
};

// ─── Ensure we don't saturate the context with one file ──────────────────────
const deduplicateByFile = (chunks, topK) => {
  const fileCounts = {};
  const MAX_PER_FILE = 3;
  const result = [];

  for (const chunk of chunks) {
    const fp = chunk.metadata.filePath;
    fileCounts[fp] = (fileCounts[fp] || 0) + 1;

    if (fileCounts[fp] <= MAX_PER_FILE) {
      result.push(chunk);
    }

    if (result.length >= topK) break;
  }

  return result;
};
