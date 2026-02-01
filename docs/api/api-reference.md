# API 参考文档

## 1. 主应用 API

### 1.1 状态管理 API

#### 1.1.1 configStore

**概述**：管理系统配置，包括主题、桌面、Dock 等设置。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `initialize()` | 无 | 无 | 初始化配置 |
| `setTheme(mode)` | mode: string - 主题模式 | 无 | 设置主题模式 |
| `setDesktopBackground(background, updateDesktopStore)` | background: string - 背景值<br>updateDesktopStore: boolean - 是否更新桌面状态 | 无 | 设置桌面背景 |
| `setDesktopIconSettings(settings)` | settings: object - 图标设置 | 无 | 设置桌面图标 |
| `setDockConfig(config)` | config: object - Dock 配置 | 无 | 设置 Dock 配置 |
| `setShortcut(key, value)` | key: string - 快捷键名<br>value: string - 快捷键值 | 无 | 设置快捷键 |
| `toggleFeature(feature)` | feature: string - 功能名 | 无 | 切换功能状态 |

**状态属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `theme` | object | 主题配置 |
| `desktop` | object | 桌面配置 |
| `dock` | object | Dock 配置 |
| `shortcuts` | object | 快捷键配置 |
| `system` | object | 系统配置 |
| `features` | object | 功能开关 |

#### 1.1.2 windowStore

**概述**：管理窗口状态，包括窗口的创建、激活、最小化、最大化等操作。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `createWindow(appId, title, options)` | appId: string - 应用 ID<br>title: string - 窗口标题<br>options: object - 窗口选项 | object - 新窗口对象 | 创建新窗口 |
| `activateWindow(windowId)` | windowId: string - 窗口 ID | 无 | 激活窗口 |
| `minimizeWindow(windowId)` | windowId: string - 窗口 ID | 无 | 最小化窗口 |
| `maximizeWindow(windowId)` | windowId: string - 窗口 ID | 无 | 最大化窗口 |
| `closeWindow(windowId)` | windowId: string - 窗口 ID | 无 | 关闭窗口 |
| `moveWindow(windowId, x, y)` | windowId: string - 窗口 ID<br>x: number - 横坐标<br>y: number - 纵坐标 | 无 | 移动窗口 |
| `resizeWindow(windowId, width, height)` | windowId: string - 窗口 ID<br>width: number - 宽度<br>height: number - 高度 | 无 | 调整窗口大小 |
| `isWindowOpen(appId)` | appId: string - 应用 ID | boolean - 是否打开 | 检查窗口是否打开 |

**状态属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `windows` | array | 窗口列表 |
| `activeWindowId` | string | 当前激活窗口 ID |

**计算属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `currentDesktopWindows` | array | 当前桌面的窗口列表 |
| `hasMaximizedWindow` | boolean | 是否有最大化窗口 |

#### 1.1.3 desktopStore

**概述**：管理桌面状态，包括多桌面、文件系统、通知中心等。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `initializeAppConfig()` | 无 | Promise<void> | 初始化应用配置 |
| `changeDesktopBackground()` | 无 | 无 | 更换桌面背景 |
| `setDesktopBackground(background, updateConfigStore)` | background: string - 背景值<br>updateConfigStore: boolean - 是否更新配置 | 无 | 设置桌面背景 |
| `toggleSystemMenu()` | 无 | 无 | 切换系统菜单 |
| `showDesktopMenu(x, y)` | x: number - 横坐标<br>y: number - 纵坐标 | 无 | 显示桌面右键菜单 |
| `closeDesktopMenu()` | 无 | 无 | 关闭桌面右键菜单 |
| `closeAllContextMenus()` | 无 | 无 | 关闭所有右键菜单 |
| `reorderDesktopApps(fromIndex, toIndex)` | fromIndex: number - 原索引<br>toIndex: number - 目标索引 | 无 | 重新排序桌面应用 |
| `startDrag()` | 无 | 无 | 开始拖拽 |
| `endDrag()` | 无 | 无 | 结束拖拽 |
| `setDraggedIconIndex(index)` | index: number - 图标索引 | 无 | 设置拖拽图标索引 |
| `startLongPress()` | 无 | 无 | 开始长按 |
| `updateTime()` | 无 | 无 | 更新时间 |
| `addNotification(notification)` | notification: object - 通知对象 | 无 | 添加通知 |
| `markNotificationAsRead(notificationId)` | notificationId: number - 通知 ID | 无 | 标记通知为已读 |
| `clearAllNotifications()` | 无 | 无 | 清除所有通知 |
| `toggleNotificationCenter()` | 无 | 无 | 切换通知中心 |
| `updateSystemTrayItem(id, status)` | id: string - 托盘项 ID<br>status: string - 状态值 | 无 | 更新系统托盘项 |
| `switchDesktop(desktopId)` | desktopId: number - 桌面 ID | 无 | 切换桌面 |
| `addDesktop(name)` | name: string - 桌面名称 | object - 新桌面对象 | 添加桌面 |
| `removeDesktop(desktopId)` | desktopId: number - 桌面 ID | 无 | 移除桌面 |
| `renameDesktop(desktopId, name)` | desktopId: number - 桌面 ID<br>name: string - 新名称 | 无 | 重命名桌面 |
| `toggleFileSystem()` | 无 | 无 | 切换文件系统 |
| `toggleDesktopSwitcher()` | 无 | 无 | 切换桌面切换器 |
| `showAppContextMenu(event, app, isDesktop)` | event: Event - 事件对象<br>app: object - 应用对象<br>isDesktop: boolean - 是否桌面应用 | 无 | 显示应用右键菜单 |

