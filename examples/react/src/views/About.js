import React from 'react'

const About = () => {
  return (
    <div className="about">
      <h2>关于我们</h2>
      <p>这是一个基于 React 的子应用示例，展示如何在主应用中集成 React 子应用。</p>
      <p>技术栈：</p>
      <ul>
        <li>React 18</li>
        <li>React Router 6</li>
        <li>JavaScript</li>
        <li>Qiankun 微前端</li>
      </ul>
      <p>功能特点：</p>
      <ul>
        <li>支持独立运行</li>
        <li>支持在主应用中集成</li>
        <li>支持与主应用通信</li>
        <li>支持路由导航</li>
      </ul>
    </div>
  )
}

export default About