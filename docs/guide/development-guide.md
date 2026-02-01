# 开发指南

## 1. 项目初始化

### 1.1 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 14.0+ | 运行环境 |
| npm | 6.0+ | 包管理器 |
| Git | 2.0+ | 版本控制 |
| Vite | 4.0+ | 构建工具 |

### 1.2 安装依赖

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd srit-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 1.3 项目结构

```
srit-web/
├── public/             # 静态资源
├── src/               # 源代码
│   ├── App.vue        # 主应用根组件
│   ├── main.js        # 主应用入口
│   ├── components/    # 通用组件
│   ├── micro-app/     # 微前端相关
│   ├── services/      # 服务
│   ├── stores/        # Pinia 状态管理
│   ├── styles/        # 样式文件
│   └── utils/         # 工具函数
├── docs/              # 项目文档
├── examples/          # 示例应用
├── package.json       # 项目配置
└── vite.config.js     # Vite 配置
```

## 2. 主应用开发

### 2.1 核心组件开发

#### 2.1.1 桌面组件

**概述**：桌面组件是系统的核心组件，负责显示桌面背景、图标和窗口。

**开发要点**：

- **背景管理**：支持动态背景和主题背景
- **图标管理**：支持图标拖拽、排列和点击
- **右键菜单**：支持桌面右键菜单
- **窗口管理**：支持窗口的创建、激活、最小化等

**示例代码**：

```vue
<template>
  <div class="desktop-container" @contextmenu="showDesktopMenu($event)">
    <!-- 桌面背景 -->
    <div class="desktop-background" :style="{ background: desktopConfig.background }"></div>
    
    <!-- 桌面图标网格 -->
    <div class="desktop-icons" :style="{
      gridTemplateColumns: `repeat(auto-fill, ${desktopConfig.iconGridSize}px)`,
      gap: `${desktopConfig.iconSpacing}px`
    }">
      <DesktopIcon 
        v-for="(app, index) in desktopApps" 
        :key="app.id"
        :app="app"
        :index="index"
        :dragged-icon-index="desktopStore.draggedIconIndex"
        :is-long-pressing="desktopStore.isLongPressing"
        :is-dragging="desktopStore.isDragging"
        @app-context-menu="showAppContextMenu"
      />
    </div>
    
    <!-- 窗口容器 -->
    <div class="window-container">
      <Window 
        v-for="window in windows" 
        :key="window.id"
        v-show="!window.minimized"
        :window="window"
        @window-drag-start="startDrag"
      />
    </div>
    
    <!-- 任务栏 (Dock) -->
    <Dock 
      :dock-apps="dockApps"
      :show-dock="showDock"
      @system-preferences-show="showSystemPreferences"
    />
  </div>
</template>
```

#### 2.1.2 窗口组件

**概述**：窗口组件是子应用的容器，负责窗口的拖拽、缩放、最小化等操作。

**开发要点**：

- **窗口拖拽**：支持窗口标题栏拖拽
- **窗口缩放**：支持窗口边缘缩放
- **窗口状态**：支持最小化、最大化、关闭
- **子应用容器**：提供子应用挂载的容器
- **动态大小调整**：支持动态调整窗口大小

**示例代码**：

```vue
<template>
  <div class="window" :class="{ 'active': window.active, 'maximized': window.maximized }" :data-window-id="window.id">
    <div class="window-header" @mousedown="startDrag($event, window)">
      <div class="window-title">{{ window.title }}</div>
      <div class="window-controls">
        <button class="window-control minimize" @click.stop="minimizeWindow(window)" title="最小化"></button>
        <button class="window-control maximize" @click.stop="maximizeWindow(window)" title="最大化"></button>
        <button class="window-control close" @click.stop="closeWindow(window)" title="关闭"></button>
      </div>
    </div>
    <div class="window-content" ref="windowContent">
      <div :id="window.containerId" class="app-container" :data-app-id="window.appId"></div>
    </div>
  </div>
</template>
```

#### 2.1.3 Dock 组件

**概述**：Dock 组件是系统的任务栏，负责显示常用应用和系统功能。

**开发要点**：

- **应用图标**：显示应用图标和徽章
- **悬停效果**：支持图标放大和高亮
- **位置配置**：支持底部、左侧、右侧位置
- **系统功能**：集成系统菜单、文件系统等入口

**示例代码**：

