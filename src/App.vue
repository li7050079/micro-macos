<template>
  <div class="desktop-container" @contextmenu="showDesktopMenu($event)">
    <!-- 桌面背景 -->
    <div class="desktop-background" :style="{ background: desktopConfig.background }"></div>
    
    <!-- 桌面图标网格 -->
    <div class="desktop-icons" :style="{
      gridTemplateColumns: `repeat(auto-fill, ${desktopConfig.iconGridSize}px)`,
      gap: `${desktopConfig.iconSpacing}px`
    }">
      <DesktopIcon 
        v-for="(app, index) in desktopApps" 
        :key="app.id"
        :app="app"
        :index="index"
        :dragged-icon-index="desktopStore.draggedIconIndex"
        :is-long-pressing="desktopStore.isLongPressing"
        :is-dragging="desktopStore.isDragging"
        @app-context-menu="showAppContextMenu"
      />
    </div>
    
    <!-- 窗口容器 -->
    <div class="window-container">
      <Window 
        v-for="window in windows" 
        :key="window.id"
        v-show="!window.minimized"
        :window="window"
        @window-drag-start="startDrag"
      />
    </div>
    
    <!-- 任务栏 (Dock) -->
    <Dock 
      :dock-apps="dockApps"
      :show-dock="showDock"
      @system-preferences-show="showSystemPreferences"
    />
    
    <!-- 系统菜单 -->
    <SystemMenu 
      v-if="showSystemMenu"
      :start-menu-apps="startMenuApps"
    />
    
    <!-- Launchpad -->
    <Launchpad 
      v-if="showLaunchpad"
      :start-menu-apps="startMenuApps"
    />
    
    <!-- 桌面右键菜单 -->
    <Teleport to="body">
      <DesktopMenu 
        v-if="showDesktopMenuVisible"
        :menu-x="menuX"
        :menu-y="menuY"
        @system-preferences-show="showSystemPreferences"
      />
    </Teleport>
    
    <!-- 通知中心 -->
    <NotificationCenter 
      v-if="features.notificationCenter && showNotificationCenter"
      :notifications="notifications"
    />
    
    <!-- 系统托盘 -->
    <SystemTray 
      :show-system-tray="showSystemTray"
      :features="features"
    />
    
    <!-- 多桌面切换 -->
    <DesktopSwitcher 
      v-if="features.multipleDesktops && showDesktopSwitcher"
    />
    
    <!-- 文件右键菜单 -->
    <Teleport to="body">
      <FileContextMenu 
        v-if="desktopStore.showFileContextMenuVisible"
        :selected-file="desktopStore.selectedFile"
        :context-menu-x="desktopStore.contextMenuX"
        :context-menu-y="desktopStore.contextMenuY"
      />
    </Teleport>
    
    <!-- 应用右键菜单 -->
    <Teleport to="body">
      <AppContextMenu 
        v-if="desktopStore.showAppContextMenuVisible"
        :selected-app="desktopStore.selectedApp"
        :app-context-menu-x="desktopStore.appContextMenuX"
        :app-context-menu-y="desktopStore.appContextMenuY"
        :is-desktop-app="desktopStore.isDesktopApp"
      />
    </Teleport>


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { initMicroApp } from './micro-app/micro-app-config'
import { useWindowStore } from './stores/windowStore'
import { useMicroAppStore } from './stores/microAppStore'
import { useDesktopStore } from './stores/desktopStore'
import { useConfigStore } from './stores/configStore'
import DesktopIcon from './components/DesktopIcon.vue'
import Window from './components/Window.vue'
import Dock from './components/Dock.vue'
import SystemMenu from './components/SystemMenu.vue'
import DesktopMenu from './components/DesktopMenu.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import SystemTray from './components/SystemTray.vue'
import DesktopSwitcher from './components/DesktopSwitcher.vue'
import FileContextMenu from './components/FileContextMenu.vue'
import AppContextMenu from './components/AppContextMenu.vue'
import Launchpad from './components/Launchpad.vue'
import dragManager from './utils/dragManager'

// 初始化 store
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()
const desktopStore = useDesktopStore()
const configStore = useConfigStore()

// 响应式状态
const showSystemTray = ref(true)
const showDock = ref(true)
const dragState = ref(null)
const isMouseOverSystemTray = ref(false)
const isMouseOverDock = ref(false)
let dragAnimationFrame = null





// 计算属性
const windows = computed(() => {
  const currentDesktopId = desktopStore.currentDesktopId
  return windowStore.windows.filter(window => window.desktopId === currentDesktopId)
})

