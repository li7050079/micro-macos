import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 纯JavaScript方式，不需要类型声明

// 应用实例
let appInstance = null

// 启动应用
function bootstrapApp() {
  console.log('Bootstrapping Vue 3 app')
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
  appInstance = app
  
  // 处理路由信息
  handleRouteInfo()
  
  console.log('Vue 3 app bootstraped successfully')
  return app
}

// 处理路由信息
function handleRouteInfo() {
  if (window.__MICRO_APP_ENVIRONMENT__ && window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const routeInfo = window.__MICRO_APP_PROPS__.routeInfo
    console.log('Handling route info:', routeInfo)
    
    if (router && routeInfo.path) {
      router.push({
        path: routeInfo.path,
        params: routeInfo.params || {},
        query: routeInfo.query || {}
      }).then(() => {
        console.log('Navigation to', routeInfo.path, 'successful')
      }).catch(err => {
        console.error('Navigation error:', err)
      })
    }
  }
}

// 检查是否作为 micro-app 子应用运行
const isMicroApp = window.__MICRO_APP_ENVIRONMENT__

if (isMicroApp) {
  // 不硬编码应用名称，使用主应用传递的值
  // window.__MICRO_APP_NAME__ 会由主应用自动设置
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/vue3'
  
  // 注册微前端生命周期，使用主应用传递的应用名称
  const appName = window.__MICRO_APP_NAME__ || 'vue3'
  window[`micro-app-${appName}`] = {
    mount: () => {
      console.log('Vue 3 app mounting as micro-app:', appName)
      return bootstrapApp()
    },
    unmount: () => {
      console.log('Vue 3 app unmounting from micro-app:', appName)
      if (appInstance) {
        appInstance.unmount()
        appInstance = null
        console.log('Vue 3 app instance destroyed')
      }
    }
  }
  
  console.log('Vue 3 micro-app lifecycle registered with name:', appName)
} else {
  // 独立运行模式
  console.log('Vue 3 app running in standalone mode')
  bootstrapApp()
}
