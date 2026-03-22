import { getRepoPath } from "./gitService.js";
import { filterFiles } from "../utils/fileFilter.js";
import { chunkCode } from "../rag/chunker.js";
import { generateEmbedding } from "../rag/embedder.js";
import { vectorStore } from "../rag/vectorStore.js";
import fs from "fs-extra";

// ─── Run the full indexing pipeline ──────────────────────────────────────────
export const runIndexingPipeline = async (repoUrl) => {
  const repoPath = getRepoPath(repoUrl);

  const exists = await fs.pathExists(repoPath);
  if (!exists) {
    throw new Error("Repository not cloned yet. Please call /load-repo first.");
  }

  console.log(`📂 Starting indexing pipeline for: ${repoPath}`);

  // Step 1: Filter relevant source files
  const files = await filterFiles(repoPath);
  console.log(`📄 Found ${files.length} source files to index.`);

  if (files.length === 0) {
    throw new Error("No source files found in this repository.");
  }

  let totalChunks = 0;
  let skipped = 0;

  // Step 2: Process each file
  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, "utf-8");

      // Skip very large files (> 200KB) to avoid OOM
      if (content.length > 200_000) {
        console.log(`⚠️  Skipping large file: ${filePath}`);
        skipped++;
        continue;
      }

      // Step 3: Chunk code into function/class-level pieces
      const chunks = chunkCode(content, filePath, repoPath);

      if (chunks.length === 0) continue;

      // Step 4: Generate embeddings for each chunk and store
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);
        vectorStore.add({ ...chunk, embedding });
        totalChunks++;
      }
    } catch (err) {
      console.warn(`⚠️  Failed to process ${filePath}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`✅ Indexing complete. ${totalChunks} chunks stored. ${skipped} files skipped.`);

  return {
    filesProcessed: files.length - skipped,
    filesSkipped: skipped,
    totalChunks,
  };
};
