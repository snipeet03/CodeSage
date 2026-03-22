export default function StatusBar({ repo, stats }) {
  if (!repo) return null

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-dot" />
        <span className="status-repo">
          <strong>{repo.owner}</strong>/{repo.repo}
        </span>
      </div>
      <div className="status-right">
        {stats && (
          <>
            <Pill label="Files" value={stats.filesProcessed} />
            <Pill label="Chunks" value={stats.totalChunks} accent />
            {stats.filesSkipped > 0 && (
              <Pill label="Skipped" value={stats.filesSkipped} muted />
            )}
          </>
        )}
        <span className="status-model">llama3-70b · Groq</span>
      </div>
    </div>
  )
}

function Pill({ label, value, accent, muted }) {
  const cls = `pill ${accent ? 'pill-accent' : ''} ${muted ? 'pill-muted' : ''}`
  return (
    <span className={cls}>
      {label}: <strong>{value}</strong>
    </span>
  )
}
