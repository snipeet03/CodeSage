export default function Header({ onReset }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CodeLens</span>
        </div>
        <nav className="header-nav">
          {onReset && (
            <button className="btn-ghost" onClick={onReset}>
              ← Load another repo
            </button>
          )}
          <a
            className="btn-ghost"
            href="https://console.groq.com"
            target="_blank"
            rel="noreferrer"
          >
            Get Groq API key ↗
          </a>
        </nav>
      </div>
    </header>
  )
}
