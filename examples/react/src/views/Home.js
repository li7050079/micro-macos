import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <h2>欢迎来到 React 子应用</h2>
      <p>这是一个基于 React 的子应用示例，展示如何在主应用中集成 React 子应用。</p>
      
      <div className="features">
        <div className="feature-item">
          <h3>📦 模块化设计</h3>
          <p>采用 React 组件化设计，实现模块化开发</p>
        </div>
        <div className="feature-item">
          <h3>🔄 微前端集成</h3>
          <p>支持与主应用的无缝集成，实现微前端架构</p>
        </div>
        <div className="feature-item">
          <h3>🌐 路由管理</h3>
          <p>使用 React Router 实现客户端路由管理</p>
        </div>
        <div className="feature-item">
          <h3>🔗 事件通信</h3>
          <p>通过事件总线与主应用和其他子应用通信</p>
        </div>
      </div>
      
      <div className="actions">
        <Link to="/about" className="btn">了解更多</Link>
      </div>
    </div>
  )
}

export default Home