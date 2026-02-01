# 子应用接入指南

## 1. 概述

本指南旨在帮助开发者将现有业务系统改造为可接入主应用（桌面壳）的子应用，并支持通过主应用的菜单直接访问到子应用的对应业务功能。

## 2. 接入要求

### 2.1 技术要求

- 子应用需支持微前端集成（推荐使用 micro-app 框架）
- 子应用需支持路由系统（如 Vue Router、React Router 等）
- 子应用需支持接收主应用传递的路由参数

### 2.2 配置要求

子应用需要在主应用中注册以下信息：
- 基本信息：id、name、icon
- 微前端配置：entry、container、activeRule、iframe
- 业务菜单配置：path、params、query

## 3. 配置格式详解

### 3.1 应用配置结构

```json
{
  "id": "crm",
  "name": "客户管理",
  "icon": "/src/assets/icons/apps/crm.svg",
  "entry": "//localhost:8082",
  "container": "#app-container",
  "activeRule": "/crm",
  "iframe": true,
  "type": "app",
  "children": [
    {
      "id": "crm-customers",
      "name": "客户列表",
      "icon": "/src/assets/icons/apps/crm.svg",
      "type": "app",
      "path": "/customers",
      "params": {},
      "query": {}
    },
    {
      "id": "crm-leads",
      "name": "线索管理",
      "icon": "/src/assets/icons/apps/crm.svg",
      "type": "app",
      "path": "/leads",
      "params": {},
      "query": {}
    }
  ]
}
```

### 3.2 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 应用唯一标识 |
| name | string | 是 | 应用名称 |
| icon | string | 是 | 应用图标路径 |
| entry | string | 是 | 应用入口地址 |
| container | string | 是 | 应用容器选择器 |
| activeRule | string | 是 | 激活规则（路由前缀） |
| iframe | boolean | 否 | 是否使用 iframe 模式 |
| type | string | 是 | 类型（app/folder） |
| children | array | 否 | 子菜单列表 |
| path | string | 否 | 业务菜单路径 |
| params | object | 否 | 路径参数 |
| query | object | 否 | 查询参数 |

## 4. 子应用改造步骤

### 4.1 Vue 子应用改造

#### 4.1.1 安装依赖

```bash
npm install @micro-zoe/micro-app
```

#### 4.1.2 入口文件改造

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 监听微前端环境变量
if (window.__MICRO_APP_ENVIRONMENT__) {
  // 从微前端框架获取路由信息
  window.__MICRO_APP_NAME__ = 'vue3-subapp'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/vue3'
  
  // 注册微前端生命周期
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount() {
      console.log('Vue app mounted in micro frontend')
      app.use(router).mount('#app')
    },
    unmount() {
      console.log('Vue app unmounted from micro frontend')
      app.unmount()
    }
  }
} else {
  // 独立运行模式
  app.use(router).mount('#app')
}
```

#### 4.1.3 路由配置改造

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || process.env.BASE_URL),
  routes
})

// 监听主应用传递的路由信息
router.beforeEach((to, from, next) => {
  // 从 window 中获取主应用传递的路由信息
  if (window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const { path, params, query } = window.__MICRO_APP_PROPS__.routeInfo
    if (path && path !== to.path) {
      // 跳转到指定路径
      router.push({ path, params, query })
      return
    }
  }
  next()
})

export default router
```

### 4.2 React 子应用改造

#### 4.2.1 安装依赖

```bash
npm install @micro-zoe/micro-app
```

#### 4.2.2 入口文件改造

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'))

