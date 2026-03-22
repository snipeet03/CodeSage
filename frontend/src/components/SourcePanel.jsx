const ROLE_COLORS = {
  controller: '#3b82f6',
  service:    '#8b5cf6',
  model:      '#10b981',
  router:     '#f59e0b',
  middleware: '#ef4444',
  utility:    '#6b7280',
  component:  '#ec4899',
  hook:       '#14b8a6',
  config:     '#f97316',
  test:       '#84cc16',
  other:      '#4b5563',
}

export default function SourcePanel({ sources }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="source-panel source-panel-empty">
        <div className="source-panel-header">
          <span className="source-icon">📁</span>
          <span>Sources</span>
        </div>
        <p className="source-empty-msg">
          Sources will appear here after your first question.
        </p>
      </div>
    )
  }

  return (
    <div className="source-panel">
      <div className="source-panel-header">
        <span className="source-icon">📁</span>
        <span>Sources Used</span>
        <span className="source-count">{sources.length}</span>
      </div>
      <ul className="source-list">
        {sources.map((s, i) => (
          <li key={i} className="source-item">
            <div className="source-item-top">
              <span
                className="role-badge"
                style={{ background: ROLE_COLORS[s.role] || ROLE_COLORS.other }}
              >
                {s.role}
              </span>
              <span className="lang-badge">{s.language}</span>
            </div>
            <div className="source-path" title={s.filePath}>
              {formatPath(s.filePath)}
            </div>
          </li>
        ))}
      </ul>

      <div className="retrieval-info">
        <span className="retrieval-label">Retrieval</span>
        <span className="retrieval-tags">
          <span className="rtag">Semantic</span>
          <span className="rtag">Keyword</span>
          <span className="rtag">RRF Fusion</span>
        </span>
      </div>
    </div>
  )
}

// Shorten long paths: src/services/auth/authService.js → …/auth/authService.js
function formatPath(filePath) {
  if (!filePath) return ''
  const parts = filePath.split('/')
  if (parts.length <= 3) return filePath
  return `…/${parts.slice(-2).join('/')}`
}