**状态属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `desktopBackground` | string | 桌面背景 |
| `backgroundOptions` | array | 背景选项 |
| `desktopApps` | array | 桌面应用列表 |
| `dockApps` | array | Dock 应用列表 |
| `startMenuApps` | array | 开始菜单应用列表 |
| `showSystemMenu` | boolean | 系统菜单显示状态 |
| `showDesktopMenuVisible` | boolean | 桌面右键菜单显示状态 |
| `showFileContextMenuVisible` | boolean | 文件右键菜单显示状态 |
| `showAppContextMenuVisible` | boolean | 应用右键菜单显示状态 |
| `menuX` | number | 菜单横坐标 |
| `menuY` | number | 菜单纵坐标 |
| `contextMenuX` | number | 文件菜单位置 |
| `contextMenuY` | number | 文件菜单位置 |
| `appContextMenuX` | number | 应用菜单位置 |
| `appContextMenuY` | number | 应用菜单位置 |
| `currentTime` | string | 当前时间 |
| `notifications` | array | 通知列表 |
| `showNotificationCenter` | boolean | 通知中心显示状态 |
| `systemTray` | array | 系统托盘 |
| `desktops` | array | 桌面列表 |
| `currentDesktopId` | number | 当前桌面 ID |
| `fileSystem` | object | 文件系统 |
| `showFileSystem` | boolean | 文件系统显示状态 |
| `showDesktopSwitcher` | boolean | 桌面切换器显示状态 |
| `draggedIconIndex` | number | 拖拽图标索引 |
| `isLongPressing` | boolean | 是否长按 |
| `isDragging` | boolean | 是否拖拽中 |
| `selectedFile` | object | 选中的文件 |
| `selectedApp` | object | 选中的应用 |
| `isDesktopApp` | boolean | 是否桌面应用 |

**计算属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `desktopAppCount` | number | 桌面应用数量 |
| `dockAppCount` | number | Dock 应用数量 |
| `currentDesktop` | object | 当前桌面 |
| `unreadNotificationCount` | number | 未读通知数量 |

#### 1.1.4 microAppStore

**概述**：管理子应用状态，包括子应用的加载、卸载、通信等。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `initialize()` | 无 | 无 | 初始化子应用状态 |
| `loadMicroApp(appId, containerId, cacheKey)` | appId: string - 应用 ID<br>containerId: string - 容器 ID<br>cacheKey: string - 缓存键 | boolean - 是否加载成功 | 加载子应用 |
| `unmountMicroApp(containerId)` | containerId: string - 容器 ID | 无 | 卸载子应用 |
| `getAppInstancesByName(appName)` | appName: string - 应用名称 | array - 应用实例列表 | 获取应用实例 |
| `clearAllMicroApps()` | 无 | 无 | 清除所有子应用 |

**状态属性**：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `loadedApps` | object | 已加载的子应用 |
| `appCache` | object | 应用缓存 |

### 1.2 微前端 API

#### 1.2.1 micro-app 配置

