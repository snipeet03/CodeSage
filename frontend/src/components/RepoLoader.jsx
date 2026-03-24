import { useState, useEffect } from 'react'

const PHASES = {
  idle:     { label: '🚀 Analyze Repo',   progress: 0   },
  cloning:  { label: '⏳ Cloning repo…',  progress: 25  },
  indexing: { label: '🔍 Indexing code…', progress: 65  },
  done:     { label: '✅ Ready!',          progress: 100 },
  error:    { label: '❌ Error',           progress: 0   },
}

export default function RepoLoader({ onIndexed }) {
  const [url,   setUrl]   = useState('')
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [log,   setLog]   = useState([])

  // Listen for sample-repo selections from App
  useEffect(() => {
    const handler = (e) => setUrl(e.detail)
    window.addEventListener('sample-repo', handler)
    return () => window.removeEventListener('sample-repo', handler)
  }, [])

  const addLog = (msg) => setLog(prev => [...prev, msg])

  const handleAnalyze = async () => {
    if (!url.includes('github.com')) {
      return setError('Please enter a valid GitHub repository URL.')
    }
    setError('')
    setLog([])

    try {
      // ── Phase 1: Clone ────────────────────────────────────────────
      setPhase('cloning')
      addLog('Connecting to GitHub…')

      const r1 = await fetch('/api/load-repo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ repoUrl: url }),
      })
      if (!r1.ok) {
        const text = await r1.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || `Server error: ${r1.status}`);
        } catch(e) {
          throw new Error(`Server returned an error (${r1.status}). Please try again in 30 seconds (backend may be waking up).`);
        }
      }
      const d1 = await r1.json()
      addLog(`✓ Cloned ${d1.repo.repo} (${d1.repo.fileCount} files found)`)

      // ── Phase 2: Index ────────────────────────────────────────────
      setPhase('indexing')
      addLog('Parsing source files…')
      addLog('Generating embeddings…')
      addLog('Building vector index…')

      const r2 = await fetch('/api/index-repo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ repoUrl: url }),
      })
      if (!r2.ok) {
        const text2 = await r2.text();
        try {
          const json2 = JSON.parse(text2);
          throw new Error(json2.error || `Server error: ${r2.status}`);
        } catch(e) {
          throw new Error(`Server returned an error (${r2.status}). Please try again.`);
        }
      }
      const d2 = await r2.json()

      addLog(`✓ Indexed ${d2.stats.filesProcessed} files → ${d2.stats.totalChunks} chunks`)
      setPhase('done')
      onIndexed(d1.repo, d2.stats)

    } catch (e) {
      setPhase('error')
      setError(e.message)
      addLog(`✗ Failed: ${e.message}`)
    }
  }

  const busy = phase === 'cloning' || phase === 'indexing'
  const current = PHASES[phase]

  return (
    <div className="repo-loader">
      <div className="loader-inner">
        <label className="loader-label">GitHub Repository URL</label>
        <div className="input-row">
          <input
            className="repo-input"
            type="text"
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !busy && handleAnalyze()}
            disabled={busy}
            spellCheck={false}
          />
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={busy || !url.trim()}
          >
            {current.label}
          </button>
        </div>

        {/* Progress bar */}
        {phase !== 'idle' && phase !== 'error' && (
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${current.progress}%` }}
            />
          </div>
        )}

        {/* Activity log */}
        {log.length > 0 && (
          <div className="activity-log">
            {log.map((l, i) => (
              <div key={i} className="log-line">{l}</div>
            ))}
            {busy && <div className="log-line blinking">▋</div>}
          </div>
        )}

        {error && <p className="error-msg">⚠ {error}</p>}
      </div>
    </div>
  )
}
