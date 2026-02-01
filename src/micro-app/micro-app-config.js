import microApp from '@micro-zoe/micro-app'
import eventBus, { useMicroAppCommunication } from './event-bus'

// 应用使用频率缓存键
const APP_USAGE_STATS_KEY = 'appUsageStats'

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
  plugins: {
    modules: {
      // 全局插件
    }
  },
  lifeCycles: {
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
      
      // 记录应用使用频率
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
}

// 初始化 micro-app
export const initMicroApp = () => {
  try {
    console.log('🚀 Initializing micro-app...')
    // 配置 micro-app
    microApp.start(microAppConfig)
    
    // 预加载常用子应用
    preloadFrequentlyUsedApps()
    console.log('✅ micro-app initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize micro-app:', error)
  }
}

// 记录应用使用频率
const recordAppUsage = (appName) => {
  try {
    console.log('📊 Recording app usage:', appName)
    const usageStats = JSON.parse(localStorage.getItem(APP_USAGE_STATS_KEY) || '{}')
    usageStats[appName] = (usageStats[appName] || 0) + 1
    localStorage.setItem(APP_USAGE_STATS_KEY, JSON.stringify(usageStats))
    console.log('📈 Updated usage stats:', usageStats)
  } catch (error) {
    console.error('❌ Error recording app usage:', error)
  }
}