const desktopApps = computed(() => desktopStore.desktopApps)
const dockApps = computed(() => {
  // 从所有可用应用中过滤出当前桌面已打开或缓存的应用
  // 结合桌面应用和开始菜单应用，确保一级应用也能显示
  const desktopApps = desktopStore.desktopApps
  const startMenuApps = desktopStore.startMenuApps
  const flattenedApps = []
  
  // 递归扁平化应用列表
  const flattenApps = (apps) => {
    apps.forEach(app => {
      flattenedApps.push(app)
      if (app.children && app.children.length > 0) {
        flattenApps(app.children)
      }
    })
  }
  
  // 扁平化桌面应用和开始菜单应用
  flattenApps(desktopApps)
  flattenApps(startMenuApps)
  
  // 去重
  const uniqueApps = Array.from(new Map(flattenedApps.map(app => [app.id, app])).values())
  const currentDesktopId = desktopStore.currentDesktopId
  
  return uniqueApps.filter(app => {
    // 只考虑叶子节点应用
    if (app.type && app.type !== 'app') return false
    
    // 检查应用是否在当前桌面打开
    const isOpen = windowStore.isWindowOpen(app.id)
    
    // 检查应用是否在当前桌面有缓存实例
    const instances = microAppStore.getAppInstancesByName(app.id)
    const hasCachedInstance = instances.some(instance => {
      // 从缓存键中提取桌面 ID
      const cacheKeyParts = instance.cacheKey?.split('-')
      return cacheKeyParts && cacheKeyParts[1] === currentDesktopId.toString()
    })
    
    return isOpen || hasCachedInstance
  })
})
const startMenuApps = computed(() => desktopStore.startMenuApps)
const showSystemMenu = computed(() => desktopStore.showSystemMenu)
const showDesktopMenuVisible = computed(() => desktopStore.showDesktopMenuVisible)
const menuX = computed(() => desktopStore.menuX)
const menuY = computed(() => desktopStore.menuY)

// 新功能计算属性
const notifications = computed(() => desktopStore.notifications)
const showNotificationCenter = computed(() => desktopStore.showNotificationCenter)
const showFileSystem = computed(() => desktopStore.showFileSystem)
const showDesktopSwitcher = computed(() => desktopStore.showDesktopSwitcher)
const showLaunchpad = computed(() => desktopStore.showLaunchpad)

// 配置相关计算属性
const desktopConfig = computed(() => configStore.desktop)
const features = computed(() => configStore.features)

// 窗口状态计算属性
const hasMaximizedWindow = computed(() => {
  return windows.value.some(window => !window.minimized && window.maximized)
})

// 监听窗口变化
watch(windows, (newWindows) => {
  const hasMaximized = newWindows.some(window => !window.minimized && window.maximized)
  if (hasMaximized) {
    if (!isMouseOverSystemTray.value && !isMouseOverDock.value) {
      showSystemTray.value = false
      showDock.value = false
    }
  } else {
    showSystemTray.value = true
    showDock.value = true
  }
}, { deep: true })

// 边缘检测鼠标移动处理
const handleMouseMoveForEdgeDetection = (event) => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const edgeThreshold = 10
  
  const isAtTopEdge = event.clientY < edgeThreshold
  const isAtBottomEdge = event.clientY > windowHeight - edgeThreshold
  
  if (isAtTopEdge || isAtBottomEdge) {
    showSystemTray.value = true
    showDock.value = true
  }
}

// 窗口管理方法 - 保留用于系统菜单和其他组件

// 清理拖拽管理器
onUnmounted(() => {
  dragManager.destroy()
})





// 拖拽相关方法
const startDrag = (event, window) => {
  windowStore.activateWindow(window.id)
  
  const windowElement = document.querySelector(`[data-window-id="${window.id}"]`)
  if (windowElement) {
    windowElement.style.transition = 'none'
  }
  
  dragState.value = {
    window,
    startX: event.clientX,
    startY: event.clientY,
    startWindowX: window.x,
    startWindowY: window.y
  }
}

// 拖拽开始回调
const handleDragStart = (data, event) => {
  console.log('🚀 拖拽开始回调:', data)
  
  // 更新desktopStore状态
  desktopStore.startDrag()
  desktopStore.setDraggedIconIndex(data.index)
  desktopStore.startLongPress()
}

