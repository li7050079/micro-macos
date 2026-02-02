import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { NgModuleRef } from '@angular/core'
import { Router } from '@angular/router'

// 扩展 Window 接口，添加 micro-app 相关属性
declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_APP_NAME__?: string
    __MICRO_APP_PROPS__?: any
    __MICRO_APP_BASE_ROUTE__?: string
    [key: string]: any
  }
}

// 检查是否作为 micro-app 子应用运行
const isMicroApp = window.__MICRO_APP_ENVIRONMENT__

// 应用实例
let appModuleRef: NgModuleRef<AppModule>

// 启动应用
function bootstrapApp() {
  return platformBrowserDynamic().bootstrapModule(AppModule)
    .then((moduleRef: NgModuleRef<AppModule>) => {
      appModuleRef = moduleRef
      console.log('Angular app bootstraped successfully')
      
      // 处理路由信息
      handleRouteInfo()
      
      return moduleRef
    })
    .catch(err => {
      console.error('Error bootstraping Angular app:', err)
      throw err
    })
}

// 处理路由信息
function handleRouteInfo() {
  if (isMicroApp && window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const routeInfo = window.__MICRO_APP_PROPS__.routeInfo
    console.log('Handling route info:', routeInfo)
    
    // 获取路由服务并导航
    const router = appModuleRef.injector.get(Router)
    if (router && routeInfo.path) {
      router.navigateByUrl(routeInfo.path, {
        state: {
          params: routeInfo.params || {},
          query: routeInfo.query || {}
        }
      }).then(() => {
        console.log('Navigation to', routeInfo.path, 'successful')
      }).catch(err => {
        console.error('Navigation error:', err)
      })
    }
  }
}

// 注册微前端生命周期
if (isMicroApp) {
  // 不硬编码应用名称，使用主应用传递的值
  const appName = window.__MICRO_APP_NAME__ || 'angular'
  // 当在iframe模式下运行时，不设置__MICRO_APP_BASE_ROUTE__为'/angular'，因为iframe的URL是直接指向子应用的入口地址
  const isIframe = window.self !== window.top
  window.__MICRO_APP_BASE_ROUTE__ = isIframe ? '/' : (window.__MICRO_APP_BASE_ROUTE__ || '/angular')
  
  console.log('🔧 注册Angular微前端生命周期钩子')
  console.log('🔧 App name:', appName)
  console.log('🔧 __MICRO_APP_BASE_ROUTE__:', window.__MICRO_APP_BASE_ROUTE__)
  console.log('🔧 __MICRO_APP_PROPS__:', window.__MICRO_APP_PROPS__)
  console.log('🔧 Is iframe:', isIframe)
  
  // 注册生命周期钩子
  window[`micro-app-${appName}`] = {
    mount: () => {
      console.log('🚀 Angular app mounting as micro-app:', appName)
      return bootstrapApp()
    },
    unmount: () => {
      console.log('📤 Angular app unmounting from micro-app:', appName)
      if (appModuleRef) {
        // 销毁应用实例
        appModuleRef.destroy()
        console.log('✅ Angular app instance destroyed')
      }
    },
    update: (props: any) => {
      console.log('🔄 Angular app updating with props:', props)
      // 处理更新逻辑
    }
  }
  
  console.log('✅ Angular micro-app lifecycle registered successfully')
  console.log('🔍 注册的钩子:', window[`micro-app-${appName}`])
} else {
  // 独立运行模式
  console.log('🌍 Angular app running in standalone mode')
  bootstrapApp()
}