**概述**：基于 micro-app 框架的微前端配置，管理子应用的注册、加载策略等。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `initMicroApp()` | 无 | 无 | 初始化 micro-app |
| `loadMicroApp(appConfig, containerId, cacheKey)` | appConfig: object/string - 应用配置或应用名<br>containerId: string - 容器 ID<br>cacheKey: string - 缓存键 | object - 应用实例 | 加载子应用 |
| `lazyLoadMicroApp(appName)` | appName: string - 应用名称 | Promise - 加载结果 | 懒加载子应用 |
| `registerMicroApp(appConfig)` | appConfig: object - 应用配置 | boolean - 是否注册成功 | 注册子应用 |
| `removeMicroApp(appName)` | appName: string - 应用名称 | boolean - 是否移除成功 | 移除子应用 |
| `getMicroAppConfig(appName)` | appName: string - 应用名称 | object - 应用配置 | 获取子应用配置 |
| `getAllMicroApps()` | 无 | array - 子应用列表 | 获取所有子应用 |

**子应用配置**：

| 配置项 | 类型 | 描述 |
|--------|------|------|
| `id` | string | 应用唯一标识 |
| `name` | string | 应用名称 |
| `entry` | string | 应用入口地址 |
| `container` | string | 应用容器选择器 |
| `activeRule` | string | 激活规则（路由前缀） |
| `iframe` | boolean | 是否使用 iframe 模式 |
| `type` | string | 应用类型 |
| `children` | array | 子菜单列表 |
| `path` | string | 业务菜单路径 |
| `params` | object | 路径参数 |
| `query` | object | 查询参数 |
| `fullUrl` | string | 完整 URL |
| `fullPath` | string | 完整路径 |

#### 1.2.2 事件总线

**概述**：实现主应用与子应用、子应用之间的通信。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `on(event, callback)` | event: string - 事件名<br>callback: function - 回调函数 | 无 | 监听事件 |
| `off(event, callback)` | event: string - 事件名<br>callback: function - 回调函数 | 无 | 移除事件监听 |
| `emit(event, ...args)` | event: string - 事件名<br>...args: any - 事件参数 | 无 | 触发事件 |
| `once(event, callback)` | event: string - 事件名<br>callback: function - 回调函数 | 无 | 监听事件一次 |

**常用事件**：

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `app:loaded` | 子应用加载完成 | appId: string |
| `app:unmounted` | 子应用卸载完成 | appId: string |
| `window:created` | 窗口创建完成 | window: object |
| `window:closed` | 窗口关闭完成 | windowId: string |
| `desktop:switched` | 桌面切换完成 | desktopId: number |
| `theme:changed` | 主题切换完成 | theme: object |

### 1.3 应用管理 API

#### 1.3.1 AppManagerService

**概述**：管理应用配置、桌面应用和应用菜单。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `initialize()` | 无 | Promise<array> | 初始化应用管理服务 |
| `registerAppsToMicroApp(appConfigs)` | appConfigs: array - 应用配置列表 | 无 | 注册应用到 micro-app |
| `loadAppConfigFromApi()` | 无 | Promise<array> | 从接口加载应用配置 |
| `loadAppConfigFromCache()` | 无 | object - 应用配置 | 从缓存加载应用配置 |
| `saveAppConfigToCache(config)` | config: object - 应用配置 | 无 | 保存应用配置到缓存 |
| `loadUserDesktopConfig()` | 无 | object - 用户桌面配置 | 加载用户桌面配置 |
| `saveUserDesktopConfig(config)` | config: object - 用户桌面配置 | 无 | 保存用户桌面配置 |
| `getAllAppsFlattened()` | 无 | array - 扁平化应用列表 | 获取所有应用（扁平化） |
| `getStartMenuApps()` | 无 | array - 开始菜单应用 | 获取开始菜单应用 |
| `getDesktopApps()` | 无 | array - 桌面应用列表 | 获取桌面应用 |
| `getDefaultDesktopApps()` | 无 | array - 默认桌面应用 | 获取默认桌面应用 |
| `addAppToDesktop(app)` | app: object - 应用对象 | boolean - 是否添加成功 | 添加应用到桌面 |
| `removeAppFromDesktop(appId)` | appId: string - 应用 ID | boolean - 是否移除成功 | 从桌面移除应用 |
| `isLeafApp(app)` | app: object - 应用对象 | boolean - 是否叶子应用 | 检查应用是否为叶子节点 |
| `openApp(app)` | app: object - 应用对象 | object - 应用配置 | 打开应用 |
| `buildFullAppConfig(app)` | app: object - 应用对象 | object - 完整应用配置 | 构建完整应用配置 |
| `findParentAppConfig(appId)` | appId: string - 应用 ID | object - 父级应用配置 | 查找应用的父级配置 |
| `buildFullPath(app, parentConfig)` | app: object - 应用对象<br>parentConfig: object - 父级配置 | string - 完整路径 | 构建完整路径 |
| `buildFullUrl(app, parentConfig)` | app: object - 应用对象<br>parentConfig: object - 父级配置 | string - 完整 URL | 构建完整 URL |
| `buildQueryParams(query)` | query: object - 查询参数 | string - 查询参数字符串 | 构建查询参数字符串 |
| `registerNewApp(appConfig)` | appConfig: object - 应用配置 | boolean - 是否注册成功 | 注册新应用 |
| `refreshAppConfig()` | 无 | Promise<array> | 刷新应用配置 |