```vue
<template>
  <div class="dock" :style="dockStyle">
    <div class="dock-items">
      <div 
        v-for="app in dockApps" 
        :key="app.id" 
        class="dock-item"
        @click="openApp(app)"
        @mouseenter="handleDockItemHover($event, true)"
        @mouseleave="handleDockItemHover($event, false)"
      >
        <img :src="app.icon" :alt="app.name" class="dock-icon" />
        <div class="dock-badge" v-if="app.badge">{{ app.badge }}</div>
      </div>
    </div>
    <div class="dock-separator"></div>
    <div class="dock-system">
      <!-- 系统功能图标 -->
    </div>
  </div>
</template>
```

### 2.2 状态管理开发

#### 2.2.1 配置状态管理

**概述**：配置状态管理负责管理系统的配置，包括主题、桌面、Dock 等设置。

**开发要点**：

- **主题管理**：支持明暗主题和自定义主题
- **桌面配置**：管理桌面背景、图标等设置
- **Dock 配置**：管理 Dock 位置、大小等设置
- **功能开关**：管理系统功能的启用状态

**示例代码**：

```javascript
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 主题配置
    theme: {
      mode: 'light',
      primaryColor: '#007aff',
      accentColor: '#5856d6',
      backgroundColor: '#f5f5f7',
      textColor: '#1d1d1f',
      secondaryTextColor: '#86868b',
      borderColor: '#d2d2d7'
    },
    
    // 桌面配置
    desktop: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      iconSize: 64,
      iconSpacing: 15,
      iconGridSize: 90,
      autoArrangeIcons: true
    },
    
    // Dock 配置
    dock: {
      position: 'bottom',
      size: 56,
      iconSize: 32,
      magnification: true,
      magnificationSize: 48,
      hide: false,
      autohide: false
    },
    
    // 功能开关
    features: {
      notificationCenter: true,
      systemTray: true,
      multipleDesktops: true,
      fileSystem: true
    }
  }),
  
  actions: {
    // 初始化配置
    initialize() {
      // 初始化配置逻辑
    },
    
    // 设置主题
    setTheme(mode) {
      // 主题切换逻辑
    },
    
    // 设置桌面背景
    setDesktopBackground(background, updateDesktopStore = true) {
      // 背景设置逻辑
    }
  }
})
```

#### 2.2.2 窗口状态管理

**概述**：窗口状态管理负责管理窗口的状态，包括窗口的创建、激活、最小化等操作。

**开发要点**：

- **窗口创建**：支持创建新窗口
- **窗口激活**：支持窗口的激活和聚焦
- **窗口状态**：支持最小化、最大化、关闭
- **多桌面支持**：支持窗口在不同桌面的显示

**示例代码**：

```javascript
import { defineStore } from 'pinia'

export const useWindowStore = defineStore('window', {
  state: () => ({
    windows: [],
    activeWindowId: null
  }),
  
  getters: {
    currentDesktopWindows: (state) => {
      const currentDesktopId = 1 // 从 desktopStore 获取
      return state.windows.filter(window => window.desktopId === currentDesktopId)
    },
    
    hasMaximizedWindow: (state) => {
      return state.windows.some(window => window.maximized)
    }
  },
  
  actions: {
    // 创建窗口
    createWindow(appId, title, options = {}) {
      const newWindow = {
        id: `window-${Date.now()}`,
        appId,
        title,
        x: options.x || 100,
        y: options.y || 100,
        width: options.width || 800,
        height: options.height || 600,
        minimized: false,
        maximized: false,
        active: true,
        desktopId: options.desktopId || 1,
        containerId: `app-container-${Date.now()}`
      }
      
      // 激活新窗口
      this.windows.forEach(window => {
        window.active = false
      })
      
      this.windows.push(newWindow)
      this.activeWindowId = newWindow.id
      
      return newWindow
    },
    
    // 激活窗口
    activateWindow(windowId) {
      this.windows.forEach(window => {
        window.active = window.id === windowId
      })
      this.activeWindowId = windowId
    },
    
    // 最小化窗口
    minimizeWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        window.minimized = true
        window.active = false
        // 激活下一个窗口
        const nextActiveWindow = this.windows.find(w => w.id !== windowId && !w.minimized)
        if (nextActiveWindow) {
          this.activateWindow(nextActiveWindow.id)
        } else {
          this.activeWindowId = null
        }
      }
    }
  }
})
```

### 2.3 微前端配置

#### 2.3.1 micro-app 配置

**概述**：micro-app 配置负责子应用的注册、加载策略等。

