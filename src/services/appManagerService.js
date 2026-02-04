// 子应用管理服务
import { registerMicroApps, clearMicroApps } from '../micro-app/micro-app-config'

// 常量定义
const APP_CONFIG_KEY = 'appConfig'
const USER_DESKTOP_CONFIG_KEY = 'userDesktopConfig'
const DEFAULT_CONTAINER = '#app-container'

// 子应用管理服务
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
        console.log('✅ 从缓存加载子应用配置成功')
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
      console.log('✅ 从接口加载子应用配置成功')
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
      clearMicroApps()
      
      // 准备注册的应用配置
      const microAppConfigs = []
      
      // 遍历应用配置
      appConfigs.forEach(appConfig => {
        // 确保应用配置包含必要的字段
        if (appConfig && appConfig.id && appConfig.entry) {
          const microAppConfig = {
            name: appConfig.id,
            entry: appConfig.entry,
            container: appConfig.container || DEFAULT_CONTAINER,
            activeRule: appConfig.activeRule || `/${appConfig.id}`,
            iframe: appConfig.iframe !== false, // 默认开启iframe模式
            props: {
              msg: '来自主应用的消息',
            }
          }
          
          microAppConfigs.push(microAppConfig)
        } else if (appConfig && appConfig.id) {
          // 处理文件夹类型的配置
          if (appConfig.children && appConfig.children.length > 0) {
            this.registerAppsToMicroApp(appConfig.children)
          }
        }
      })
      
      // 批量注册应用
      if (microAppConfigs.length > 0) {
        const successCount = registerMicroApps(microAppConfigs)
        console.log('🎉 应用注册完成，成功注册:', successCount, '个应用')
      } else {
        console.log('ℹ️ 没有可注册的应用')
      }
    } catch (error) {
      console.error('❌ 注册应用到microApps失败:', error)
    }
  }

  // 从接口加载子应用配置
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
      return this.getMockAppConfig()
    }
  }

  // 获取模拟应用配置
  getMockAppConfig() {
    return [
      {
        id: 'vue3-subapp',
        name: 'Vue 3 示例',
        icon: '/src/assets/icons/apps/vue.svg',
        entry: '//localhost:8081',
        container: DEFAULT_CONTAINER,
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
          },
          {
            id: 'vue3-about',
            name: '关于',
            icon: '/src/assets/icons/apps/vue.svg',
            type: 'app',
            path: '/about',
            params: {},
            query: {}
          }
        ]
      },
      {
        id: 'react',
        name: 'React 示例',
        icon: '/src/assets/icons/apps/react.svg',
        entry: '//localhost:3001',
        container: DEFAULT_CONTAINER,
        activeRule: '/react',
        iframe: true,
        type: 'folder',
        children: [
          {
            id: 'react-home',
            name: '首页',
            icon: '/src/assets/icons/apps/react.svg',
            type: 'app',
            path: '/',
            params: {},
            query: {}
          },
          {
            id: 'react-about',
            name: '关于',
            icon: '/src/assets/icons/apps/react.svg',
            type: 'app',
            path: '/about',
            params: {},
            query: {}
          }
        ]
      },
      {
        id: 'angular',
        name: 'Angular 示例',
        icon: '/src/assets/icons/apps/angular.svg',
        entry: '//localhost:4200',
        container: DEFAULT_CONTAINER,
        activeRule: '/angular',
        iframe: true,
        type: 'folder',
        children: [
          {
            id: 'angular-home',
            name: '首页',
            icon: '/src/assets/icons/apps/angular.svg',
            type: 'app',
            path: '/#/',
            params: {},
            query: {}
          },
          {
            id: 'angular-about',
            name: '关于',
            icon: '/src/assets/icons/apps/angular.svg',
            type: 'app',
            path: '/#/about',
            params: {},
            query: {}
          }
        ]
      },
      {
        id: 'react-umijs',
        name: 'React UMIJS 示例',
        icon: '/src/assets/icons/apps/react.svg',
        entry: '//localhost:8000',
        container: DEFAULT_CONTAINER,
        activeRule: '/react-umijs',
        iframe: true,
        type: 'app',
        children: [
          {
            id: 'react-umijs-home',
            name: '首页',
            icon: '/src/assets/icons/apps/react.svg',
            type: 'app',
            path: '/home',
            params: {},
            query: {}
          },
          {
            id: 'react-umijs-access',
            name: '权限管理',
            icon: '/src/assets/icons/apps/react.svg',
            type: 'app',
            path: '/access',
            params: {},
            query: {}
          },
          {
            id: 'react-umijs-table',
            name: '表格示例',
            icon: '/src/assets/icons/apps/react.svg',
            type: 'app',
            path: '/table',
            params: {},
            query: {}
          }
        ]
      },
      {
        id: 'business',
        name: '业务系统',
        icon: '/src/assets/icons/folders/business.svg',
        type: 'folder',
        children: [
          {
            id: 'crm',
            name: '客户管理',
            icon: '/src/assets/icons/apps/crm.svg',
            entry: '//localhost:8082',
            container: DEFAULT_CONTAINER,
            activeRule: '/crm',
            iframe: true,
            type: 'app',
            children: [
              {
                id: 'crm-customers',
                name: '客户列表',
                icon: '/src/assets/icons/apps/crm.svg',
                type: 'app',
                path: '/customers',
                params: {},
                query: {}
              },
              {
                id: 'crm-leads',
                name: '线索管理',
                icon: '/src/assets/icons/apps/crm.svg',
                type: 'app',
                path: '/leads',
                params: {},
                query: {}
              }
            ]
          },
          {
            id: 'erp',
            name: '企业资源',
            icon: '/src/assets/icons/apps/erp.svg',
            type: 'folder',
            children: [
              {
                id: 'finance',
                name: '财务管理',
                icon: '/src/assets/icons/apps/finance.svg',
                entry: '//localhost:8083',
                container: DEFAULT_CONTAINER,
                activeRule: '/finance',
                iframe: true,
                type: 'app',
                children: [
                  {
                    id: 'finance-invoices',
                    name: '发票管理',
                    icon: '/src/assets/icons/apps/finance.svg',
                    type: 'app',
                    path: '/invoices',
                    params: {},
                    query: {}
                  },
                  {
                    id: 'finance-reports',
                    name: '财务报表',
                    icon: '/src/assets/icons/apps/finance.svg',
                    type: 'app',
                    path: '/reports',
                    params: {},
                    query: {}
                  }
                ]
              },
              {
                id: 'inventory',
                name: '库存管理',
                icon: '/src/assets/icons/apps/inventory.svg',
                entry: '//localhost:8084',
                container: DEFAULT_CONTAINER,
                activeRule: '/inventory',
                iframe: true,
                type: 'app',
                children: [
                  {
                    id: 'inventory-products',
                    name: '产品列表',
                    icon: '/src/assets/icons/apps/inventory.svg',
                    type: 'app',
                    path: '/products',
                    params: {},
                    query: {}
                  },
                  {
                    id: 'inventory-stocks',
                    name: '库存状态',
                    icon: '/src/assets/icons/apps/inventory.svg',
                    type: 'app',
                    path: '/stocks',
                    params: {},
                    query: {}
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  // 从缓存加载子应用配置
  loadAppConfigFromCache() {
    try {
      const cachedConfig = localStorage.getItem(APP_CONFIG_KEY)
      return cachedConfig ? JSON.parse(cachedConfig) : null
    } catch (error) {
      console.error('❌ 从缓存加载子应用配置失败:', error)
      return null
    }
  }

  // 保存子应用配置到缓存
  saveAppConfigToCache(config) {
    try {
      localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('❌ 保存子应用配置到缓存失败:', error)
    }
  }

  // 从缓存加载用户桌面配置
  loadUserDesktopConfig() {
    try {
      const cachedConfig = localStorage.getItem(USER_DESKTOP_CONFIG_KEY)
      return cachedConfig ? JSON.parse(cachedConfig) : {
        desktopApps: []
      }
    } catch (error) {
      console.error('❌ 从缓存加载用户桌面配置失败:', error)
      return {
        desktopApps: []
      }
    }
  }

  // 保存用户桌面配置到缓存
  saveUserDesktopConfig(config) {
    try {
      localStorage.setItem(USER_DESKTOP_CONFIG_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('❌ 保存用户桌面配置到缓存失败:', error)
    }
  }

  // 获取所有子应用（扁平化）
  getAllAppsFlattened() {
    const flattenedApps = []
    
    const flatten = (apps, parent = null, level = 0) => {
      apps.forEach(app => {
        flattenedApps.push({
          ...app,
          parent,
          level
        })
        if (app.children && app.children.length > 0) {
          flatten(app.children, app.id, level + 1)
        }
      })
    }
    
    flatten(this.apps)
    return flattenedApps
  }

  // 获取开始菜单应用（包含多级菜单）
  getStartMenuApps() {
    return this.apps
  }

  // 获取桌面应用
  getDesktopApps() {
    const userConfig = this.loadUserDesktopConfig()
    return userConfig.desktopApps.length > 0 ? userConfig.desktopApps : this.apps.filter((app, index) => index <= 1)
  }

  // 获取默认桌面应用
  getDefaultDesktopApps() {
    return [
      {
        id: 'vue3-subapp',
        name: 'Vue 3 示例',
        icon: '/src/assets/icons/apps/vue.svg'
      },
      {
        id: 'react',
        name: 'React 示例',
        icon: '/src/assets/icons/apps/react.svg'
      }
    ]
  }

  // 添加应用到桌面
  addAppToDesktop(app) {
    try {
      const userConfig = this.loadUserDesktopConfig()
      
      // 检查应用是否已经在桌面
      const exists = userConfig.desktopApps.some(desktopApp => desktopApp.id === app.id)
      if (!exists) {
        userConfig.desktopApps.push({
          id: app.id,
          name: app.name,
          icon: app.icon,
          type: app.type,
          children: app.children || []
        })
        this.saveUserDesktopConfig(userConfig)
        console.log('✅ 应用添加到桌面成功:', app.name)
        return true
      }
      
      console.warn('⚠️ 应用已经在桌面:', app.name)
      return false
    } catch (error) {
      console.error('❌ 添加应用到桌面失败:', error)
      return false
    }
  }

  // 从桌面移除应用
  removeAppFromDesktop(appId) {
    try {
      const userConfig = this.loadUserDesktopConfig()
      const initialLength = userConfig.desktopApps.length
      
      userConfig.desktopApps = userConfig.desktopApps.filter(app => app.id !== appId)
      
      if (userConfig.desktopApps.length < initialLength) {
        this.saveUserDesktopConfig(userConfig)
        console.log('✅ 应用从桌面移除成功:', appId)
        return true
      }
      
      console.warn('⚠️ 应用不在桌面:', appId)
      return false
    } catch (error) {
      console.error('❌ 从桌面移除应用失败:', error)
      return false
    }
  }

  // 检查应用是否为叶子节点
  isLeafApp(app) {
    return app.type === 'app' && (!app.children || app.children.length === 0)
  }

  // 打开应用（处理多级菜单，支持直接打开到业务菜单）
  openApp(app) {
    if (this.isLeafApp(app)) {
      // 打开叶子节点应用
      console.log('📱 打开应用:', app.name)
      
      // 构建完整的应用配置，包括路径和参数
      const fullAppConfig = this.buildFullAppConfig(app)
      return fullAppConfig
    } else if (app.type === 'folder' && app.children && app.children.length > 0) {
      // 打开文件夹，需要显示子菜单
      console.log('📁 打开文件夹:', app.name)
      return app
    }
    return null
  }

  // 构建完整的应用配置
  buildFullAppConfig(app) {
    // 查找应用的父级配置
    const parentConfig = this.findParentAppConfig(app.id)
    
    // 构建完整配置
    const fullConfig = {
      ...app,
      // 继承父级的微前端配置
      ...(parentConfig || {}),
      // 确保id唯一
      id: app.id,
      // 构建完整的路径
      fullPath: this.buildFullPath(app, parentConfig),
      // 构建完整的URL
      fullUrl: this.buildFullUrl(app, parentConfig)
    }
    
    return fullConfig
  }

  // 查找应用的父级配置
  findParentAppConfig(appId) {
    const allApps = this.getAllAppsFlattened()
    const app = allApps.find(a => a.id === appId)
    
    if (app && app.parent) {
      // 递归查找父级，直到找到有entry的应用配置
      let parent = allApps.find(a => a.id === app.parent)
      while (parent && !parent.entry) {
        parent = allApps.find(a => a.id === parent.parent)
      }
      return parent
    }
    
    return null
  }

  // 构建完整的路径
  buildFullPath(app, parentConfig) {
    if (!parentConfig) return app.path || '/'
    
    const parentPath = parentConfig.activeRule || ''
    const appPath = app.path || ''
    
    // 移除多余的斜杠
    const fullPath = `${parentPath}${appPath.startsWith('/') ? '' : '/'}${appPath}`
    return fullPath.replace(/\/+/g, '/')
  }

  // 构建完整的URL
  buildFullUrl(app, parentConfig) {
    if (!parentConfig || !parentConfig.entry) return ''
    
    const entry = parentConfig.entry
    const appPath = app.path || ''
    const queryParams = this.buildQueryParams(app.query || {})
    
    // 构建完整URL
    let fullUrl = entry
    
    // 添加路径
    if (appPath && appPath !== '/') {
      fullUrl = `${fullUrl}${appPath.startsWith('/') ? '' : '/'}${appPath}`
    }
    
    // 添加查询参数
    if (queryParams) {
      fullUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryParams}`
    }
    
    return fullUrl
  }

  // 构建查询参数字符串
  buildQueryParams(query) {
    if (!query || Object.keys(query).length === 0) return ''
    
    return Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  }

  // 注册新的子应用
  registerNewApp(appConfig) {
    try {
      console.log('📝 注册新的子应用:', appConfig.name)
      
      // 添加到应用列表
      this.apps.push(appConfig)
      this.saveAppConfigToCache(this.apps)
      
      // 重新注册所有应用
      this.registerAppsToMicroApp(this.apps)
      
      console.log('✅ 子应用注册成功:', appConfig.name)
      return true
    } catch (error) {
      console.error('❌ 注册子应用失败:', error)
      return false
    }
  }

  // 刷新子应用配置
  async refreshAppConfig() {
    return this.initialize()
  }

  // 根据ID获取应用配置
  getAppById(appId) {
    const allApps = this.getAllAppsFlattened()
    return allApps.find(app => app.id === appId)
  }

  // 获取应用数量
  getAppCount() {
    return this.apps.length
  }
}

// 导出单例实例
export default new AppManagerService()
