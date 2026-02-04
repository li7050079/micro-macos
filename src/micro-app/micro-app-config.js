import microApp from '@micro-zoe/micro-app'
import eventBus, { useMicroAppCommunication } from './event-bus'

// 常量定义
const APP_USAGE_STATS_KEY = 'appUsageStats'
const MAX_PREFETCH_APPS = 2

// 子应用配置列表
export const microApps = []

// 全局配置
const DEFAULT_MICRO_APP_CONFIG = {
  prefetch: true,
  devtools: true,
  destroy: false,
  esmodule: true,
  sandbox: {
    enable: true,
    strictStyleIsolation: true
  },
  plugins: {
    modules: {}
  }
}

// 生命周期钩子
const lifeCycles = {
  created: (appName) => {
    console.log('🔄 App created:', appName)
    performance.mark(`created_${appName}`)
  },
  beforemount: (appName) => {
    console.log('📦 Before mounting app:', appName)
    performance.mark(`beforemount_${appName}`)
  },
  mounted: (appName) => {
    console.log('✅ After mounting app:', appName)
    performance.mark(`mounted_${appName}`)
    performance.measure(`loadTime_${appName}`, `created_${appName}`, `mounted_${appName}`)
    recordAppUsage(appName)
  },
  unmount: (appName) => {
    console.log('📤 Before unmounting app:', appName)
  },
  destroyed: (appName) => {
    console.log('🗑️ After unmounting app:', appName)
  },
  error: (appName, error) => {
    console.error('❌ Error in app:', appName, error)
  }
}

// 初始化 micro-app
export const initMicroApp = () => {
  try {
    console.log('🚀 Initializing micro-app...')
    
    const config = {
      ...DEFAULT_MICRO_APP_CONFIG,
      lifeCycles
    }
    
    microApp.start(config)
    preloadFrequentlyUsedApps()
    
    console.log('✅ micro-app initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize micro-app:', error)
  }
}

// 记录应用使用频率
const recordAppUsage = (appName) => {
  try {
    const usageStats = JSON.parse(localStorage.getItem(APP_USAGE_STATS_KEY) || '{}')
    usageStats[appName] = (usageStats[appName] || 0) + 1
    localStorage.setItem(APP_USAGE_STATS_KEY, JSON.stringify(usageStats))
  } catch (error) {
    console.error('❌ Error recording app usage:', error)
  }
}

// 预加载常用子应用
const preloadFrequentlyUsedApps = () => {
  try {
    if (microApps.length === 0) {
      console.warn('⚠️ No apps registered yet, skipping preload')
      return
    }
    
    const usageStats = JSON.parse(localStorage.getItem(APP_USAGE_STATS_KEY) || '{}')
    
    // 按使用频率排序，取前N个最常用的应用
    const frequentlyUsedApps = Object.entries(usageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_PREFETCH_APPS)
      .map(([appName]) => appName)
    
    if (frequentlyUsedApps.length === 0) {
      console.log('ℹ️ No frequently used apps found, skipping preload')
      return
    }
    
    // 预加载子应用
    frequentlyUsedApps.forEach(appName => {
      const appConfig = microApps.find(app => app.name === appName)
      if (appConfig) {
        try {
          microApp.preFetch({
            name: appName,
            url: appConfig.entry,
            baseroute: appConfig.activeRule
          })
        } catch (prefetchError) {
          console.error('❌ Error prefetching app:', appName, prefetchError)
        }
      }
    })
  } catch (error) {
    console.error('❌ Error preloading apps:', error)
  }
}

// 懒加载子应用
export const lazyLoadMicroApp = (appName) => {
  return new Promise((resolve, reject) => {
    try {
      const appConfig = microApps.find(app => app.name === appName)
      if (appConfig) {
        resolve(appConfig)
      } else {
        reject(new Error(`App ${appName} not found in registered apps`))
      }
    } catch (error) {
      console.error('❌ Error lazy loading app:', error)
      reject(error)
    }
  })
}

