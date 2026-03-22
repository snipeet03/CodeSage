import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SourcePanel from './SourcePanel.jsx'

const SUGGESTED = [
  'What is the overall architecture of this codebase?',
  'What are the main entry points?',
  'How is error handling implemented?',
  'What dependencies or external libraries are used?',
  'How is authentication handled?',
  'What is the data flow for a typical request?',
]

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "I've analyzed the codebase and I'm ready to answer your questions.\n\nYou can ask me about:\n- **Architecture** — how files and modules relate\n- **Data flow** — how a request travels through the system\n- **Functions** — what a specific function does\n- **Patterns** — design patterns used\n- **Dependencies** — what external packages are used and why",
      sources: [],
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const question = (text || input).trim()
    if (!question || loading) return
    setInput('')

    // Append user message
    setMessages(prev => [...prev, { role: 'user', content: question, sources: [] }])
    setLoading(true)

    try {
      const res  = await fetch('/api/query', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Server error')

      const msgSources = data.sources || []
      setSources(msgSources)

      setMessages(prev => [
        ...prev,
        {
          role:    'assistant',
          content: data.answer,
          sources: msgSources,
          chunks:  data.chunksUsed,
        },
      ])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role:    'assistant',
          content: `**Error:** ${e.message}\n\nPlease check that the backend is running and a repo is indexed.`,
          sources: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-layout">
      {/* ── Main chat panel ──────────────────────────────── */}
      <div className="chat-container">
        {/* Message list */}
        <div className="messages">
          {messages.map((m, i) => (
            <Message key={i} message={m} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions (only on first message) */}
        {messages.length === 1 && !loading && (
          <div className="suggestions">
            {SUGGESTED.map((q, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="input-area">
          <textarea
            className="chat-input"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask about functions, data flow, architecture… (Enter to send)"
            disabled={loading}
          />
          <button
            className="btn-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Source attribution panel ─────────────────────── */}
      <SourcePanel sources={sources} />
    </div>
  )
}

// ─── Individual message bubble ────────────────────────────────────────────────
function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '⚡'}
      </div>
      <div className="message-body">
        <div className="bubble">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="inline-code" {...props}>{children}</code>
                  ) : (
                    <div className="code-block">
                      <div className="code-lang">{(className || '').replace('language-', '') || 'code'}</div>
                      <pre><code {...props}>{children}</code></pre>
                    </div>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {message.chunks > 0 && (
          <div className="message-meta">
            Retrieved {message.chunks} code chunks
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Animated typing indicator ────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message message-assistant">
      <div className="message-avatar">⚡</div>
      <div className="message-body">
        <div className="bubble typing-bubble">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    </div>
  )
}