## 2. 子应用 API

### 2.1 生命周期 API

#### 2.1.1 micro-app 生命周期

**概述**：子应用必须实现的 micro-app 生命周期钩子。

**主要钩子**：

| 钩子名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `mount()` | 无 | 无 | 挂载子应用 |
| `unmount()` | 无 | 无 | 卸载子应用 |

**使用示例**：

```javascript
// Vue 3 子应用
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.__MICRO_APP_NAME__ = 'vue3-subapp'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/vue3'
  
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
}
```

```javascript
// React 子应用
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.__MICRO_APP_NAME__ = 'react'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/react'
  
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
}
```

### 2.2 通信 API

#### 2.2.1 事件总线

**概述**：子应用通过事件总线与主应用和其他子应用通信。

**使用方法**：

```javascript
// 从主应用传递的 props 中获取 eventBus
if (window.__MICRO_APP_PROPS__) {
  const { eventBus } = window.__MICRO_APP_PROPS__
  
  // 监听事件
  eventBus.on('event-name', (data) => {
    console.log('Received data:', data)
  })
  
  // 触发事件
  eventBus.emit('event-name', { key: 'value' })
}
```

#### 2.2.2 路由参数传递

**概述**：主应用通过 props 向子应用传递路由参数，实现直接访问子应用业务功能。

**使用方法**：

```javascript
// Vue 3 子应用
if (window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
  const { path, params, query } = window.__MICRO_APP_PROPS__.routeInfo
  if (path && path !== to.path) {
    router.push({ path, params, query })
  }
}

// React 子应用
useEffect(() => {
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
```

### 2.3 工具 API

#### 2.3.1 主应用工具

**概述**：主应用提供给子应用的工具函数。

**主要工具**：

| 工具名 | 描述 | 参数 | 返回值 |
|--------|------|------|--------|
| `eventBus` | 事件总线 | 无 | object - 事件总线实例 |
| `communication` | 通信工具 | 无 | object - 通信工具实例 |

## 3. 前端 API

### 3.1 DOM API

**概述**：操作 DOM 元素的 API。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `querySelector(selector)` | selector: string - 选择器 | Element - 元素 | 选择元素 |
| `querySelectorAll(selector)` | selector: string - 选择器 | NodeList - 元素列表 | 选择多个元素 |
| `createElement(tagName)` | tagName: string - 标签名 | Element - 元素 | 创建元素 |
| `appendChild(element)` | element: Element - 元素 | Element - 元素 | 添加子元素 |
| `removeChild(element)` | element: Element - 元素 | Element - 元素 | 移除子元素 |
| `addEventListener(event, listener)` | event: string - 事件名<br>listener: function - 监听器 | 无 | 添加事件监听器 |
| `removeEventListener(event, listener)` | event: string - 事件名<br>listener: function - 监听器 | 无 | 移除事件监听器 |

### 3.2 浏览器 API

**概述**：浏览器提供的 API。

**主要 API**：

| API 名 | 描述 | 使用示例 |
|--------|------|----------|
| `localStorage` | 本地存储 | `localStorage.setItem('key', 'value')` |
| `sessionStorage` | 会话存储 | `sessionStorage.getItem('key')` |
| `fetch` | 网络请求 | `fetch('/api/data')` |
| `navigator` | 浏览器信息 | `navigator.userAgent` |
| `window` | 窗口对象 | `window.innerWidth` |
| `document` | 文档对象 | `document.title` |
| `performance` | 性能监控 | `performance.now()` |
| `requestAnimationFrame` | 动画帧 | `requestAnimationFrame(callback)` |

## 4. 配置 API

### 4.1 环境变量

**概述**：系统环境变量配置。

**主要变量**：

| 变量名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| `NODE_ENV` | string | 环境模式 | 'development' |
| `BASE_URL` | string | 基础 URL | '/' |
| `VITE_APP_TITLE` | string | 应用标题 | 'macOS Style Desktop' |
| `VITE_APP_API_URL` | string | API 基础 URL | '/api' |

### 4.2 构建配置

**概述**：系统构建配置。

**主要配置**：

