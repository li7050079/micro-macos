import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import './index.css'

// 扩展 Window 对象的类型定义（在 JavaScript 中不需要 declare global）
// 直接使用 Window 对象即可

// 应用实例
let rootInstance = null

// 路由信息处理组件
function RouteInfoHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    handleRouteInfo(navigate, location)
  }, [navigate, location])

  return null
}

// 处理路由信息
function handleRouteInfo(navigate, location) {
  if (window.__MICRO_APP_ENVIRONMENT__ && window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const routeInfo = window.__MICRO_APP_PROPS__.routeInfo
    console.log('Handling route info:', routeInfo)

    if (navigate && routeInfo.path && routeInfo.path !== location.pathname) {
      navigate(routeInfo.path, {
        state: {
          params: routeInfo.params || {},
          query: routeInfo.query || {}
        },
        replace: true
      })
    }
  }
}

// 启动应用
function bootstrapApp() {
  console.log('Bootstrapping React app')
  const root = ReactDOM.createRoot(document.getElementById('root'))
  
  // 修复basename配置，确保在独立运行时能正确匹配URL
  const basename = window.__MICRO_APP_BASE_ROUTE__ || '/'
  console.log('🔧 Router basename:', basename)
  console.log('🔧 Current URL:', window.location.href)
  
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <RouteInfoHandler />
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
  
  rootInstance = root
  console.log('✅ React app bootstraped successfully')
  return root
}

// 检查是否作为 micro-app 子应用运行
const isMicroApp = window.__MICRO_APP_ENVIRONMENT__

if (isMicroApp) {
  window.__MICRO_APP_NAME__ = 'react'
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/react'
  
  // 注册微前端生命周期
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount: () => {
      console.log('React app mounting as micro-app')
      return bootstrapApp()
    },
    unmount: () => {
      console.log('React app unmounting from micro-app')
      if (rootInstance) {
        rootInstance.unmount()
        rootInstance = null
        console.log('React app instance destroyed')
      }
    }
  }
  
  console.log('React micro-app lifecycle registered')
} else {
  // 独立运行模式
  console.log('React app running in standalone mode')
  bootstrapApp()
}