// 预加载常用子应用
const preloadFrequentlyUsedApps = () => {
  try {
    console.log('⚡ Preloading frequently used apps...')
    console.log('📋 Total registered apps:', microApps.length)
    console.log('🔍 Registered apps:', microApps.map(app => app.name))
    
    if (microApps.length === 0) {
      console.warn('⚠️ No apps registered yet, skipping preload')
      return
    }
    
    const usageStats = JSON.parse(localStorage.getItem(APP_USAGE_STATS_KEY) || '{}')
    console.log('📊 Usage stats:', usageStats)
    
    // 按使用频率排序，取前2个最常用的应用进行预加载
    const frequentlyUsedApps = Object.entries(usageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([appName]) => appName)
    
    console.log('🔥 Preloading apps:', frequentlyUsedApps)
    
    if (frequentlyUsedApps.length === 0) {
      console.log('ℹ️ No frequently used apps found, skipping preload')
      return
    }
    
    // 预加载子应用
    frequentlyUsedApps.forEach(appName => {
      const appConfig = microApps.find(app => app.name === appName)
      if (appConfig) {
        console.log('🚀 Prefetching app:', appName, 'from:', appConfig.entry)
        try {
          microApp.preFetch({ 
            name: appName, 
            url: appConfig.entry,
            baseroute: appConfig.activeRule
          })
          console.log('✅ Prefetch started for app:', appName)
        } catch (prefetchError) {
          console.error('❌ Error prefetching app:', appName, prefetchError)
        }
      } else {
        console.warn('⚠️ App not found for preload:', appName)
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
      console.log('⏳ Lazy loading app:', appName)
      // 从已注册的配置中查找应用
      const appConfig = microApps.find(app => app.name === appName)
      if (appConfig) {
        console.log('✅ App found:', appConfig)
        resolve(appConfig)
      } else {
        console.info('❌ App not found:', appName)
        console.info('🔍 Available apps:', microApps.map(app => app.name))
        console.info('📋 Total apps registered:', microApps.length)
        reject(new Error(`App ${appName} not found in registered apps`))
      }
    } catch (error) {
      console.error('❌ Error lazy loading app:', error)
      reject(error)
    }
  })
}

// 动态加载子应用（支持完整应用配置和路由参数）
export const loadMicroApp = (appConfig, containerId, cacheKey) => {
  try {
    // 处理字符串形式的appName
    let targetAppConfig = appConfig
    if (typeof appConfig === 'string') {
      const appName = appConfig
      console.log('📱 Loading micro app by name:', appName, 'into container:', containerId)
      targetAppConfig = microApps.find(app => app.name === appName)
      if (!targetAppConfig) {
        console.error('❌ App config not found for:', appName)
        console.error('🔍 Available apps:', microApps.map(app => app.name))
        return null
      }
    } else {
      console.log('📱 Loading micro app by config:', targetAppConfig.id || targetAppConfig.name, 'into container:', containerId)
    }
    
    // 为每个桌面创建独立的缓存，防止缓存污染
    const uniqueName = cacheKey || `${targetAppConfig.id || targetAppConfig.name}-${Date.now()}`
    console.log('🔑 Using unique name:', uniqueName)
    
    // 检查容器是否存在
    const container = document.getElementById(containerId)
    if (!container) {
      console.error('❌ Container not found:', containerId)
      return null
    }
    
    // 检查容器是否已有内容
    if (container.children.length > 0) {
      console.log('🔍 容器已有内容，使用现有微应用实例:', containerId)
      // 检查是否已有micro-app元素
      const existingMicroApp = container.querySelector('micro-app')
      if (existingMicroApp) {
        console.log('✅ 找到现有micro-app元素，复用实例')
        // 更新现有实例的属性（如果需要）
        if (targetAppConfig.fullUrl) {
          existingMicroApp.setAttribute('url', targetAppConfig.fullUrl)
        }
        return {
          instance: existingMicroApp,
          unmount: () => {
            console.log('🗑️ Unmounting app:', targetAppConfig.id || targetAppConfig.name, 'from container:', containerId)
            if (container.contains(existingMicroApp)) {
              container.removeChild(existingMicroApp)
              console.log('✅ App element removed from container')
            }
          }
        }
      }
    }
    
    // 容器为空，创建新的micro-app元素
    console.log('📦 容器为空，创建新的微应用实例:', containerId)
    
    // 创建 micro-app 元素
    const microAppElement = document.createElement('micro-app')
    microAppElement.setAttribute('name', uniqueName)
    
    // 使用完整URL或默认entry
    const appUrl = targetAppConfig.fullUrl || targetAppConfig.entry
    microAppElement.setAttribute('url', appUrl)
    console.log('🌐 App URL:', appUrl)
    
    // 设置基础路由
    const baseRoute = targetAppConfig.fullPath || targetAppConfig.activeRule
    if (baseRoute) {
      microAppElement.setAttribute('baseroute', baseRoute)
      console.log('🧭 Base route:', baseRoute)
    }
    
    microAppElement.setAttribute('esmodule', 'true') // 统一支持ES模块
    microAppElement.setAttribute('sandbox', 'true') // 开启沙箱
    if(targetAppConfig.iframe) {
      microAppElement.setAttribute('iframe', 'true') // 开启iframe模式
    }
    
    // 设置 props
    const props = {
      ...targetAppConfig.props,
      msg: '来自主应用的消息',
      eventBus,
      communication: useMicroAppCommunication(),
      cacheKey: uniqueName,
      containerId,
      timestamp: Date.now(), // 添加时间戳，确保每次加载都是新的
      // 传递路由信息
      routeInfo: {
        path: targetAppConfig.path,
        fullPath: targetAppConfig.fullPath,
        params: targetAppConfig.params || {},
        query: targetAppConfig.query || {}
      }
    }
    // 直接设置data属性，不是使用setAttribute
    microAppElement.data = props
    console.log('📋 Props set:', props)
    
    // 添加到容器
    container.appendChild(microAppElement)
    console.log('➕ App element added to container')
    
    return {
      instance: microAppElement,
      unmount: () => {
        console.log('🗑️ Unmounting app:', targetAppConfig.id || targetAppConfig.name, 'from container:', containerId)
        if (container.contains(microAppElement)) {
          container.removeChild(microAppElement)
          console.log('✅ App element removed from container')
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading micro app:', error)
  }
  return null
}

// 动态注册子应用
export const registerMicroApp = (appConfig) => {
  try {
    console.log('📝 Registering micro app:', appConfig?.name)
    if (appConfig && appConfig.name && appConfig.entry && appConfig.container) {
      // 检查是否已存在同名应用
      const existingApp = microApps.find(app => app.name === appConfig.name)
      if (!existingApp) {
        microApps.push(appConfig)
        console.log('✅ App registered successfully:', appConfig.name)
        return true
      } else {
        console.warn('⚠️ App already exists:', appConfig.name)
        return false
      }
    } else {
      console.error('❌ Invalid app config:', appConfig)
      return false
    }
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
    console.log('🗑️ Removing micro app:', appName)
    const index = microApps.findIndex(app => app.name === appName)
    if (index > -1) {
      microApps.splice(index, 1)
      console.log('✅ App removed successfully:', appName)
      return true
    } else {
      console.warn('⚠️ App not found for removal:', appName)
      return false
    }
  } catch (error) {
    console.error('❌ Error removing app:', error)
    return false
  }
}
