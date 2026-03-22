import React, { useState } from 'react'
import { api } from '../utils/api'
import styles from './RepoLoader.module.css'

/**
 * RepoLoader.jsx
 * Screen 1: User inputs a GitHub URL and triggers repo indexing.
 */
export default function RepoLoader({ onLoaded }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('')   // cloning | indexing | done

  async function handleLoad(e) {
    e.preventDefault()
    if (!url.trim()) return

    setError('')
    setLoading(true)
    setStep('cloning')

    try {
      setTimeout(() => setStep('indexing'), 3000)
      const data = await api.loadRepo(url.trim())
      setStep('done')

      onLoaded({
        repoName: data.repoName,
        filesLoaded: data.indexStatus?.files_loaded ?? '?',
        chunksCreated: data.indexStatus?.chunks_created ?? '?',
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the RAG service running?')
      setStep('')
    } finally {
      setLoading(false)
    }
  }

  const STEPS = [
    { key: 'cloning',  label: 'Cloning repository…' },
    { key: 'indexing', label: 'Indexing & embedding code…' },
    { key: 'done',     label: 'Ready!' },
  ]

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.badge}>AI-Powered</div>
        <h1 className={styles.title}>
          <span className={styles.brain}>🧠</span> Codebase Explainer
        </h1>
        <p className={styles.subtitle}>
          Paste a GitHub repository URL and ask any question about the code —
          powered by RAG, FAISS, and Groq LLaMA&nbsp;3.
        </p>
      </div>

      {/* ── Form ── */}
      <form className={styles.card} onSubmit={handleLoad}>
        <label className={styles.label} htmlFor="repo-url">
          GitHub Repository URL
        </label>
        <div className={styles.inputRow}>
          <input
            id="repo-url"
            className={styles.input}
            type="url"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button className={styles.button} type="submit" disabled={loading || !url.trim()}>
            {loading ? <Spinner /> : 'Load Repo'}
          </button>
        </div>

        {/* ── Progress steps ── */}
        {loading && (
          <div className={styles.steps}>
            {STEPS.map(s => (
              <div key={s.key} className={`${styles.step} ${step === s.key ? styles.active : ''}`}>
                <span className={styles.dot} />
                {s.label}
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && <p className={styles.error}>⚠️ {error}</p>}
      </form>

      {/* ── Feature pills ── */}
      <div className={styles.features}>
        {['Recursive file loading', 'Code-aware chunking', 'HuggingFace embeddings',
          'FAISS vector search', 'Groq LLaMA 3 LLM', 'Anti-hallucination prompts'].map(f => (
          <span key={f} className={styles.pill}>{f}</span>
        ))}
      </div>
    </div>
  )
}

function Spinner() {
  return <span className="spinner" style={{
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid #fff4', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
}
