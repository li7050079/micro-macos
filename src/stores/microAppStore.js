import { defineStore } from 'pinia'
import { loadMicroApp, microApps, lazyLoadMicroApp } from '../micro-app/micro-app-config'

export const useMicroAppStore = defineStore('microApp', {
  state: () => ({
    // 使用导入的 microApps 配置，避免重复定义
    microApps,
    // 存储子应用实例，key 为容器 ID
    microAppInstances: new Map(),
    // 初始化状态
    isInitialized: false,
    // 应用使用频率统计
    appUsageStats: {},
    // 内存监控数据
    memoryStats: {},
    // 性能监控数据
    performanceStats: {}
  }),
  
  getters: {
    // 获取子应用总数
    appCount: (state) => state.microApps.length,
    // 获取运行中的子应用数量
    runningAppCount: (state) => state.microAppInstances.size,
    // 获取最常用的应用
    mostUsedApps: (state) => {
      return Object.entries(state.appUsageStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([appName, count]) => ({ appName, count }))
    },
    // 获取内存使用情况
    memoryUsage: (state) => {
      return Object.entries(state.memoryStats).map(([appName, stats]) => ({
        appName,
        memory: stats.memory,
        timestamp: stats.timestamp
      }))
    }
  },
  
  actions: {
    // 初始化子应用管理
    initialize() {
      this.isInitialized = true
      // 从 localStorage 加载应用使用统计
      this.loadAppUsageStats()
      // 启动内存监控
      this.startMemoryMonitoring()
      // 启动性能监控
      this.startPerformanceMonitoring()
    },
    
    // 从 localStorage 加载应用使用统计
    loadAppUsageStats() {
      try {
        const savedStats = localStorage.getItem('appUsageStats')
        if (savedStats) {
          this.appUsageStats = JSON.parse(savedStats)
        }
      } catch (error) {
        console.error('Error loading app usage stats:', error)
      }
    },
    
    // 保存应用使用统计到 localStorage
    saveAppUsageStats() {
      try {
        localStorage.setItem('appUsageStats', JSON.stringify(this.appUsageStats))
      } catch (error) {
        console.error('Error saving app usage stats:', error)
      }
    },
    
    // 记录应用使用
    recordAppUsage(appName) {
      this.appUsageStats[appName] = (this.appUsageStats[appName] || 0) + 1
      this.saveAppUsageStats()
    },
    
    // 注册新的子应用
    registerMicroApp(appConfig) {
      if (appConfig && appConfig.name) {
        // 检查是否已存在同名应用
        const existingApp = this.microApps.find(app => app.name === appConfig.name)
        if (!existingApp) {
          this.microApps.push(appConfig)
        }
      }
    },
    
    // 加载子应用
    async loadMicroApp(appName, containerId, cacheKey) {
      try {
        // 记录应用使用
        this.recordAppUsage(appName)
        
        // 检查是否已存在相同容器的实例
        if (this.isMicroAppLoaded(containerId)) {
          const existingInstance = this.getMicroAppInstance(containerId)
          return existingInstance.instance
        }
        
        // 尝试懒加载子应用
        let appConfig
        try {
          appConfig = await lazyLoadMicroApp(appName)
        } catch (error) {
          // 子菜单应用可能未直接注册，尝试查找其父应用
          console.log('尝试查找子菜单应用的父应用配置:', appName)
          
          // 导入appManagerService以获取完整的应用配置
          const appManagerService = await import('../services/appManagerService')
          const allApps = appManagerService.default.getAllAppsFlattened()
          const targetApp = allApps.find(app => app.id === appName)
          
          if (targetApp) {
            // 查找有entry的父级应用
            let parentApp = allApps.find(app => app.id === targetApp.parent)
            while (parentApp && !parentApp.entry) {
              parentApp = allApps.find(app => app.id === parentApp.parent)
            }
            
            if (parentApp) {
              // 构建完整的应用配置
              const appPath = targetApp.path || ''
              appConfig = {
                ...parentApp,
                id: appName,
                name: appName,
                path: appPath,
                params: targetApp.params,
                query: targetApp.query,
                fullPath: `${parentApp.activeRule || ''}${appPath.startsWith('/') ? '' : '/'}${appPath}`.replace(/\/+/g, '/'),
                fullUrl: `${parentApp.entry}${appPath.startsWith('/') ? '' : '/'}${appPath}`
              }
              console.log('✅ 为子菜单应用构建配置:', appConfig)
            }
          }
        }
        
        if (appConfig) {
          const microAppInstance = loadMicroApp(appConfig, containerId, cacheKey)
          if (microAppInstance) {
            // 存储子应用实例信息
            this.microAppInstances.set(containerId, {
              appName,
              instance: microAppInstance,
              containerId,
              cacheKey,
              mountedAt: Date.now(),
              memoryUsage: 0
            })
            
            // 监控内存使用
            this.monitorAppMemory(appName, containerId)
            
            return microAppInstance
          }
        }
      } catch (error) {
        console.error('Error loading micro app:', error)
      }
      return null
    },
    
    // 卸载子应用
    unmountMicroApp(containerId) {
      try {
        const appInfo = this.microAppInstances.get(containerId)
        if (appInfo) {
          // 停止内存监控
          this.stopMonitoringAppMemory(appInfo.appName)
          
          // 卸载子应用
          appInfo.instance.unmount()
          
          // 清理实例
          this.microAppInstances.delete(containerId)
        }
      } catch (error) {
        console.error('Error unmounting micro app:', error)
      }
    },
    
    // 获取子应用实例
    getMicroAppInstance(containerId) {
      return this.microAppInstances.get(containerId)
    },
    
    // 检查子应用是否已加载
    isMicroAppLoaded(containerId) {
      // 检查实例记录是否存在
      if (!this.microAppInstances.has(containerId)) {
        return false
      }
      
      // 检查容器元素是否存在于DOM中
      const container = document.getElementById(containerId)
      if (!container) {
        console.log('❌ 容器元素不存在于DOM中，视为未加载:', containerId)
        // 清理无效的实例记录
        this.microAppInstances.delete(containerId)
        return false
      }
      
      // 检查容器是否有内容
      if (container.children.length === 0) {
        console.log('❌ 容器为空，视为未加载:', containerId)
        // 清理无效的实例记录
        this.microAppInstances.delete(containerId)
        return false
      }
      
      // 检查是否存在micro-app元素
      const microAppElement = container.querySelector('micro-app')
      if (!microAppElement) {
        console.log('❌ 容器中无micro-app元素，视为未加载:', containerId)
        // 清理无效的实例记录
        this.microAppInstances.delete(containerId)
        return false
      }
      
      console.log('✅ 微应用已加载，使用缓存实例:', containerId)
      return true
    },
    
    // 根据应用名称获取所有相关实例
    getAppInstancesByName(appName) {
      const instances = []
      this.microAppInstances.forEach((appInfo) => {
        if (appInfo.appName === appName) {
          instances.push(appInfo)
        }
      })
      return instances
    },
    
    // 清理所有子应用
    clearAllMicroApps() {
      this.microAppInstances.forEach((appInfo) => {
        try {
          // 停止内存监控
          this.stopMonitoringAppMemory(appInfo.appName)
          // 卸载子应用
          appInfo.instance.unmount()
        } catch (error) {
          console.error('Error unmounting micro app:', error)
        }
      })
      this.microAppInstances.clear()
    },
    
    // 清理指定应用的所有实例
    clearAppInstances(appName) {
      const containersToRemove = []
      
      // 收集需要移除的容器 ID
      this.microAppInstances.forEach((appInfo, containerId) => {
        if (appInfo.appName === appName) {
          containersToRemove.push(containerId)
        }
      })
      
      // 卸载并移除实例
      containersToRemove.forEach(containerId => {
        this.unmountMicroApp(containerId)
      })
    },
    
    // 启动内存监控
    startMemoryMonitoring() {
      // 每 30 秒监控一次内存使用
      setInterval(() => {
        this.checkMemoryUsage()
      }, 30000)
    },
    
    // 检查内存使用情况
    checkMemoryUsage() {
      if (performance && performance.memory) {
        const memory = performance.memory
        console.log('Memory usage:', memory)
        
        // 检查每个运行中的应用
        this.microAppInstances.forEach((appInfo) => {
          this.monitorAppMemory(appInfo.appName, appInfo.containerId)
        })
      }
    },
    
    // 监控应用内存使用
    monitorAppMemory(appName, containerId) {
      try {
        // 这里可以添加更详细的内存监控逻辑
        // 例如使用 Performance API 或自定义监控
        const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0
        
        this.memoryStats[appName] = {
          memory: memoryUsage,
          timestamp: Date.now()
        }
        
        // 更新实例的内存使用情况
        const appInfo = this.microAppInstances.get(containerId)
        if (appInfo) {
          appInfo.memoryUsage = memoryUsage
        }
        
        // 检查内存使用是否过高
        if (memoryUsage > 500 * 1024 * 1024) { // 500MB
          console.warn(`App ${appName} is using high memory: ${(memoryUsage / (1024 * 1024)).toFixed(2)}MB`)
          // 可以在这里添加内存释放逻辑
        }
      } catch (error) {
        console.error('Error monitoring app memory:', error)
      }
    },
    
    // 停止监控应用内存
    stopMonitoringAppMemory(appName) {
      delete this.memoryStats[appName]
    },
    
    // 启动性能监控
    startPerformanceMonitoring() {
      // 可以在这里添加性能监控逻辑
    },
    
    // 记录性能数据
    recordPerformanceData(appName, type, value) {
      if (!this.performanceStats[appName]) {
        this.performanceStats[appName] = {}
      }
      this.performanceStats[appName][type] = {
        value,
        timestamp: Date.now()
      }
    },
    
    // 优化渲染性能
    optimizeRendering(containerId) {
      const appInfo = this.microAppInstances.get(containerId)
      if (appInfo) {
        // 这里可以添加渲染优化逻辑
        // 例如使用虚拟列表、节流/防抖等技术
        console.log('Optimizing rendering for app:', appInfo.appName)
      }
    },
    
    // 优化网络请求
    optimizeNetworkRequests(appName) {
      // 这里可以添加网络优化逻辑
      // 例如请求缓存、批量请求等
      console.log('Optimizing network requests for app:', appName)
    },
    
    // 预加载常用应用
    preloadFrequentlyUsedApps() {
      const apps = this.mostUsedApps
      console.log('Preloading frequently used apps:', apps)
      
      // 这里可以实现预加载逻辑
    }
  }
})
