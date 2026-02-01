import React, { useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './views/Home'
import About from './views/About'
import eventBus from './utils/event-bus'
import './App.css'

function App() {
  useEffect(() => {
    console.log('React app mounted')
    
    // 向主应用发送事件
    eventBus.emit('sub:message', {
      message: 'Hello from React sub-app'
    })
    
    // 监听主应用事件
    const handleMainMessage = (data) => {
      console.log('Received message from main app:', data)
    }
    
    eventBus.on('main:message', handleMainMessage)
    
    return () => {
      eventBus.off('main:message', handleMainMessage)
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>React 子应用</h1>
        <nav className="app-nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/about" className="nav-link">关于</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>© 2026 React 子应用示例</p>
      </footer>
    </div>
  )
}

export default App