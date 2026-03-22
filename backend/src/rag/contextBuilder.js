// ─── Build a structured context block from retrieved code chunks ──────────────
// Groups chunks by their architectural role for cleaner LLM reasoning.
export const buildContext = (chunks) => {
  // Group by role
  const grouped = {};

  for (const chunk of chunks) {
    const role = chunk.metadata.role || "other";
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(chunk);
  }

  const sections = [];

  // Role display order (most architecturally significant first)
  const roleOrder = [
    "controller",
    "service",
    "model",
    "router",
    "middleware",
    "utility",
    "component",
    "hook",
    "config",
    "test",
    "other",
  ];

  for (const role of roleOrder) {
    if (!grouped[role]) continue;

    const roleChunks = grouped[role];
    const roleLabel = role.toUpperCase();

    const chunkTexts = roleChunks
      .map((c) => {
        const header = `--- [${c.metadata.filePath}] ${c.metadata.name || ""} (${c.metadata.language}) ---`;
        return `${header}\n${c.text}`;
      })
      .join("\n\n");

    sections.push(`### ${roleLabel} FILES\n\n${chunkTexts}`);
  }

  return sections.join("\n\n---\n\n");
};
