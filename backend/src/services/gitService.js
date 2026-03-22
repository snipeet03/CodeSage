import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPOS_DIR = path.join(__dirname, "../../tmp/repos");

// ─── Parse a GitHub URL into owner/repo ──────────────────────────────────────
export const parseGitHubUrl = (url) => {
  // Handle https://github.com/owner/repo and https://github.com/owner/repo.git
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error("Invalid GitHub URL format.");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
};

// ─── Return the local clone path for a given repo URL ────────────────────────
export const getRepoPath = (repoUrl) => {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  return path.join(REPOS_DIR, `${owner}_${repo}`);
};

// ─── Clone (or re-clone) a GitHub repository ─────────────────────────────────
export const cloneRepository = async (repoUrl) => {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const repoPath = getRepoPath(repoUrl);

  // Remove old clone if it exists
  await fs.remove(repoPath);
  await fs.ensureDir(REPOS_DIR);

  const git = simpleGit();

  // Limit clone depth to keep it fast for large repos
  await git.clone(repoUrl, repoPath, ["--depth", "1"]);

  // Collect basic repo stats
  const files = await countFiles(repoPath);

  return {
    owner,
    repo,
    localPath: repoPath,
    clonedAt: new Date().toISOString(),
    fileCount: files,
  };
};

// ─── Get basic info about an already-cloned repo ─────────────────────────────
export const getRepoInfo = async (repoUrl) => {
  const repoPath = getRepoPath(repoUrl);
  const exists = await fs.pathExists(repoPath);
  if (!exists) return null;

  const files = await countFiles(repoPath);
  return { localPath: repoPath, fileCount: files };
};

// ─── Recursively count non-hidden files ──────────────────────────────────────
const countFiles = async (dir) => {
  let count = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) count += await countFiles(fullPath);
    else count++;
  }
  return count;
};
