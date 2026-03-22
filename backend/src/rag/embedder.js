/**
 * Embedder module
 *
 * We use a lightweight local TF-IDF + hash-based approach instead of
 * @xenova/transformers to avoid the heavy WASM/model download overhead in
 * production Node environments. This gives us fast, deterministic, and
 * zero-cost embeddings with reasonable semantic quality for code retrieval.
 *
 * For production you can swap generateEmbedding() with any embedding API
 * (Cohere, HuggingFace Inference API, etc.) without touching the rest of the RAG stack.
 */

// Vocabulary accumulated across all chunks
const vocab = new Map(); // word → global index
let vocabSize = 0;
const EMBEDDING_DIM = 512; // fixed output dimension via hashing

// ─── Generate an embedding vector for a piece of text ────────────────────────
export const generateEmbedding = async (text) => {
  const tokens = tokenize(text);
  const tf = computeTF(tokens);

  // Hash each token into a fixed-dimensional space (Feature Hashing trick)
  const vector = new Float32Array(EMBEDDING_DIM).fill(0);

  for (const [term, freq] of Object.entries(tf)) {
    // Two independent hash functions to reduce collisions
    const idx1 = murmurhash(term) % EMBEDDING_DIM;
    const idx2 = murmurhash(term + "_b") % EMBEDDING_DIM;
    const sign1 = murmurhash(term + "_sign") % 2 === 0 ? 1 : -1;
    const sign2 = murmurhash(term + "_sign2") % 2 === 0 ? 1 : -1;
    vector[idx1] += sign1 * freq;
    vector[idx2] += sign2 * freq;
  }

  return normalize(vector);
};

// ─── Tokenize: split camelCase FIRST (before lowercasing), then normalise ────
// Order matters: toLowerCase() must come AFTER camelCase split, otherwise
// "getUserById" becomes "getuserbyid" and the regex can't find boundaries.
const tokenize = (text) => {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")       // getUserById → get UserId
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // XMLParser  → XML Parser
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
};

// ─── Compute term-frequency map ───────────────────────────────────────────────
const computeTF = (tokens) => {
  const freq = {};
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }
  // Normalize by total token count
  const total = tokens.length || 1;
  for (const k in freq) freq[k] /= total;
  return freq;
};

// ─── L2-normalize a Float32Array ──────────────────────────────────────────────
const normalize = (vec) => {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return Array.from(vec);
};

// ─── MurmurHash3 (simplified 32-bit) ─────────────────────────────────────────
const murmurhash = (str, seed = 0) => {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return Math.abs(h);
};

// ─── Cosine similarity between two numeric arrays ────────────────────────────
export const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};
