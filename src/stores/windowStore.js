import { defineStore } from 'pinia'
import { useDesktopStore } from './desktopStore'

export const useWindowStore = defineStore('window', {
  state: () => ({
    windows: [],
    activeWindowId: null,
    nextWindowId: 1
  }),
  
  getters: {
    activeWindow: (state) => {
      return state.windows.find(window => window.id === state.activeWindowId)
    },
    windowCount: (state) => {
      return state.windows.length
    },
    // 获取当前桌面的窗口
    currentDesktopWindows: (state) => {
      const desktopStore = useDesktopStore()
      const currentDesktopId = desktopStore.currentDesktopId
      return state.windows.filter(window => window.desktopId === currentDesktopId)
    }
  },
  
  actions: {
    // 创建新窗口
    createWindow(appId, title, options = {}) {
      const desktopStore = useDesktopStore()
      const currentDesktopId = desktopStore.currentDesktopId
      const targetDesktopId = options.desktopId || currentDesktopId
      
      // 检查是否已经存在相同 appId 和 desktopId 的窗口
      const existingWindow = this.windows.find(window => 
        window.appId === appId && window.desktopId === targetDesktopId
      )
      
      // 如果存在，激活并返回该窗口
      if (existingWindow) {
        this.activateWindow(existingWindow.id)
        return existingWindow
      }
      
      // 创建新窗口
      const newWindow = {
        id: `window-${this.nextWindowId++}`,
        appId,
        title,
        desktopId: targetDesktopId,
        x: options.x || 100 + this.windows.length * 50,
        y: options.y || 100 + this.windows.length * 50,
        width: options.width || 800,
        height: options.height || 600,
        active: true,
        maximized: false,
        minimized: false,
        containerId: `app-container-${Date.now()}`,
        ...options
      }
      
      // 激活新窗口，同时禁用其他窗口的激活状态
      this.windows.forEach(window => {
        if (window.desktopId === newWindow.desktopId) {
          window.active = false
        }
      })
      
      this.windows.push(newWindow)
      this.activeWindowId = newWindow.id
      
      return newWindow
    },
    
    // 激活窗口
    activateWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (!window) return
      
      // 只激活当前桌面的窗口
      this.windows.forEach(w => {
        if (w.desktopId === window.desktopId) {
          w.active = w.id === windowId
          if (w.id === windowId) {
            w.minimized = false
          }
        }
      })
      
      this.activeWindowId = windowId
    },
    
    // 最小化窗口
    minimizeWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        window.active = false
        window.minimized = true
        if (this.activeWindowId === windowId) {
          this.activeWindowId = null
        }
      }
    },
    
    // 最大化窗口
    maximizeWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        window.maximized = !window.maximized
        if (window.maximized) {
          // 保存原始尺寸
          window.originalSize = {
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height
          }
          
          // 获取桌面容器的实际尺寸
          const desktopContainer = document.querySelector('.desktop-container')
          if (desktopContainer) {
            const rect = desktopContainer.getBoundingClientRect()
            window.x = 0
            window.y = 0
            window.width = rect.width
            window.height = rect.height
          }
        } else if (window.originalSize) {
          // 还原到原始尺寸
          window.x = window.originalSize.x
          window.y = window.originalSize.y
          window.width = window.originalSize.width
          window.height = window.originalSize.height
        }
      }
    },
    
    // 关闭窗口
    closeWindow(windowId) {
      const index = this.windows.findIndex(w => w.id === windowId)
      if (index > -1) {
        const closingWindow = this.windows[index]
        this.windows.splice(index, 1)
        
        // 如果关闭的是活动窗口，激活当前桌面的其他窗口
        if (this.activeWindowId === windowId) {
          const desktopStore = useDesktopStore()
          const currentDesktopWindows = this.windows.filter(
            window => window.desktopId === closingWindow.desktopId
          )
          
          if (currentDesktopWindows.length > 0) {
            const lastWindow = currentDesktopWindows[currentDesktopWindows.length - 1]
            this.activeWindowId = lastWindow.id
            lastWindow.active = true
          } else {
            this.activeWindowId = null
          }
        }
      }
    },
    
    // 更新窗口位置
    updateWindowPosition(windowId, x, y) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && !window.maximized) {
        window.x = x
        window.y = y
      }
    },
    
    // 更新窗口大小
    updateWindowSize(windowId, width, height) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && !window.maximized) {
        window.width = width
        window.height = height
      }
    },
    
    // 检查应用是否在当前桌面打开
    isWindowOpen(appId) {
      const desktopStore = useDesktopStore()
      const currentDesktopId = desktopStore.currentDesktopId
      return this.windows.some(window => window.appId === appId && window.desktopId === currentDesktopId)
    },
    
    // 获取当前桌面的应用窗口
    getAppWindow(appId) {
      const desktopStore = useDesktopStore()
      const currentDesktopId = desktopStore.currentDesktopId
      return this.windows.find(window => window.appId === appId && window.desktopId === currentDesktopId)
    },
    
    // 清理指定桌面的所有窗口
    clearDesktopWindows(desktopId) {
      this.windows = this.windows.filter(window => window.desktopId !== desktopId)
      if (this.activeWindowId) {
        const activeWindow = this.windows.find(window => window.id === this.activeWindowId)
        if (!activeWindow) {
          this.activeWindowId = null
        }
      }
    },
    
    // 更新窗口属性
    updateWindow(windowId, updates) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && !window.maximized) {
        Object.assign(window, updates)
      }
    }
  }
})