// 动态加载子应用
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
    
    // 生成唯一名称
    const uniqueName = cacheKey || `${targetAppConfig.id || targetAppConfig.name}-${Date.now()}`
    
    // 检查容器
    const container = document.getElementById(containerId)
    if (!container) {
      console.error('❌ Container not found:', containerId)
      return null
    }
    
    // 检查是否已有micro-app元素
    const existingMicroApp = container.querySelector('micro-app')
    if (existingMicroApp) {
      // 更新现有实例
      if (targetAppConfig.fullUrl) {
        existingMicroApp.setAttribute('url', targetAppConfig.fullUrl)
      }
      return {
        instance: existingMicroApp,
        unmount: () => {
          if (container.contains(existingMicroApp)) {
            container.removeChild(existingMicroApp)
          }
        }
      }
    }
    
    // 创建新的micro-app元素
    const microAppElement = document.createElement('micro-app')
    microAppElement.setAttribute('name', uniqueName)
    
    // 设置URL
    const appUrl = targetAppConfig.fullUrl || targetAppConfig.entry
    microAppElement.setAttribute('url', appUrl)
    
    // 设置基础路由
    const baseRoute = targetAppConfig.fullPath || targetAppConfig.activeRule
    if (baseRoute) {
      microAppElement.setAttribute('baseroute', baseRoute)
    }
    
    // 设置属性
    microAppElement.setAttribute('esmodule', 'true')
    microAppElement.setAttribute('sandbox', 'true')
    
    if (targetAppConfig.iframe) {
      microAppElement.setAttribute('iframe', 'true')
    }
    
    // 设置props
    const props = {
      ...targetAppConfig.props,
      msg: '来自主应用的消息',
      eventBus,
      communication: useMicroAppCommunication(),
      cacheKey: uniqueName,
      containerId,
      timestamp: Date.now(),
      routeInfo: {
        path: targetAppConfig.path,
        fullPath: targetAppConfig.fullPath,
        params: targetAppConfig.params || {},
        query: targetAppConfig.query || {}
      }
    }
    
    microAppElement.data = props
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

// 动态注册子应用
export const registerMicroApp = (appConfig) => {
  try {
    if (!appConfig || !appConfig.name || !appConfig.entry || !appConfig.container) {
      console.error('❌ Invalid app config:', appConfig)
      return false
    }
    
    // 检查是否已存在
    const existingApp = microApps.find(app => app.name === appConfig.name)
    if (existingApp) {
      console.warn('⚠️ App already exists:', appConfig.name)
      return false
    }
    
    microApps.push(appConfig)
    console.log('✅ App registered successfully:', appConfig.name)
    return true
  } catch (error) {
    console.error('❌ Error registering app:', error)
    return false
  }
}

// 获取子应用配置
export const getMicroAppConfig = (appName) => {
  return microApps.find(app => app.name === appName)
}

// 获取所有子应用
export const getAllMicroApps = () => {
  return [...microApps]
}

// 移除子应用
export const removeMicroApp = (appName) => {
  try {
    const index = microApps.findIndex(app => app.name === appName)
    if (index === -1) {
      console.warn('⚠️ App not found for removal:', appName)
      return false
    }
    
    microApps.splice(index, 1)
    console.log('✅ App removed successfully:', appName)
    return true
  } catch (error) {
    console.error('❌ Error removing app:', error)
    return false
  }
}

// 批量注册子应用
export const registerMicroApps = (appConfigs) => {
  try {
    const results = appConfigs.map(config => registerMicroApp(config))
    const successCount = results.filter(r => r).length
    console.log(`✅ Registered ${successCount} out of ${appConfigs.length} apps`)
    return successCount
  } catch (error) {
    console.error('❌ Error registering multiple apps:', error)
    return 0
  }
}

// 清空所有子应用
export const clearMicroApps = () => {
  try {
    microApps.length = 0
    console.log('✅ Cleared all micro apps')
    return true
  } catch (error) {
    console.error('❌ Error clearing micro apps:', error)
    return false
  }
}