**开发要点**：

- **子应用注册**：注册子应用的基本信息
- **生命周期管理**：管理子应用的生命周期
- **预加载策略**：配置子应用的预加载策略
- **懒加载策略**：配置子应用的懒加载策略
- **路由参数传递**：支持主应用向子应用传递路由参数

**示例代码**：

```javascript
import microApp from '@micro-zoe/micro-app'
import eventBus from './event-bus'

// 子应用配置列表 - 初始为空，通过服务端加载后动态注册
export const microApps = []

// micro-app 全局配置
const microAppConfig = {
  prefetch: true, // 开启预加载
  devtools: true, // 开启调试工具
  destroy: false, // 卸载时保留微应用的缓存
  esmodule: true, // 支持ES模块
  sandbox: {
    enable: true, // 开启沙箱
    strictStyleIsolation: true // 严格样式隔离
  },
  lifeCycles: {
    created: (appName) => {
      console.log('🔄 App created:', appName)
    },
    mounted: (appName) => {
      console.log('✅ After mounting app:', appName)
    },
    unmount: (appName) => {
      console.log('📤 Before unmounting app:', appName)
    },
    destroyed: (appName) => {
      console.log('🗑️ After unmounting app:', appName)
    }
  }
}

// 初始化 micro-app
export const initMicroApp = () => {
  try {
    console.log('🚀 Initializing micro-app...')
    // 配置 micro-app
    microApp.start(microAppConfig)
    console.log('✅ micro-app initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize micro-app:', error)
  }
}

// 加载子应用
export const loadMicroApp = (appConfig, containerId, cacheKey) => {
  try {
    // 处理字符串形式的appName
    let targetAppConfig = appConfig
    if (typeof appConfig === 'string') {
      const appName = appConfig
      targetAppConfig = microApps.find(app => app.name === appName)
      if (!targetAppConfig) {
        console.error('❌ App config not found for:', appName)
        return null
      }
    }
    
    // 为每个桌面创建独立的缓存，防止缓存污染
    const uniqueName = cacheKey || `${targetAppConfig.id || targetAppConfig.name}-${Date.now()}`
    
    // 检查容器是否存在
    const container = document.getElementById(containerId)
    if (!container) {
      console.error('❌ Container not found:', containerId)
      return null
    }
    
    // 创建 micro-app 元素
    const microAppElement = document.createElement('micro-app')
    microAppElement.setAttribute('name', uniqueName)
    microAppElement.setAttribute('url', targetAppConfig.fullUrl || targetAppConfig.entry)
    microAppElement.setAttribute('baseroute', targetAppConfig.fullPath || targetAppConfig.activeRule)
    microAppElement.setAttribute('esmodule', 'true')
    microAppElement.setAttribute('sandbox', 'true')
    if(targetAppConfig.iframe) {
      microAppElement.setAttribute('iframe', 'true')
    }
    
    // 设置 props
    const props = {
      ...targetAppConfig.props,
      msg: '来自主应用的消息',
      eventBus,
      routeInfo: {
        path: targetAppConfig.path,
        fullPath: targetAppConfig.fullPath,
        params: targetAppConfig.params || {},
        query: targetAppConfig.query || {}
      }
    }
    microAppElement.data = props
    
    // 添加到容器
    container.appendChild(microAppElement)
    
    return {
      instance: microAppElement,
      unmount: () => {
        if (container.contains(microAppElement)) {
          container.removeChild(microAppElement)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading micro app:', error)
    return null
  }
}
```

#### 2.3.2 事件总线

**概述**：事件总线负责主应用与子应用、子应用之间的通信。

**开发要点**：

- **事件注册**：支持事件的注册和监听
- **事件触发**：支持事件的触发和传递
- **事件移除**：支持事件的移除和清理
- **通信协议**：定义统一的通信协议

**示例代码**：

```javascript
class EventBus {
  constructor() {
    this.events = {}
  }
  
  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }
  
  // 触发事件
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  }
  
  // 移除事件监听
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
  
  // 监听事件一次
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

export default new EventBus()
```

### 2.4 应用管理服务

**概述**：应用管理服务负责管理应用配置、桌面应用和应用菜单。

**开发要点**：

- **配置加载**：从接口加载应用配置
- **应用注册**：注册应用到 micro-app
- **桌面管理**：管理桌面应用的添加和移除
- **菜单管理**：管理应用的多级菜单
- **路由构建**：构建子应用的完整路由