// 监听微前端环境变量
if (window.__MICRO_APP_ENVIRONMENT__) {
  // 从微前端框架获取路由信息
  window.__MICRO_APP_NAME__ = 'react'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/react'
  
  // 注册微前端生命周期
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount() {
      console.log('React app mounted in micro frontend')
      root.render(
        <React.StrictMode>
          <BrowserRouter basename={window.__MICRO_APP_BASE_ROUTE__}>
            <App />
          </BrowserRouter>
        </React.StrictMode>
      )
    },
    unmount() {
      console.log('React app unmounted from micro frontend')
      root.unmount()
    }
  }
} else {
  // 独立运行模式
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}
```

#### 4.2.3 App 组件改造

```javascript
// App.js
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 监听主应用传递的路由信息
    if (window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
      const { path, params, query } = window.__MICRO_APP_PROPS__.routeInfo
      if (path && path !== location.pathname) {
        // 构建带参数的路径
        let targetPath = path
        if (Object.keys(params).length > 0) {
          Object.entries(params).forEach(([key, value]) => {
            targetPath = targetPath.replace(`:${key}`, value)
          })
        }
        // 跳转到指定路径
        navigate({ pathname: targetPath, search: new URLSearchParams(query).toString() })
      }
    }
  }, [navigate, location.pathname])

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
```

## 5. 主应用集成步骤

### 5.1 注册子应用

在主应用的应用配置接口中添加子应用信息：

```javascript
// 示例：添加到 loadAppConfigFromApi 方法的返回值中
{
  id: 'your-app-id',
  name: '你的应用名称',
  icon: '/path/to/your/icon.svg',
  entry: '//your-app-domain:port',
  container: '#app-container',
  activeRule: '/your-app',
  iframe: true,
  type: 'app',
  children: [
    {
      id: 'your-app-feature1',
      name: '功能1',
      icon: '/path/to/your/icon.svg',
      type: 'app',
      path: '/feature1',
      params: {},
      query: {}
    },
    {
      id: 'your-app-feature2',
      name: '功能2',
      icon: '/path/to/your/icon.svg',
      type: 'app',
      path: '/feature2',
      params: {},
      query: {}
    }
  ]
}
```

### 5.2 测试验证

1. 启动主应用和子应用
2. 在主应用的开始菜单中找到你的应用
3. 点击应用的子菜单，验证是否能直接打开到对应功能页面

## 6. 常见问题与解决方案

### 6.1 子应用无法接收路由参数

**问题**：主应用传递的路由参数未被子应用接收

**解决方案**：
- 检查子应用是否正确监听 `window.__MICRO_APP_PROPS__`
- 检查子应用的路由配置是否正确处理参数
- 确保主应用传递的参数格式正确

### 6.2 子应用路由冲突

**问题**：子应用路由与主应用路由冲突

**解决方案**：
- 为子应用设置唯一的 `activeRule`
- 使用 `window.__MICRO_APP_BASE_ROUTE__` 作为子应用的路由基础路径
- 避免使用绝对路径，使用相对路径

### 6.3 子应用样式隔离问题

**问题**：子应用样式影响主应用或其他子应用

**解决方案**：
- 在主应用的 micro-app 配置中启用严格样式隔离
- 子应用使用命名空间或 CSS Modules
- 避免使用全局样式

## 7. 最佳实践

### 7.1 目录结构

推荐的子应用目录结构：

```
your-subapp/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── views/ (或 pages/)
│   ├── router/
│   ├── App.vue (或 App.js)
│   └── main.js
├── package.json
└── vite.config.js (或 webpack.config.js)
```

### 7.2 开发流程

1. 首先在独立模式下开发和测试子应用
2. 然后集成到主应用中进行联调测试
3. 最后部署到生产环境

### 7.3 性能优化

- 启用微前端的预加载功能
- 优化子应用的资源加载
- 使用懒加载和代码分割
- 合理设置微前端的缓存策略

## 8. 示例应用

主应用中已集成以下示例应用，可作为参考：

- Vue 3 示例应用（含仪表盘、用户管理功能）
- React 示例应用（含首页、个人中心功能）
- Angular 示例应用（含仪表盘、设置功能）

## 9. 总结

通过本指南的配置和改造，子应用可以：

1. 以桌面窗口的形式集成到主应用中
2. 支持通过主应用菜单直接访问到对应业务功能
3. 与主应用进行有效的通信

这种方式不仅提高了用户体验，还实现了业务系统的模块化管理和独立部署。