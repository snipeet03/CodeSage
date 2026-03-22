import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from './ChatMessage.module.css'

/**
 * ChatMessage.jsx
 * Renders a single chat message — user, assistant, or error.
 * Assistant messages support full markdown + syntax-highlighted code blocks.
 */
export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : ''}`}>
      {/* Avatar */}
      <div className={`${styles.avatar} ${isUser ? styles.userAvatar : isError ? styles.errorAvatar : styles.botAvatar}`}>
        {isUser ? '👤' : isError ? '⚠️' : '🧠'}
      </div>

      {/* Bubble */}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : isError ? styles.errorBubble : styles.botBubble}`}>
        {isUser || isError ? (
          <p className={styles.plain}>{message.content}</p>
        ) : (
          <div className={styles.markdown}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ borderRadius: 8, fontSize: '0.82rem', margin: '0.5rem 0' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={styles.inlineCode} {...props}>{children}</code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Source files */}
        {!isUser && !isError && message.sources?.length > 0 && (
          <div className={styles.sources}>
            <span className={styles.sourcesLabel}>Sources</span>
            {message.sources.map(src => (
              <span key={src} className={styles.sourceTag}>{src}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
