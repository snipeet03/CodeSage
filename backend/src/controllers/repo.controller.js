import { cloneRepository, getRepoInfo } from "../services/gitService.js";
import { runIndexingPipeline } from "../services/indexingService.js";
import { vectorStore } from "../rag/vectorStore.js";

// ─── POST /api/load-repo ──────────────────────────────────────────────────────
// Clones the GitHub repository to disk. Does NOT index yet.
export const loadRepo = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || !repoUrl.includes("github.com")) {
      return res.status(400).json({
        error: "Please provide a valid GitHub repository URL.",
      });
    }

    const repoInfo = await cloneRepository(repoUrl);

    res.json({
      success: true,
      message: `Repository cloned successfully.`,
      repo: repoInfo,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/index-repo ─────────────────────────────────────────────────────
// Runs the full RAG indexing pipeline on the cloned repo.
export const indexRepo = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required." });
    }

    // Clear any previous index
    vectorStore.clear();

    const result = await runIndexingPipeline(repoUrl);

    res.json({
      success: true,
      message: "Indexing complete.",
      stats: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/repo-status ─────────────────────────────────────────────────────
export const getRepoStatus = async (req, res) => {
  const stats = vectorStore.getStats();
  res.json({ indexed: stats.totalChunks > 0, stats });
};
