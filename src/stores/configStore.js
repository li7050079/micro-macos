import { defineStore } from 'pinia'
import { useDesktopStore } from './desktopStore'

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
      borderColor: '#d2d2d7',
      // 系统状态颜色
      errorColor: '#ff5f56',
      warningColor: '#ffbd2e',
      successColor: '#27ca3f'
    },
    
    // 桌面配置
    desktop: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      iconSize: 64,
      iconSpacing: 15,
      iconGridSize: 90,
      autoArrangeIcons: true
    },
    
    // Dock配置
    dock: {
      position: 'bottom',
      size: 56,
      iconSize: 32,
      magnification: true,
      magnificationSize: 48,
      hide: false,
      autohide: false
    },
    
    // 快捷键配置
    shortcuts: {
      showDesktop: 'Cmd+D',
      showMissionControl: 'Ctrl+Up',
      showAppExposé: 'Ctrl+Down',
      newWindow: 'Cmd+N',
      closeWindow: 'Cmd+W',
      minimizeWindow: 'Cmd+M',
      maximizeWindow: 'Cmd+Shift+M',
      switchWindow: 'Cmd+Tab'
    },
    
    // 系统配置
    system: {
      animations: true,
      transparency: true,
      blurEffect: true,
      notifications: true,
      autoUpdate: false,
      language: 'zh-CN',
      timeFormat: '24h',
      systemTrayAutohide: false
    },
    
    // 环境配置
    environment: 'development',
    
    // 功能开关
    features: {
      notificationCenter: true,
      systemTray: true,
      multipleDesktops: true,
      fileSystem: true,
      appStore: true
    }
  }),
  
  getters: {
    // 计算当前主题样式
    currentThemeStyles: (state) => {
      // 基础颜色变量
      const styles = {
        '--primary-color': state.theme.primaryColor,
        '--accent-color': state.theme.accentColor,
        '--background-color': state.theme.backgroundColor,
        '--text-color': state.theme.textColor,
        '--secondary-text-color': state.theme.secondaryTextColor,
        '--border-color': state.theme.borderColor
      }
      
      // 根据背景色亮度自动判断使用深色还是浅色的辅助变量
      const isDarkBackground = () => {
        const hex = state.theme.backgroundColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness < 128
      }
      
      // 根据背景色亮度添加其他变量
      if (isDarkBackground()) {
        Object.assign(styles, {
          '--surface-color': '#2c2c2e',
          '--surface-opacity': 0.95,
          '--overlay-color': 'rgba(255, 255, 255, 0.05)',
          '--overlay-hover-color': 'rgba(255, 255, 255, 0.1)',
          '--separator-color': 'rgba(255, 255, 255, 0.1)',
          '--hover-color': 'rgba(255, 255, 255, 0.05)',
          '--hover-hover-color': 'rgba(255, 255, 255, 0.1)',
          '--shadow-color': 'rgba(0, 0, 0, 0.5)'
        })
      } else {
        Object.assign(styles, {
          '--surface-color': '#ffffff',
          '--surface-opacity': 0.95,
          '--overlay-color': 'rgba(255, 255, 255, 0.1)',
          '--overlay-hover-color': 'rgba(255, 255, 255, 0.15)',
          '--separator-color': 'rgba(255, 255, 255, 0.11)',
          '--hover-color': 'rgba(0, 0, 0, 0.05)',
          '--hover-hover-color': 'rgba(0, 0, 0, 0.1)',
          '--shadow-color': 'rgba(0, 0, 0, 0.2)'
        })
      }
      
      return styles
    },
    
    // 检查功能是否启用
    isFeatureEnabled: (state) => (feature) => {
      return state.features[feature] || false
    }
  },
  
  actions: {
    // 切换主题模式
    setThemeMode(mode) {
      // 根据模式设置默认颜色和背景
      let themeColors = {}
      let defaultBackground = ''
      
      if (mode === 'light') {
        themeColors = {
          mode: 'light',
          primaryColor: '#007aff',
          accentColor: '#5856d6',
          backgroundColor: '#f5f5f7',
          textColor: '#1d1d1f',
          secondaryTextColor: '#2f2f3290',
          borderColor: '#d2d2d7'
        }
        defaultBackground = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      } else if (mode === 'dark') {
        themeColors = {
          mode: 'dark',
          primaryColor: '#0a84ff',
          accentColor: '#5e5ce6',
          backgroundColor: '#1c1c1e',
          textColor: '#f2f2f7',
          secondaryTextColor: '#aeaeb2',
          borderColor: '#38383a'
        }
        defaultBackground = 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)'
      } else if (mode === 'blue') {
        themeColors = {
          mode: 'blue',
          primaryColor: '#007aff',
          accentColor: '#5ac8fa',
          backgroundColor: '#f2f7ff',
          textColor: '#1c1c1e',
          secondaryTextColor: '#86868b',
          borderColor: '#f2f7ff99'
        }
        defaultBackground = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      } else if (mode === 'green') {
        themeColors = {
          mode: 'green',
          primaryColor: '#34c759',
          accentColor: '#30d158',
          backgroundColor: '#f2fff4',
          textColor: '#1c1c1e',
          secondaryTextColor: '#86868b',
          borderColor: '#d2e7d5'
        }
        defaultBackground = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      } else if (mode === 'purple') {
        themeColors = {
          mode: 'purple',
          primaryColor: '#af52de',
          accentColor: '#bf5af2',
          backgroundColor: '#f8f2ff',
          textColor: '#1c1c1e',
          secondaryTextColor: '#2f2f3290',
          borderColor: '#e7d2f0'
        }
        defaultBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
      
      // 使用$patch更新主题状态，确保Vue能检测到嵌套对象的变化
      this.$patch({ theme: themeColors })
      
      // 更新桌面背景为当前主题的默认背景
      this.desktop.background = defaultBackground
      
      // 传递新的主题模式给applyTheme方法
      this.applyTheme(mode)
      
      // 手动触发保存，确保主题变化被保存到localStorage
      this.saveConfig()
    },
    
    // 应用主题到DOM
    applyTheme(themeMode) {
      // 确保DOM已加载
      if (!document || !document.documentElement) {
        return
      }
      
      const root = document.documentElement
      
      // 直接使用主题的颜色值，确保新主题的颜色被正确应用
      const themeColors = {
        '--primary-color': this.theme.primaryColor,
        '--accent-color': this.theme.accentColor,
        '--background-color': this.theme.backgroundColor,
        '--text-color': this.theme.textColor,
        '--secondary-text-color': this.theme.secondaryTextColor,
        '--border-color': this.theme.borderColor,
        // 系统状态颜色
        '--error-color': this.theme.errorColor,
        '--warning-color': this.theme.warningColor,
        '--success-color': this.theme.successColor
      }
      
      // 根据背景色亮度计算其他变量
      const hex = this.theme.backgroundColor.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      
      if (brightness < 128) {
        Object.assign(themeColors, {
          '--surface-color': '#2c2c2e',
          '--surface-opacity': 0.95,
          '--overlay-color': 'rgba(255, 255, 255, 0.05)',
          '--overlay-hover-color': 'rgba(255, 255, 255, 0.1)',
          '--separator-color': 'rgba(255, 255, 255, 0.1)',
          '--hover-color': 'rgba(255, 255, 255, 0.05)',
          '--hover-hover-color': 'rgba(255, 255, 255, 0.1)',
          '--shadow-color': 'rgba(0, 0, 0, 0.5)'
        })
      } else {
        // 根据主题模式调整surface-color，使其与主题更加协调
        let surfaceColor = '#ffffff'
        const currentMode = themeMode || this.theme.mode
        if (currentMode === 'blue') {
          surfaceColor = '#f8fbff'
        } else if (currentMode === 'green') {
          surfaceColor = '#f8fff9'
        } else if (currentMode === 'purple') {
          surfaceColor = '#fcf8ff'
        }
        
        Object.assign(themeColors, {
          '--surface-color': surfaceColor,
          '--surface-opacity': 0.95,
          '--overlay-color': 'rgba(255, 255, 255, 0.1)',
          '--overlay-hover-color': 'rgba(255, 255, 255, 0.15)',
          '--separator-color': 'rgba(255, 255, 255, 0.2)',
          '--hover-color': 'rgba(0, 0, 0, 0.05)',
          '--hover-hover-color': 'rgba(0, 0, 0, 0.1)',
          '--shadow-color': 'rgba(0, 0, 0, 0.2)'
        })
      }
      
      // 清除所有现有的CSS变量
      Object.keys(themeColors).forEach(key => {
        root.style.removeProperty(key)
      })
      
      // 应用CSS变量到根元素
      Object.keys(themeColors).forEach(key => {
        root.style.setProperty(key, themeColors[key])
      })
      
      // 添加主题类到body
      if (document.body) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '')
        document.body.classList.add(`theme-${this.theme.mode}`)
      }
      
      // 更新desktopStore中的桌面背景，确保与主题同步
      const desktopStore = useDesktopStore()
      desktopStore.setDesktopBackground(this.desktop.background, false)
      
      // 触发自定义事件，通知所有组件主题已更改
      if (window) {
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: this.theme } }))
      }
    },
    
    // 设置桌面背景
    setDesktopBackground(background, updateDesktopStore = true) {
      this.desktop.background = background
      
      // 更新desktopStore中的桌面背景，确保与右键菜单更换背景同步
      if (updateDesktopStore) {
        const desktopStore = useDesktopStore()
        desktopStore.setDesktopBackground(background, false)
      }
    },
    
    // 调整桌面图标设置
    setDesktopIconSettings(settings) {
      Object.assign(this.desktop, settings)
    },
    
    // 设置Dock配置
    setDockConfig(config) {
      Object.assign(this.dock, config)
    },
    
    // 更新快捷键
    updateShortcut(action, shortcut) {
      if (this.shortcuts[action]) {
        this.shortcuts[action] = shortcut
      }
    },
    
    // 切换功能开关
    toggleFeature(feature, enabled) {
      if (this.features[feature] !== undefined) {
        this.features[feature] = enabled
      }
    },
    
    // 设置环境
    setEnvironment(env) {
      this.environment = env
    },
    
    // 更新系统配置
    updateSystemConfig(config) {
      Object.assign(this.system, config)
    },
    
    // 导入配置
    importConfig(config) {
      if (config) {
        if (config.theme) this.theme = { ...this.theme, ...config.theme }
        if (config.desktop) this.desktop = { ...this.desktop, ...config.desktop }
        if (config.dock) this.dock = { ...this.dock, ...config.dock }
        if (config.shortcuts) this.shortcuts = { ...this.shortcuts, ...config.shortcuts }
        if (config.system) this.system = { ...this.system, ...config.system }
        if (config.environment) this.environment = config.environment
        if (config.features) this.features = { ...this.features, ...config.features }
        
        this.applyTheme()
      }
    },
    
    // 导出配置
    exportConfig() {
      return JSON.stringify({
        theme: this.theme,
        desktop: this.desktop,
        dock: this.dock,
        shortcuts: this.shortcuts,
        system: this.system,
        environment: this.environment,
        features: this.features
      }, null, 2)
    },
    
    // 重置为默认配置
    resetToDefault() {
      this.$reset()
      this.applyTheme()
    },
    
    // 保存配置到localStorage
    saveConfig() {
      localStorage.setItem('desktop-config', JSON.stringify({
        theme: this.theme,
        desktop: this.desktop,
        dock: this.dock,
        shortcuts: this.shortcuts,
        system: this.system,
        environment: this.environment,
        features: this.features
      }))
      console.log('✅ 配置已保存到localStorage')
    },
    
    // 初始化配置
    initialize() {
      // 尝试从localStorage加载配置
      const savedConfig = localStorage.getItem('desktop-config')
      if (savedConfig) {
        try {
          this.importConfig(JSON.parse(savedConfig))
          console.log('✅ 从localStorage加载配置成功')
        } catch (error) {
          console.error('Failed to load saved config:', error)
        }
      } else {
        console.log('ℹ️  未找到保存的配置，使用默认配置')
      }
      
      // 应用初始主题
      this.applyTheme()
      
      // 监听配置变化，自动保存到localStorage
      this.$subscribe((mutation, state) => {
        this.saveConfig()
      })
    }
  }
})