**示例代码**：

```javascript
import { microApps, registerMicroApp } from '../micro-app/micro-app-config'

class AppManagerService {
  constructor() {
    this.apps = []
    this.loaded = false
  }

  // 初始化子应用管理服务
  async initialize() {
    try {
      console.log('🚀 初始化子应用管理服务...')
      
      // 尝试从本地缓存加载配置
      let config = this.loadAppConfigFromCache()
      if (config) {
        this.apps = config
        this.loaded = true
        // 注册应用到microApps
        this.registerAppsToMicroApp(config)
        return config
      }

      // 从接口加载配置（模拟）
      config = await this.loadAppConfigFromApi()
      this.apps = config
      this.loaded = true
      
      // 缓存配置
      this.saveAppConfigToCache(config)
      // 注册应用到microApps
      this.registerAppsToMicroApp(config)
      return config
    } catch (error) {
      console.error('❌ 初始化子应用管理服务失败:', error)
      this.loaded = true
      return []
    }
  }

  // 注册应用到microApps
  registerAppsToMicroApp(appConfigs) {
    try {
      console.log('📝 开始注册应用到microApps...')
      
      // 先清空现有的注册信息，避免重复注册
      while (microApps.length > 0) {
        microApps.pop()
      }
      
      // 注册应用
      appConfigs.forEach(appConfig => {
        if (appConfig && appConfig.id) {
          const microAppConfig = {
            name: appConfig.id,
            entry: appConfig.entry || '',
            container: appConfig.container || '#app-container',
            activeRule: appConfig.activeRule || `/${appConfig.id}`,
            iframe: appConfig.iframe !== false,
            props: appConfig.props || {}
          }
          microApps.push(microAppConfig)
        }
      })
    } catch (error) {
      console.error('❌ 注册应用到microApps失败:', error)
    }
  }

  // 从接口加载配置（模拟）
  async loadAppConfigFromApi() {
    try {
      console.log('🌐 调用接口加载子应用配置...')
      // 实际项目中替换为真实的API地址
      const apiUrl = '/api/apps/config'
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const config = await response.json()
      return config
    } catch (error) {
      console.error('❌ 接口调用失败，使用模拟数据:', error)
      // 模拟从接口返回的配置
      return [
        {
          id: 'vue3-subapp',
          name: 'Vue 3 示例',
          icon: '/src/assets/icons/apps/vue.svg',
          entry: '//localhost:8081',
          container: '#app-container',
          activeRule: '/vue3',
          iframe: true,
          type: 'folder',
          children: [
            {
              id: 'vue3-dashboard',
              name: '仪表盘',
              icon: '/src/assets/icons/apps/vue.svg',
              type: 'app',
              path: '/',
              params: {},
              query: {}
            }
          ]
        }
      ]
    }
  }
}

export default new AppManagerService()
```

## 3. 子应用开发

### 3.1 子应用创建

#### 3.1.1 Vue 3 子应用

**创建步骤**：

1. **初始化项目**：使用 Vite 创建 Vue 3 项目
2. **安装依赖**：安装必要的依赖
3. **配置构建**：修改构建配置，支持微前端环境
4. **实现生命周期**：实现 micro-app 要求的生命周期钩子
5. **配置注册**：在主应用中注册子应用

**示例代码**：

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

**路由配置**：

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
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
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

#### 3.1.2 React 子应用

**创建步骤**：

1. **初始化项目**：使用 Create React App 创建项目
2. **安装依赖**：安装必要的依赖
3. **配置构建**：修改构建配置，支持微前端环境
4. **实现生命周期**：实现 micro-app 要求的生命周期钩子
5. **配置注册**：在主应用中注册子应用

**示例代码**：

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

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

**App 组件**：

```javascript
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import { Routes, Route } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 监听主应用传递的路由信息
    if (window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
      const { path, params, query } = window.__MICRO_APP_PROPS__.routeInfo
      if (path && path !== location.pathname) {
        let targetPath = path
        if (Object.keys(params).length > 0) {
          Object.entries(params).forEach(([key, value]) => {
            targetPath = targetPath.replace(`:${key}`, value)
          })
        }
        navigate({ pathname: targetPath, search: new URLSearchParams(query).toString() })
      }
    }
  }, [navigate, location.pathname])

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
```

#### 3.1.3 React UMIJS 子应用

**创建步骤**：