| 配置项 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| `publicPath` | string | 公共路径 | '/' |
| `outputDir` | string | 输出目录 | 'dist' |
| `assetsDir` | string | 资源目录 | 'static' |
| `indexPath` | string | 索引路径 | 'index.html' |
| `filenameHashing` | boolean | 文件名哈希 | true |
| `lintOnSave` | boolean | 保存时 lint | true |
| `productionSourceMap` | boolean | 生产环境源码映射 | false |
| `devServer` | object | 开发服务器配置 | - |

## 5. 错误处理 API

### 5.1 全局错误处理

**概述**：系统全局错误处理机制。

**使用方法**：

```javascript
// 监听全局错误
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', message, source, lineno, colno, error);
  return true;
};

// 监听未捕获的 Promise 错误
window.onunhandledrejection = (event) => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault();
};
```

### 5.2 子应用错误处理

**概述**：子应用错误处理机制。

**使用方法**：

```javascript
// 子应用错误处理
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount() {
      try {
        // 挂载代码
      } catch (error) {
        console.error('Mount error:', error);
        // 错误处理逻辑
      }
    },
    unmount() {
      try {
        // 卸载代码
      } catch (error) {
        console.error('Unmount error:', error);
        // 错误处理逻辑
      }
    }
  };
}
```

## 6. 性能 API

### 6.1 性能监控

**概述**：系统性能监控 API。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `performance.now()` | 无 | number - 时间戳 | 获取当前时间戳 |
| `performance.mark(name)` | name: string - 标记名 | 无 | 添加性能标记 |
| `performance.measure(name, startMark, endMark)` | name: string - 测量名<br>startMark: string - 开始标记<br>endMark: string - 结束标记 | 无 | 测量性能 |
| `performance.getEntries()` | 无 | array - 性能条目 | 获取性能条目 |
| `performance.getEntriesByName(name)` | name: string - 名称 | array - 性能条目 | 获取指定名称的性能条目 |
| `performance.getEntriesByType(type)` | type: string - 类型 | array - 性能条目 | 获取指定类型的性能条目 |

### 6.2 内存监控

**概述**：系统内存监控 API。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `performance.memory` | 无 | object - 内存信息 | 获取内存信息 |
| `navigator.deviceMemory` | 无 | number - 设备内存 | 获取设备内存 |
| `window.performance.memory` | 无 | object - 内存信息 | 获取内存信息 |

### 6.3 网络监控

**概述**：系统网络监控 API。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `navigator.connection` | 无 | object - 网络连接 | 获取网络连接信息 |
| `navigator.onLine` | 无 | boolean - 在线状态 | 获取在线状态 |
| `window.addEventListener('online', callback)` | callback: function - 回调函数 | 无 | 监听在线事件 |
| `window.addEventListener('offline', callback)` | callback: function - 回调函数 | 无 | 监听离线事件 |

## 7. 安全 API

### 7.1 沙箱 API

**概述**：基于 micro-app 的沙箱隔离 API。

**主要配置**：

| 配置项 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| `sandbox` | boolean | 开启沙箱 | true |
| `strictStyleIsolation` | boolean | 严格样式隔离 | true |
| `esmodule` | boolean | 支持 ES 模块 | true |

### 7.2 权限 API

**概述**：子应用权限控制 API。

**主要方法**：

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `checkPermission(permission)` | permission: string - 权限名 | boolean - 是否有权限 | 检查权限 |
| `requestPermission(permission)` | permission: string - 权限名 | Promise<boolean> - 请求结果 | 请求权限 |
| `revokePermission(permission)` | permission: string - 权限名 | boolean - 是否成功 | 撤销权限 |

## 8. 总结

本 API 参考文档详细描述了系统的 API 接口和使用方法，包括主应用 API、子应用 API、前端 API、配置 API、错误处理 API、性能 API 和安全 API 等方面。通过这些 API，开发者可以：

1. **构建子应用**：按照 API 规范构建符合系统要求的子应用，支持 Vue 3、React、Angular 等多框架
2. **扩展功能**：使用主应用 API 扩展系统功能，如窗口管理、桌面管理等
3. **实现微前端集成**：通过 micro-app 相关 API 实现子应用的注册、加载和通信
4. **优化性能**：使用性能 API 监控和优化系统性能
5. **确保安全**：使用沙箱 API 确保子应用的安全隔离
6. **提高开发效率**：使用工具 API 和事件总线提高开发效率

开发者在使用 API 时，应遵循 API 文档的规范，确保代码的正确性和兼容性。同时，应注意 API 的版本变化，及时更新代码以适应新的 API 规范。