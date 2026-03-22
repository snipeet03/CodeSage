import React, { useState } from 'react'
import RepoLoader from './pages/RepoLoader'
import ChatInterface from './pages/ChatInterface'

/**
 * App.jsx
 * Root component. Manages which screen is active:
 *  - "loader"  → RepoLoader (submit GitHub URL)
 *  - "chat"    → ChatInterface (ask questions)
 */
export default function App() {
  const [screen, setScreen] = useState('loader')
  const [repoInfo, setRepoInfo] = useState(null) // { repoName, filesLoaded, chunksCreated }

  function handleRepoLoaded(info) {
    setRepoInfo(info)
    setScreen('chat')
  }

  function handleReset() {
    setRepoInfo(null)
    setScreen('loader')
  }

  return screen === 'loader'
    ? <RepoLoader onLoaded={handleRepoLoaded} />
    : <ChatInterface repoInfo={repoInfo} onReset={handleReset} />
}