// 拖拽结束回调
const handleDragEnd = (data, event) => {
  // 退出拖拽状态
  desktopStore.endDrag()
  
  // 移除位置指示线
  dragManager.removePositionIndicator()
  
  // 计算目标位置
  const iconElements = document.querySelectorAll('.desktop-icon')
  let targetIndex = data.index
  
  if (iconElements.length > 0) {
    // 获取容器位置
    const container = document.querySelector('.desktop-icons')
    if (container) {
      const containerRect = container.getBoundingClientRect()
      
      // 检查是否在容器边缘
      const isTopEdge = event.clientY < containerRect.top + 50 // 顶部边缘阈值
      const isBottomEdge = event.clientY > containerRect.bottom - 50 // 底部边缘阈值
      
      if (isTopEdge) {
        // 在顶部边缘，移动到最前面
        targetIndex = 0
        console.log('✅ 拖拽到顶部边缘，移动到最前面:', data.index, '→', targetIndex)
      } else if (isBottomEdge) {
        // 在底部边缘，移动到最后面
        targetIndex = iconElements.length - 1
        console.log('✅ 拖拽到底部边缘，移动到最后面:', data.index, '→', targetIndex)
      } else if (iconElements.length > 1) {
        // 找到距离鼠标最近的元素
        let closestElement = null
        let closestIndex = -1
        let closestDistance = Infinity
        
        for (let i = 0; i < iconElements.length; i++) {
          if (i === data.index) continue
          
          const element = iconElements[i]
          const rect = element.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const distance = Math.sqrt(Math.pow(centerX - event.clientX, 2) + Math.pow(centerY - event.clientY, 2))
          
          if (distance < closestDistance) {
            closestDistance = distance
            closestElement = element
            closestIndex = i
          }
        }
        
        // 如果找到最近的元素，根据鼠标位置调整目标索引
        if (closestElement && closestIndex !== -1) {
          const rect = closestElement.getBoundingClientRect()
          
          // 根据鼠标位置确定目标索引
          if (event.clientY < rect.top + rect.height / 2) {
            // 鼠标在最近元素上方，移动到最近元素前面
            targetIndex = closestIndex
            console.log('✅ 拖拽到最近元素上方，移动到元素前面:', data.index, '→', targetIndex)
          } else {
            // 鼠标在最近元素下方，移动到最近元素后面
            targetIndex = closestIndex + 1
            console.log('✅ 拖拽到最近元素下方，移动到元素后面:', data.index, '→', targetIndex)
          }
        }
      }
    }
  }
  
  // 确保目标索引在有效范围内
  targetIndex = Math.max(0, Math.min(targetIndex, iconElements.length - 1))
  
  // 调整图标顺序
  if (targetIndex !== data.index) {
    desktopStore.reorderDesktopApps(data.index, targetIndex)
  }
  
  // 重置拖拽状态
  setTimeout(() => {
    desktopStore.setDraggedIconIndex(-1)
  }, 100)
}

// 拖拽移动回调
const handleDragMove = (data, event, deltaX, deltaY) => {
  // 计算目标位置并显示位置指示线
  const iconElements = document.querySelectorAll('.desktop-icon')
  const container = document.querySelector('.desktop-icons')
  
  if (iconElements.length > 0 && container) {
    // 获取容器位置和尺寸
    const containerRect = container.getBoundingClientRect()
    
    // 检查是否在容器边缘
    const isTopEdge = event.clientY < containerRect.top + 50 // 顶部边缘阈值
    const isBottomEdge = event.clientY > containerRect.bottom - 50 // 底部边缘阈值
    
    if (isTopEdge) {
      // 在容器顶部边缘，显示顶部指示线
      dragManager.createPositionIndicator(container, null, 'before', containerRect.height, true, false)
      console.log('📱 拖拽到顶部边缘')
    } else if (isBottomEdge) {
      // 在容器底部边缘，显示底部指示线
      dragManager.createPositionIndicator(container, null, 'after', containerRect.height, false, true)
      console.log('📱 拖拽到底部边缘')
    } else if (iconElements.length > 1) {
      // 找到距离鼠标最近的元素
      let closestElement = null
      let closestDistance = Infinity
      
      for (let i = 0; i < iconElements.length; i++) {
        if (i === data.index) continue
        
        const element = iconElements[i]
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.sqrt(Math.pow(centerX - event.clientX, 2) + Math.pow(centerY - event.clientY, 2))
        
        if (distance < closestDistance) {
          closestDistance = distance
          closestElement = element
        }
      }
      
      // 如果找到最近的元素，显示位置指示线
      if (closestElement) {
        const rect = closestElement.getBoundingClientRect()
        let position = 'before'
        
        // 根据鼠标位置确定指示线位置
        if (event.clientY < rect.top + rect.height / 2) {
          position = 'before'
        } else {
          position = 'after'
        }
        
        // 创建位置指示线
        dragManager.createPositionIndicator(container, closestElement, position)
        console.log('📱 拖拽到最近元素，显示指示线:', position)
      }
    }
  }
  
  console.log('📱 拖拽移动:', deltaX, deltaY)
}

