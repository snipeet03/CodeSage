import path from "path";
import fs from "fs-extra";

// Source file extensions we want to index
const ALLOWED_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".java", ".go", ".rb", ".php",
  ".cs", ".cpp", ".c", ".h", ".rs",
  ".swift", ".kt", ".scala", ".vue",
]);

// Directories and files to ignore
const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".github", "dist", "build", "out",
  ".next", ".nuxt", "coverage", "__pycache__", ".pytest_cache",
  "venv", "env", ".env", "vendor", "target", ".cargo",
  "bin", "obj", ".idea", ".vscode", "logs", "tmp",
]);

const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".eslintrc", ".prettierrc", ".babelrc",
]);

// Max file size to index (100KB)
const MAX_FILE_SIZE = 100_000;

// Max total files to index (guard against huge monorepos)
const MAX_FILES = 500;

// ─── Walk a directory and return all indexable source files ──────────────────
export const filterFiles = async (rootDir) => {
  const results = [];
  await walk(rootDir, rootDir, results);
  return results.slice(0, MAX_FILES);
};

const walk = async (dir, rootDir, results) => {
  if (results.length >= MAX_FILES) return;

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return; // Permission error or broken symlink — skip
  }

  for (const entry of entries) {
    if (results.length >= MAX_FILES) return;

    const fullPath = path.join(dir, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        await walk(fullPath, rootDir, results);
      }
      continue;
    }

    if (!entry.isFile()) continue;
    if (IGNORED_FILES.has(entry.name)) continue;
    if (entry.name.startsWith(".")) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    // Skip very large files
    try {
      const stat = await fs.stat(fullPath);
      if (stat.size > MAX_FILE_SIZE) continue;
    } catch {
      continue;
    }

    results.push(fullPath);
  }
};
