import { defineStore } from 'pinia'
import { useWindowStore } from './windowStore'
import { useConfigStore } from './configStore'
import { useMicroAppStore } from './microAppStore'
import appManagerService from '../services/appManagerService'

export const useDesktopStore = defineStore('desktop', {
  state: () => ({
    // 桌面背景
    desktopBackground: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    
    // 桌面背景选项
    backgroundOptions: [
      'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ],
    
    // 桌面应用列表 - 从 AppManagerService 获取
    desktopApps: [],
    
    // Dock 应用列表 - 现在只显示已打开或缓存的应用
    dockApps: [],
    
    // 开始菜单应用列表 - 从 AppManagerService 获取
    startMenuApps: [],
    
    // 系统菜单显示状态
    showSystemMenu: false,
    
    // Launchpad显示状态
    showLaunchpad: false,
    
    // 桌面右键菜单
    showDesktopMenuVisible: false,
    menuX: 0,
    menuY: 0,
    
    // 当前时间
    currentTime: '',
    
    // 通知中心
    notifications: [
      {
        id: 1,
        title: '系统通知',
        message: '欢迎使用 macOS 风格桌面应用',
        icon: '/src/assets/icons/system/siri.png',
        time: new Date().toLocaleTimeString(),
        read: false
      },
      {
        id: 2,
        title: '业务系统1',
        message: '您有 3 条未读消息',
        icon: '/src/assets/icons/system/library.png',
        time: new Date().toLocaleTimeString(),
        read: false
      }
    ],
    showNotificationCenter: false,
    
    // 系统托盘
    systemTray: [
      {
        id: 'wifi',
        name: 'WiFi',
        icon: '/src/assets/icons/system/wifi.png',
        status: 'connected'
      },
      {
        id: 'bluetooth',
        name: '蓝牙',
        icon: '/src/assets/icons/system/bluetooth.png',
        status: 'on'
      },
      {
        id: 'battery',
        name: '电池',
        icon: '/src/assets/icons/system/battery.png',
        status: '80%'
      }
    ],
    
    // 多桌面
    desktops: [
      {
        id: 1,
        name: '桌面 1',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        apps: []
      }
    ],
    currentDesktopId: 1,
    
    // 文件系统
    fileSystem: {
      desktop: [
        {
          id: 'file1',
          name: '文档.txt',
          type: 'file',
          size: '1KB',
          date: new Date().toLocaleDateString(),
          icon: '/src/assets/icons/folders/text-file.png'
        },
        {
          id: 'folder1',
          name: '项目',
          type: 'folder',
          size: '',
          date: new Date().toLocaleDateString(),
          icon: '/src/assets/icons/folders/files.png'
        }
      ],
      documents: [],
      downloads: [],
      pictures: []
    },
    showFileSystem: false,
    
    // 桌面切换器
    showDesktopSwitcher: false,
    
    // 应用右键菜单
    showAppContextMenuVisible: false,
    appContextMenuX: 0,
    appContextMenuY: 0,
    selectedApp: null,
    isDesktopApp: false,
    
    // 文件右键菜单
    showFileContextMenuVisible: false,
    contextMenuX: 0,
    contextMenuY: 0,
    selectedFile: null,
    
    // 拖拽管理状态
    isDragging: false,
    isLongPressing: false,
    draggedIconIndex: -1,
    longPressThreshold: 500 // 长按阈值，毫秒
  }),
  
  getters: {
    desktopAppCount: (state) => state.desktopApps.length,
    dockAppCount: (state) => state.dockApps.length,
    currentDesktop: (state) => state.desktops.find(d => d.id === state.currentDesktopId),
    unreadNotificationCount: (state) => state.notifications.filter(n => !n.read).length
  },
  
  actions: {
    // 更换桌面背景
    changeDesktopBackground() {
      const currentIndex = this.backgroundOptions.indexOf(this.desktopBackground)
      const nextIndex = (currentIndex + 1) % this.backgroundOptions.length
      const newBackground = this.backgroundOptions[nextIndex]
      this.setDesktopBackground(newBackground)
    },
    
    // 设置桌面背景
    setDesktopBackground(background, updateConfigStore = true) {
      this.desktopBackground = background
      
      // 更新当前桌面的背景
      const currentDesktop = this.currentDesktop
      if (currentDesktop) {
        currentDesktop.background = background
      }
      
      // 更新configStore中的桌面背景，确保与系统偏好设置同步
      if (updateConfigStore) {
        const configStore = useConfigStore()
        configStore.setDesktopBackground(background, false)
      }
    },
    
    // 切换系统菜单
    toggleSystemMenu() {
      this.showSystemMenu = !this.showSystemMenu
    },
    
    // 切换Launchpad
    toggleLaunchpad() {
      this.showLaunchpad = !this.showLaunchpad
    },
    
    // 切换桌面切换器
    toggleDesktopSwitcher() {
      this.showDesktopSwitcher = !this.showDesktopSwitcher
    },
    
    // 显示桌面右键菜单
    showDesktopMenu(x, y) {
      this.menuX = x
      this.menuY = y
      this.showDesktopMenuVisible = true
    },
    
    // 关闭桌面右键菜单
    closeDesktopMenu() {
      this.showDesktopMenuVisible = false
    },
    
    // 整理图标
    arrangeIcons() {
      // 简单的图标整理逻辑
    },
    
    // 清理桌面
    cleanDesktop() {
      // 清理桌面逻辑
    },
    
    // 初始化应用配置
    async initializeAppConfig() {
      try {
        console.log('🚀 初始化应用配置...')
        await appManagerService.initialize()
        this.updateAppLists()
        console.log('✅ 应用配置初始化成功')
      } catch (error) {
        console.error('❌ 初始化应用配置失败:', error)
      }
    },
    
    // 更新应用列表
    updateAppLists() {
      this.desktopApps = appManagerService.getDesktopApps()
      this.startMenuApps = appManagerService.getStartMenuApps()
    },
    
    // 添加应用到桌面
    addAppToDesktop(app) {
      const success = appManagerService.addAppToDesktop(app)
      if (success) {
        this.updateAppLists()
      }
      return success
    },
    
    // 从桌面移除应用
    removeAppFromDesktop(appId) {
      const success = appManagerService.removeAppFromDesktop(appId)
      if (success) {
        this.updateAppLists()
      }
      return success
    },
    
    // 刷新应用配置
    async refreshAppConfig() {
      try {
        console.log('🔄 刷新应用配置...')
        await appManagerService.refreshAppConfig()
        this.updateAppLists()
        console.log('✅ 应用配置刷新成功')
      } catch (error) {
        console.error('❌ 刷新应用配置失败:', error)
      }
    },
    
    // 调整桌面图标顺序
    reorderDesktopApps(fromIndex, toIndex) {
      if (fromIndex >= 0 && fromIndex < this.desktopApps.length && 
          toIndex >= 0 && toIndex < this.desktopApps.length && 
          fromIndex !== toIndex) {
        
        // 从原位置移除应用
        const [movedApp] = this.desktopApps.splice(fromIndex, 1)
        
        // 插入到新位置
        this.desktopApps.splice(toIndex, 0, movedApp)
        
        console.log(`🔄 调整桌面图标顺序: ${fromIndex} → ${toIndex}`)
        
        // 更新用户桌面配置
        appManagerService.saveUserDesktopConfig({
          desktopApps: this.desktopApps
        })
        
        return true
      }
      return false
    },
    
    // 更新当前时间
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 添加桌面图标
    addDesktopApp(app) {
      this.desktopApps.push(app)
    },
    
    // 移除桌面图标
    removeDesktopApp(appId) {
      const index = this.desktopApps.findIndex(app => app.id === appId)
      if (index > -1) {
        this.desktopApps.splice(index, 1)
      }
    },
    
    // 通知中心
    addNotification(notification) {
      const newNotification = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        read: false,
        ...notification
      }
      this.notifications.unshift(newNotification)
      
      // 限制通知数量
      if (this.notifications.length > 20) {
        this.notifications = this.notifications.slice(0, 20)
      }
    },
    
    markNotificationAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    },
    
    clearAllNotifications() {
      this.notifications = []
    },
    
    toggleNotificationCenter() {
      this.showNotificationCenter = !this.showNotificationCenter
    },
    
    // 系统托盘
    updateSystemTrayItem(id, status) {
      const item = this.systemTray.find(item => item.id === id)
      if (item) {
        item.status = status
      }
    },
    
    // 多桌面
    switchDesktop(desktopId) {
      this.currentDesktopId = desktopId
      
      // 切换桌面背景
      const desktop = this.desktops.find(d => d.id === desktopId)
      if (desktop) {
        this.desktopBackground = desktop.background
        
        // 更新configStore中的桌面背景，确保与系统偏好设置同步
        const configStore = useConfigStore()
        configStore.setDesktopBackground(desktop.background, false)
      }
      
      // 激活新桌面上的最后一个窗口（如果有的话）
      const windowStore = useWindowStore()
      const desktopWindows = windowStore.windows.filter(window => window.desktopId === desktopId)
      if (desktopWindows.length > 0) {
        // 按创建时间排序，激活最后创建的窗口
        const lastWindow = desktopWindows[desktopWindows.length - 1]
        windowStore.activateWindow(lastWindow.id)
        
        // 检查并重新加载当前桌面的所有窗口的微应用
        const microAppStore = useMicroAppStore()
        desktopWindows.forEach(window => {
          if (!microAppStore.isMicroAppLoaded(window.containerId)) {
            console.log('🔄 切换桌面时，微应用未加载，重新加载:', window.appId)
            const cacheKey = `${window.appId}-${window.desktopId}`
            microAppStore.loadMicroApp(window.appId, window.containerId, cacheKey)
          }
        })
      } else {
        // 如果新桌面没有窗口，清空激活窗口ID
        windowStore.$patch({ activeWindowId: null })
      }
    },
    
    addDesktop(name) {
      const newDesktop = {
        id: this.desktops.length + 1,
        name: name || `桌面 ${this.desktops.length + 1}`,
        background: this.desktopBackground,
        apps: []
      }
      this.desktops.push(newDesktop)
      return newDesktop
    },
    
    removeDesktop(desktopId) {
      if (this.desktops.length > 1) {
        const index = this.desktops.findIndex(d => d.id === desktopId)
        if (index > -1) {
          // 清理该桌面上的所有窗口
          const windowStore = useWindowStore()
          windowStore.clearDesktopWindows(desktopId)
          
          // 移除桌面
          this.desktops.splice(index, 1)
          
          // 如果删除的是当前桌面，切换到第一个桌面
          if (this.currentDesktopId === desktopId) {
            this.switchDesktop(this.desktops[0].id)
          }
        }
      }
    },
    
    renameDesktop(desktopId, name) {
      const desktop = this.desktops.find(d => d.id === desktopId)
      if (desktop) {
        desktop.name = name
      }
    },
    
    // 文件系统
    addFile(path, file) {
      if (this.fileSystem[path]) {
        this.fileSystem[path].push({
          id: Date.now(),
          ...file
        })
      }
    },
    
    removeFile(path, fileId) {
      if (this.fileSystem[path]) {
        const index = this.fileSystem[path].findIndex(f => f.id === fileId)
        if (index > -1) {
          this.fileSystem[path].splice(index, 1)
        }
      }
    },
    
    toggleFileSystem() {
      this.showFileSystem = !this.showFileSystem
    },
    
    // 应用右键菜单
    showAppContextMenu(event, app, isDesktop) {
      event.preventDefault()
      event.stopPropagation()
      
      // 先关闭其他所有右键菜单
      this.closeAllContextMenus()
      
      this.selectedApp = app
      this.isDesktopApp = isDesktop
      
      // 计算菜单位置，确保不超出屏幕边界
      const menuWidth = 200 // 估计菜单宽度
      const menuHeight = 150 // 估计菜单高度
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // 调整X坐标
      let adjustedX = event.clientX
      if (event.clientX + menuWidth > screenWidth) {
        adjustedX = screenWidth - menuWidth - 10
      }
      
      // 调整Y坐标
      let adjustedY = event.clientY
      if (event.clientY + menuHeight > screenHeight) {
        adjustedY = screenHeight - menuHeight - 10
      }
      
      this.appContextMenuX = adjustedX
      this.appContextMenuY = adjustedY
      this.showAppContextMenuVisible = true
      
      // 点击其他地方关闭右键菜单
      setTimeout(() => {
        document.addEventListener('click', () => this.closeAppContextMenu())
      }, 100)
    },
    
    closeAppContextMenu() {
      this.showAppContextMenuVisible = false
      this.selectedApp = null
      this.isDesktopApp = false
      document.removeEventListener('click', () => this.closeAppContextMenu())
    },
    
    // 关闭所有右键菜单
    closeAllContextMenus() {
      this.closeDesktopMenu()
      this.closeAppContextMenu()
      this.closeFileContextMenu()
    },
    
    // 文件右键菜单
    showFileContextMenu(event, file) {
      event.preventDefault()
      event.stopPropagation()
      
      // 先关闭其他所有右键菜单
      this.closeAllContextMenus()
      
      this.selectedFile = file
      
      // 计算菜单位置，确保不超出屏幕边界
      const menuWidth = 200 // 估计菜单宽度
      const menuHeight = 150 // 估计菜单高度
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // 调整X坐标
      let adjustedX = event.clientX
      if (event.clientX + menuWidth > screenWidth) {
        adjustedX = screenWidth - menuWidth - 10
      }
      
      // 调整Y坐标
      let adjustedY = event.clientY
      if (event.clientY + menuHeight > screenHeight) {
        adjustedY = screenHeight - menuHeight - 10
      }
      
      this.contextMenuX = adjustedX
      this.contextMenuY = adjustedY
      this.showFileContextMenuVisible = true
      
      // 点击其他地方关闭右键菜单
      setTimeout(() => {
        document.addEventListener('click', () => this.closeFileContextMenu())
      }, 100)
    },
    
    closeFileContextMenu() {
      this.showFileContextMenuVisible = false
      this.selectedFile = null
      this.contextMenuX = 0
      this.contextMenuY = 0
      document.removeEventListener('click', () => this.closeFileContextMenu())
    },
    
    // 拖拽管理
    startDrag() {
      this.isDragging = true
    },
    
    endDrag() {
      this.isDragging = false
      this.isLongPressing = false
      this.draggedIconIndex = -1
    },
    
    startLongPress() {
      this.isLongPressing = true
    },
    
    setDraggedIconIndex(index) {
      this.draggedIconIndex = index
    }
  }
})
