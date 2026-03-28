/**
 * services/repo.service.js
 * Responsible for:
 *  1. Validating the GitHub URL
 *  2. Cloning the repository with simple-git
 *  3. Forwarding the local path to the Python RAG /index endpoint
 */

const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git");
const axios = require("axios");

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
const REPOS_DIR = path.resolve(process.env.REPOS_DIR || "./repos");

/**
 * Derive a safe directory name from a GitHub URL.
 * e.g. https://github.com/user/repo.git → "user_repo"
 */
function repoNameFromUrl(url) {
  const clean = url.replace(/\.git$/, "");
  const parts = clean.split("/");
  const user = parts[parts.length - 2] || "unknown";
  const name = parts[parts.length - 1] || "repo";
  return `${user}_${name}`;
}

/**
 * loadRepo — Express route handler
 */
async function loadRepo(req, res) {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ error: "repoUrl is required." });
  }

  const isGithub = /^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(repoUrl);
  if (!isGithub) {
    return res.status(400).json({ error: "Only GitHub URLs are supported." });
  }

  const repoName = repoNameFromUrl(repoUrl);
  const repoPath = path.join(REPOS_DIR, repoName);

  // ── Clone or pull ───────────────────────────────────────────────────────
  if (fs.existsSync(repoPath)) {
    console.log(`[repo.service] Repo already cloned at ${repoPath}. Pulling latest...`);
    const git = simpleGit(repoPath);
    await git.pull();
  } else {
    console.log(`[repo.service] Cloning ${repoUrl} → ${repoPath}`);
    await simpleGit().clone(repoUrl, repoPath, ["--depth", "1"]);
  }

  // ── Trigger RAG indexing ────────────────────────────────────────────────
  console.log(`[repo.service] Sending ${repoPath} to RAG service for indexing...`);
  const ragResponse = await axios.post(`${RAG_SERVICE_URL}/index`, {
    repo_path: repoPath,
    repo_name: repoName,
  }, { timeout: 120_000 }); // 120s — RAG service may cold-start on Render free tier

  return res.json({
    message: "Repository loaded and indexed successfully.",
    repoName,
    repoPath,
    indexStatus: ragResponse.data,
  });
}

module.exports = { loadRepo };