1. **初始化项目**：使用 UMIJS 创建 React 项目
2. **安装依赖**：安装必要的依赖
3. **配置构建**：修改构建配置，支持微前端环境
4. **实现生命周期**：实现 micro-app 要求的生命周期钩子
5. **配置注册**：在主应用中注册子应用

**示例代码**：

```javascript
// src/app.ts
import { plugin } from 'umi'

export function render(oldRender: Function) {
  // 监听微前端环境变量
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 从微前端框架获取路由信息
    window.__MICRO_APP_NAME__ = 'react-umijs'
    window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/react-umijs'
    
    // 注册微前端生命周期
    window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
      mount() {
        console.log('React UMIJS app mounted in micro frontend')
        oldRender()
      },
      unmount() {
        console.log('React UMIJS app unmounted from micro frontend')
        // UMIJS 会自动处理卸载
      }
    }
  } else {
    // 独立运行模式
    oldRender()
  }
}
```

**配置文件**：

```typescript
// .umirc.ts
export default {
  publicPath: '/',
  mfsu: false, // 禁用模块联邦，避免冲突
  routes: [
    {
      path: '/',
      component: '@/pages/index'
    },
    {
      path: '/about',
      component: '@/pages/about'
    }
  ]
}
```

#### 3.1.4 Angular 子应用

**创建步骤**：

1. **初始化项目**：使用 Angular CLI 创建项目
2. **安装依赖**：安装必要的依赖
3. **配置构建**：修改构建配置，支持微前端环境
4. **实现生命周期**：实现 micro-app 要求的生命周期钩子
5. **配置注册**：在主应用中注册子应用

**示例代码**：

```javascript
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'

let platform = null

// 监听微前端环境变量
if (window.__MICRO_APP_ENVIRONMENT__) {
  // 从微前端框架获取路由信息
  window.__MICRO_APP_NAME__ = 'angular'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/angular'
  
  // 注册微前端生命周期
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount() {
      console.log('Angular app mounted in micro frontend')
      platform = platformBrowserDynamic()
      return platform.bootstrapModule(AppModule)
    },
    unmount() {
      console.log('Angular app unmounted from micro frontend')
      if (platform) {
        platform.destroy()
        platform = null
      }
    }
  }
} else {
  // 独立运行模式
  platformBrowserDynamic().bootstrapModule(AppModule)
}
```

## 4. 最佳实践

### 4.1 代码规范

#### 4.1.1 JavaScript 规范

- **命名规范**：使用驼峰命名法
- **代码风格**：使用 ESLint 和 Prettier 保持代码风格一致
- **注释规范**：使用 JSDoc 注释
- **错误处理**：使用 try-catch 处理错误

#### 4.1.2 Vue 规范

- **组件命名**：使用 PascalCase 命名组件
- **模板规范**：使用清晰的模板结构
- **样式规范**：使用 scoped 样式
- **脚本规范**：使用 Composition API

#### 4.1.3 React 规范

- **组件命名**：使用 PascalCase 命名组件
- **Hook 规范**：使用 useState、useEffect 等 Hook
- **样式规范**：使用 CSS Modules 或 styled-components
- **代码分割**：使用动态导入分割代码

### 4.2 性能优化

#### 4.2.1 加载优化

- **代码分割**：使用动态导入分割代码
- **资源压缩**：压缩 CSS、JavaScript 和图片
- **缓存策略**：合理设置缓存策略
- **预加载**：预加载关键资源
- **子应用预加载**：根据使用频率预加载子应用

#### 4.2.2 运行时优化

- **内存管理**：避免内存泄漏
- **渲染优化**：使用虚拟列表和防抖节流
- **网络优化**：使用 HTTP/2 和 HTTP/3
- **计算优化**：使用 memoization 缓存计算结果
- **动画优化**：使用 requestAnimationFrame 优化动画

### 4.3 安全最佳实践

#### 4.3.1 子应用安全

- **沙箱隔离**：使用 micro-app 的沙箱机制
- **权限控制**：限制子应用的权限
- **输入验证**：验证所有输入
- **XSS 防护**：防止跨站脚本攻击

#### 4.3.2 网络安全

- **HTTPS**：使用 HTTPS 协议
- **CORS**：合理配置 CORS
- **CSRF**：防止跨站请求伪造
- **API 安全**：保护 API 接口

### 4.4 调试技巧

#### 4.4.1 开发调试

