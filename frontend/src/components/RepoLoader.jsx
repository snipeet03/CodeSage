import { useState, useEffect } from 'react'
import { api } from '../utils/api'

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
      setPhase('cloning')
      addLog('Connecting to backend…')
      const data = await api.loadRepo(url)

      addLog(`✓ Loaded ${data.repoName}`)
      setPhase('indexing')
      addLog('Indexing completed…')
      setPhase('done')
      onIndexed(
        { repo: data.repoName, fileCount: data.indexStatus?.files_loaded ?? '?' },
        {
          filesProcessed: data.indexStatus?.files_loaded ?? '?',
          totalChunks: data.indexStatus?.chunks_created ?? '?',
        },
      )

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
