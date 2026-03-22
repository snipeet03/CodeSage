import React, { useState, useRef, useEffect } from 'react'
import { api } from '../utils/api'
import ChatMessage from '../components/ChatMessage'
import styles from './ChatInterface.module.css'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "I've indexed the repository and I'm ready to answer questions about the code. Ask me anything — architecture, specific functions, data flow, or how components connect.",
  sources: [],
}

/**
 * ChatInterface.jsx
 * Screen 2: Full chat UI for querying the indexed codebase.
 */
export default function ChatInterface({ repoInfo, onReset }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    const userMsg = { id: Date.now(), role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await api.query(question)
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'error',
        content: `Error: ${err.message}`,
        sources: [],
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const SUGGESTIONS = [
    'What is the overall architecture of this project?',
    'How is authentication implemented?',
    'What are the main entry points?',
    'Explain the data flow from frontend to backend.',
  ]

  function useSuggestion(s) {
    setInput(s)
    inputRef.current?.focus()
  }

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>🧠 Codebase Explainer</div>
          <div className={styles.repoCard}>
            <div className={styles.repoLabel}>Indexed Repository</div>
            <div className={styles.repoName}>{repoInfo?.repoName}</div>
            <div className={styles.repoStats}>
              <span>{repoInfo?.filesLoaded} files</span>
              <span>·</span>
              <span>{repoInfo?.chunksCreated} chunks</span>
            </div>
          </div>
        </div>

        <div className={styles.suggestionsSection}>
          <div className={styles.sectionLabel}>Suggested Questions</div>
          {SUGGESTIONS.map(s => (
            <button key={s} className={styles.suggestion} onClick={() => useSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>

        <button className={styles.resetBtn} onClick={onReset}>
          ← Load New Repository
        </button>
      </aside>

      {/* ── Main chat area ── */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>Chat with Codebase</div>
            <div className={styles.headerSub}>Powered by Groq LLaMA 3 + FAISS RAG</div>
          </div>
          <div className={styles.statusDot} title="RAG service active" />
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className={styles.inputBar} onSubmit={handleSend}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about the codebase…"
            disabled={loading}
            autoFocus
          />
          <button className={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
            {loading ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </form>
      </main>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
      <span style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
            display: 'inline-block',
          }} />
        ))}
      </span>
      Thinking…
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function SpinnerIcon() {
  return <span style={{ width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}