- **控制台调试**：使用 console.log 调试
- **断点调试**：使用浏览器断点调试
- **网络调试**：使用网络面板调试
- **性能调试**：使用性能面板调试

#### 4.4.2 子应用调试

- **独立运行**：先独立运行子应用调试
- **集成调试**：在主应用中调试子应用
- **日志调试**：使用统一的日志系统
- **错误监控**：使用错误监控工具

### 4.5 微前端最佳实践

- **技术栈无关**：子应用可以使用不同的技术栈
- **独立部署**：子应用可以独立构建和部署
- **样式隔离**：使用 micro-app 的严格样式隔离
- **路由传递**：主应用向子应用传递路由参数
- **生命周期管理**：正确实现子应用的生命周期钩子

## 5. 部署与发布

### 5.1 构建配置

#### 5.1.1 主应用构建

```bash
# 构建主应用
npm run build

# 构建结果
# dist/ 目录包含构建后的文件
```

#### 5.1.2 子应用构建

**Vue 3 子应用**：

```bash
npm run build
```

**React 子应用**：

```bash
npm run build
```

**React UMIJS 子应用**：

```bash
npm run build
```

**Angular 子应用**：

```bash
ng build
```

### 5.2 部署策略

#### 5.2.1 静态部署

- **主应用**：部署到主域名
- **子应用**：部署到子域名或路径
- **CDN 加速**：使用 CDN 加速静态资源

#### 5.2.2 容器部署

- **Docker**：使用 Docker 容器化部署
- **Kubernetes**：使用 Kubernetes 管理容器
- **CI/CD**：集成持续集成和持续部署

### 5.3 版本管理

#### 5.3.1 版本控制

- **语义化版本**：使用语义化版本管理
- **版本标签**：使用 Git 标签管理版本
- **版本记录**：维护详细的版本记录

#### 5.3.2 灰度发布

- **流量控制**：控制灰度发布的流量比例
- **回滚策略**：制定详细的回滚策略
- **监控告警**：监控灰度发布的状态

## 6. 常见问题

### 6.1 子应用加载问题

**问题**：子应用加载失败

**解决方案**：

- 检查子应用的入口地址是否正确
- 检查子应用的构建配置是否正确
- 检查子应用的生命周期钩子是否正确实现
- 检查网络连接是否正常

### 6.2 样式隔离问题

**问题**：子应用样式影响主应用

**解决方案**：

- 使用 micro-app 的严格样式隔离
- 子应用使用命名空间或 CSS Modules
- 避免使用全局样式

### 6.3 路由参数传递问题

**问题**：主应用传递的路由参数未被子应用接收

**解决方案**：

- 检查子应用是否正确监听 `window.__MICRO_APP_PROPS__`
- 检查子应用的路由配置是否正确处理参数
- 确保主应用传递的参数格式正确

### 6.4 性能问题

**问题**：子应用加载缓慢

**解决方案**：

- 优化子应用的代码分割
- 配置子应用的预加载策略
- 优化子应用的资源大小
- 使用懒加载减少初始加载时间

### 6.5 安全问题

**问题**：子应用存在安全漏洞

**解决方案**：

- 定期更新依赖包
- 使用安全扫描工具
- 限制子应用的权限
- 实现输入验证和输出编码

### 6.6 UMIJS 相关问题

**问题**：React UMIJS 子应用资源加载失败

**解决方案**：

- 在 `.umirc.ts` 中添加 `publicPath: '/'` 配置
- 禁用 mfsu 以避免模块联邦冲突

### 6.7 React Router 问题

**问题**：React 子应用路由无法匹配

**解决方案**：

- 配置 `BrowserRouter` 的 `basename` 属性
- 确保路由路径与主应用传递的路径一致

## 7. 总结

本开发指南详细介绍了项目的开发流程和最佳实践，包括项目初始化、主应用开发、子应用开发、最佳实践、部署与发布和常见问题等方面。通过本指南，开发者可以：

1. **快速上手**：了解项目的基本结构和开发流程
2. **规范开发**：遵循项目的代码规范和最佳实践
3. **解决问题**：快速解决开发中遇到的常见问题
4. **优化性能**：掌握项目的性能优化技巧
5. **确保安全**：了解项目的安全最佳实践
6. **微前端集成**：掌握子应用的接入和开发技巧

开发者在开发过程中，应遵循本指南的规范和建议，确保代码的质量和系统的稳定性。同时，应不断学习和探索新的技术和方法，持续优化系统的性能和用户体验。