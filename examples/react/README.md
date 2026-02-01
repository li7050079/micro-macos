# React 子应用示例

## 项目概述

这是一个基于 React 的子应用示例，展示如何在主应用中集成 React 子应用。

## 技术栈

- React
- React Router
- Create React App
- JavaScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run start
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
react/
├── public/             # 静态资源
├── src/               # 源代码
│   ├── App.js          # 根组件
│   ├── index.js        # 入口文件
│   ├── router/         # 路由配置
│   └── components/     # 组件
├── package.json        # 项目配置
└── craco.config.js     # CRA 配置
```

## 关键配置

### 1. 入口文件配置

在 `src/index.js` 中，需要导出 Qiankun 要求的生命周期钩子：

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

let root = null

// 初始化子应用
export function bootstrap(props) {
  console.log('React app bootstraped')
  return Promise.resolve()
}

// 挂载子应用
export function mount(props) {
  console.log('React app mounted', props)
  root = ReactDOM.createRoot(props.container.querySelector('#root'))
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/react/' : '/'}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
  return Promise.resolve()
}

// 卸载子应用
export function unmount(props) {
  console.log('React app unmounted')
  root.unmount()
  root = null
  return Promise.resolve()
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}
```

### 2. 构建配置

在 `craco.config.js` 中，需要配置构建选项以支持微前端环境：

```javascript
module.exports = {
  webpack: {
    configure: (config) => {
      config.output.library = 'reactApp'
      config.output.libraryTarget = 'umd'
      config.output.publicPath = window.__POWERED_BY_QIANKUN__ ? '//localhost:8082/' : '/'
      return config
    }
  },
  devServer: {
    port: 8082,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

### 3. 主应用注册

在主应用的 `micro-app/qiankun-config.js` 中注册子应用：

```javascript
registerMicroApps([
  {
    name: 'react',
    entry: '//localhost:8082',
    container: '#react',
    activeRule: '/react',
    props: {
      message: 'Hello from main app'
    }
  }
])
```

## 功能示例

### 1. 基本路由

```javascript
// src/router/index.js
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="about" element={<About />} />
    </Routes>
  )
}

export default AppRoutes
```

### 2. 组件示例

```jsx
// src/components/HelloWorld.jsx
import React, { useState } from 'react'

function HelloWorld() {
  const [msg] = useState('Hello React!')

  return (
    <div className="hello">
      <h1>{msg}</h1>
      <p>
        Welcome to your React sub-application!
      </p>
    </div>
  )
}

export default HelloWorld
```

### 3. 与主应用通信

```javascript
// src/utils/event-bus.js
class EventBus {
  constructor() {
    this.events = {}
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

const eventBus = new EventBus()
export default eventBus

// 使用示例
import eventBus from './utils/event-bus'

function App() {
  React.useEffect(() => {
    // 监听主应用事件
    const handleMainMessage = (data) => {
      console.log('Received message from main app:', data)
    }
    
    eventBus.on('main:message', handleMainMessage)
    
    // 向主应用发送事件
    eventBus.emit('sub:message', {
      message: 'Hello from React sub-app'
    })
    
    return () => {
      eventBus.off('main:message', handleMainMessage)
    }
  }, [])
  
  return (
    <div className="app">
      {/* 组件内容 */}
    </div>
  )
}

export default App
```

## 最佳实践

1. **独立运行**：子应用应支持独立运行，便于开发和调试
2. **生命周期管理**：正确实现 Qiankun 要求的生命周期钩子
3. **路由配置**：使用相对路径，避免硬编码
4. **样式隔离**：使用 CSS Modules 或 styled-components
5. **通信机制**：使用事件总线或全局状态进行通信
6. **错误处理**：添加错误处理，提高应用稳定性
7. **性能优化**：使用 React.memo 和 useMemo 优化渲染

## 常见问题

### 1. 子应用加载失败

**解决方案**：
- 检查子应用的入口地址是否正确
- 检查子应用的构建配置是否正确
- 检查子应用的生命周期钩子是否正确实现

### 2. 路由冲突

**解决方案**：
- 使用 BrowserRouter 的 basename 属性
- 配置正确的 publicPath
- 避免使用绝对路径

### 3. 样式污染

**解决方案**：
- 使用 CSS Modules
- 使用 styled-components
- 为子应用添加命名空间

### 4. 通信失败

**解决方案**：
- 检查事件总线是否正确初始化
- 检查事件名称是否一致
- 检查通信协议是否符合规范

## 总结

本示例展示了如何创建一个基于 React 的子应用，并集成到主应用中。通过正确配置入口文件、构建选项和路由，以及实现必要的生命周期钩子，可以构建一个功能完整、性能良好的 React 子应用。