// 菜单相关方法
const showDesktopMenu = (event) => {
  event.preventDefault()
  
  // 先关闭其他所有右键菜单
  closeAllContextMenus()
  
  // 计算菜单位置，确保不超出屏幕边界
  const menuWidth = 200 // 估计菜单宽度
  const menuHeight = 200 // 估计菜单高度
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
  
  desktopStore.showDesktopMenu(adjustedX, adjustedY)
  
  setTimeout(() => {
    document.addEventListener('click', closeDesktopMenu)
  }, 100)
}

const closeDesktopMenu = () => {
  desktopStore.closeDesktopMenu()
  document.removeEventListener('click', closeDesktopMenu)
}

// 关闭所有右键菜单
const closeAllContextMenus = () => {
  // 关闭所有右键菜单
  desktopStore.closeAllContextMenus()
  
  // 移除事件监听器
  document.removeEventListener('click', closeDesktopMenu)
}

const showSystemPreferences = () => {
  // 通过Window组件打开配置面板
  const configWindow = windowStore.createWindow('config-panel', '系统偏好设置', {
    width: 900,
    height: 600,
    x: (window.innerWidth - 900) / 2,
    y: (window.innerHeight - 600) / 2
  })
  desktopStore.closeDesktopMenu()
}

// 应用右键菜单方法
const showAppContextMenu = (event, app, isDesktop = false) => {
  console.log('📋 App.vue中监听到右键菜单事件:', app.name, isDesktop)
  desktopStore.showAppContextMenu(event, app, isDesktop)
}

// 全局鼠标事件处理
const handleMouseMove = (event) => {
  if (dragState.value) {
    if (dragAnimationFrame) {
      cancelAnimationFrame(dragAnimationFrame)
    }
    
    dragAnimationFrame = requestAnimationFrame(() => {
      const { window, startX, startY, startWindowX, startWindowY } = dragState.value
      const newX = startWindowX + (event.clientX - startX)
      const newY = startWindowY + (event.clientY - startY)
      
      window.x = newX
      window.y = newY
    })
  }
}

const handleMouseUp = (event) => {
  if (dragAnimationFrame) {
    cancelAnimationFrame(dragAnimationFrame)
    dragAnimationFrame = null
  }
  
  if (dragState.value) {
    const windowElement = document.querySelector(`[data-window-id="${dragState.value.window.id}"]`)
    if (windowElement) {
      setTimeout(() => {
        windowElement.style.transition = 'all 0.2s ease'
      }, 50)
    }
  }
  
  // 只重置窗口拖拽状态，图标拖拽状态由新的编辑模式处理
  dragState.value = null
}

// 生命周期
onMounted(async () => {
  // 初始化配置
  configStore.initialize()
  
  // 初始化应用配置
  await desktopStore.initializeAppConfig()
  
  // 初始化 micro-app
  initMicroApp()
  
  // 初始化子应用 store
  microAppStore.initialize()
  
  // 初始化拖拽管理
  const desktopIconsContainer = document.querySelector('.desktop-icons')
  if (desktopIconsContainer) {
    dragManager.initialize(
      desktopIconsContainer,
      handleDragStart,
      handleDragEnd,
      handleDragMove
    )
  }
  
  // 更新时间
  desktopStore.updateTime()
  setInterval(() => desktopStore.updateTime(), 1000)
  
  // 事件监听器
  window.addEventListener('mousemove', handleMouseMoveForEdgeDetection)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  
  // 为系统栏和dock添加鼠标事件监听器
  setTimeout(() => {
    const systemTrayElement = document.querySelector('.system-tray')
    const dockElement = document.querySelector('.dock')
    
    if (systemTrayElement) {
      systemTrayElement.addEventListener('mouseenter', () => {
        showSystemTray.value = true
        isMouseOverSystemTray.value = true
      })
      
      systemTrayElement.addEventListener('mouseleave', () => {
        isMouseOverSystemTray.value = false
        if (hasMaximizedWindow.value) {
          showSystemTray.value = false
        }
      })
    }
    
    if (dockElement) {
      dockElement.addEventListener('mouseenter', () => {
        showDock.value = true
        isMouseOverDock.value = true
      })

      dockElement.addEventListener('mouseleave', () => {
        isMouseOverDock.value = false
        if (hasMaximizedWindow.value) {
          showDock.value = false
        }
      })
    }
  }, 1000)
  

})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMoveForEdgeDetection)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  
  microAppStore.clearAllMicroApps()
})
</script>

<style src="./styles/main.css"/>
