// ─── Clean and normalize a user query ────────────────────────────────────────
export const cleanQuery = (query) => {
  return query
    .trim()
    .replace(/\s+/g, " ")
    // Expand common abbreviations
    .replace(/\bauth\b/gi, "authentication")
    .replace(/\bdb\b/gi, "database")
    .replace(/\bapi\b/gi, "API")
    .replace(/\bfn\b/gi, "function");
};

// ─── Extract meaningful keywords from a natural language query ────────────────
export const extractKeywords = (query) => {
  const stopWords = new Set([
    "what", "where", "how", "does", "the", "this", "that", "is", "are",
    "in", "on", "at", "to", "of", "and", "or", "a", "an", "it", "its",
    "for", "with", "from", "by", "which", "who", "when", "why", "can",
    "do", "be", "was", "has", "have", "had", "will", "would", "could",
    "should", "been", "being", "make", "get", "find", "show", "tell",
    "explain", "describe", "file", "code", "function", "class", "method",
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Also split camelCase terms that might appear in code references
  const expanded = [];
  for (const w of words) {
    expanded.push(w);
    // e.g. "getUserById" → ["get", "user", "by", "id"]
    const parts = w.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(" ");
    if (parts.length > 1) expanded.push(...parts);
  }

  return [...new Set(expanded)];
};
