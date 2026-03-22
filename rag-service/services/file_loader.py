"""
services/file_loader.py
Recursively loads code files from a cloned repository.
Skips irrelevant directories (node_modules, .git, __pycache__, etc.)
"""

import os
import logging
from langchain.schema import Document

logger = logging.getLogger(__name__)

# ── Directories to ignore ───────────────────────────────────────────────────
IGNORED_DIRS = {
    ".git", "__pycache__", "node_modules", ".venv", "venv", "env",
    "dist", "build", ".next", ".nuxt", "coverage", ".pytest_cache",
    ".mypy_cache", ".tox", "eggs", ".eggs", "*.egg-info",
    ".idea", ".vscode", ".DS_Store", "migrations",
}

# ── Supported file extensions ───────────────────────────────────────────────
SUPPORTED_EXTENSIONS = {
    # Web
    ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte",
    # Python
    ".py",
    # Backend
    ".java", ".go", ".rb", ".php", ".cs", ".cpp", ".c", ".h",
    # Config / markup
    ".json", ".yaml", ".yml", ".toml", ".env.example",
    # Docs
    ".md", ".rst",
    # Shell
    ".sh", ".bash",
    # SQL
    ".sql",
    # Rust
    ".rs",
    # Other
    ".html", ".css", ".scss",
}

# Max file size to load (bytes) — skip very large generated files
MAX_FILE_SIZE = 500_000  # 500 KB


class FileLoaderService:
    """Loads source code files from a repository path into LangChain Documents."""

    @staticmethod
    def load_repo(repo_path: str) -> list[Document]:
        """
        Walk the repo directory, read all supported files,
        and return a list of LangChain Document objects with metadata.
        """
        documents: list[Document] = []
        repo_path = os.path.abspath(repo_path)

        if not os.path.isdir(repo_path):
            raise ValueError(f"Repo path does not exist: {repo_path}")

        for root, dirs, files in os.walk(repo_path):
            # Prune ignored directories in-place (avoids descending into them)
            dirs[:] = [
                d for d in dirs
                if d not in IGNORED_DIRS and not d.startswith(".")
            ]

            for filename in files:
                _, ext = os.path.splitext(filename)
                if ext.lower() not in SUPPORTED_EXTENSIONS:
                    continue

                file_path = os.path.join(root, filename)

                # Skip files that are too large
                try:
                    file_size = os.path.getsize(file_path)
                    if file_size > MAX_FILE_SIZE:
                        logger.warning(f"[FileLoader] Skipping large file: {file_path} ({file_size} bytes)")
                        continue
                except OSError:
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    if not content.strip():
                        continue  # Skip empty files

                    # Relative path for clean metadata
                    rel_path = os.path.relpath(file_path, repo_path)

                    documents.append(Document(
                        page_content=content,
                        metadata={
                            "source": rel_path,
                            "filename": filename,
                            "extension": ext.lower(),
                            "file_size": file_size,
                        },
                    ))
                except Exception as e:
                    logger.warning(f"[FileLoader] Could not read {file_path}: {e}")

        logger.info(f"[FileLoader] Loaded {len(documents)} files from {repo_path}")
        return documents
