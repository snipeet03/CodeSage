import { cosineSimilarity } from "./embedder.js";

/**
 * In-memory vector store.
 * Each entry: { id, text, embedding, metadata }
 *
 * For large codebases (10K+ chunks) you'd swap this for a proper ANN index
 * (FAISS, hnswlib, Pinecone, Weaviate, etc.) but for most repos this is fast.
 */
class VectorStore {
  constructor() {
    this.items = []; // flat array of stored chunks
  }

  // ─── Add a single chunk (with embedding) ───────────────────────────────────
  add(chunk) {
    this.items.push({
      id: this.items.length,
      text: chunk.text,
      embedding: chunk.embedding,
      metadata: chunk.metadata,
    });
  }

  // ─── Pure semantic search: cosine similarity over all embeddings ───────────
  semanticSearch(queryEmbedding, topK = 10) {
    return this.items
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ─── Keyword search: BM25-inspired term matching ──────────────────────────
  keywordSearch(keywords, topK = 10) {
    const lower = keywords.map((k) => k.toLowerCase());

    return this.items
      .map((item) => {
        const text = item.text.toLowerCase();
        const metaKeywords = item.metadata.keywords || [];

        let score = 0;
        for (const kw of lower) {
          // Exact occurrence in code body
          const occurrences = (text.match(new RegExp(kw, "g")) || []).length;
          score += occurrences * 0.5;

          // Boost if keyword is in metadata keywords list
          if (metaKeywords.includes(kw)) score += 2;

          // Boost if keyword appears in function/class name
          if (item.metadata.name && item.metadata.name.toLowerCase().includes(kw)) {
            score += 3;
          }

          // Boost if keyword appears in file path
          if (item.metadata.filePath && item.metadata.filePath.toLowerCase().includes(kw)) {
            score += 1.5;
          }
        }

        return { ...item, keywordScore: score };
      })
      .filter((item) => item.keywordScore > 0)
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, topK);
  }

  // ─── Metadata filter: filter by role, language, or file path ──────────────
  filterByMetadata(filters = {}) {
    return this.items.filter((item) => {
      if (filters.role && item.metadata.role !== filters.role) return false;
      if (filters.language && item.metadata.language !== filters.language) return false;
      if (filters.filePath && !item.metadata.filePath.includes(filters.filePath)) return false;
      return true;
    });
  }

  // ─── Clear all stored chunks ───────────────────────────────────────────────
  clear() {
    this.items = [];
  }

  // ─── Return basic stats ────────────────────────────────────────────────────
  getStats() {
    const roles = {};
    const languages = {};

    for (const item of this.items) {
      roles[item.metadata.role] = (roles[item.metadata.role] || 0) + 1;
      languages[item.metadata.language] = (languages[item.metadata.language] || 0) + 1;
    }

    return {
      totalChunks: this.items.length,
      roles,
      languages,
    };
  }
}

// Singleton — shared across the process lifetime
export const vectorStore = new VectorStore();
