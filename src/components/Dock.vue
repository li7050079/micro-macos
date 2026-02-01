<template>
  <div 
    class="dock" 
    :style="dockStyle"
    :class="{ 'hidden': dockConfig.hide || !showDock }"
  >
    <div class="dock-items" :style="{
      flexDirection: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'column' : 'row'
    }">
      <div 
        v-for="app in dockApps" 
        :key="app.id" 
        class="dock-item"
        :style="{
          width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
          height: `${dockConfig.iconSize + 8}px`,
          transition: 'transform 0.2s ease'
        }"
        @click="openApp(app)"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <img :src="app.icon" :alt="app.name" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
        <div class="dock-badge" v-if="app.badge">{{ app.badge }}</div>
      </div>
    </div>
    <div class="dock-separator" :style="{
      width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? '32px' : '1px',
      height: (dockConfig.position === 'left' || dockConfig.position === 'right') ? '1px' : '32px',
      margin: (dockConfig.position === 'left' || dockConfig.position === 'right') ? '8px 0' : '0 8px'
    }"></div>
    <div class="dock-system" :style="{
      flexDirection: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'column' : 'row'
    }">
      <div class="dock-item" :style="{
        width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
        height: `${dockConfig.iconSize + 8}px`,
        transition: 'transform 0.2s ease'
      }" @click="toggleFileSystem"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave" title="文件系统">
        <img src="@/assets/icons/system/finder.png" alt="文件系统" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
      </div>
      <div class="dock-item" :style="{
        width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
        height: `${dockConfig.iconSize + 8}px`,
        transition: 'transform 0.2s ease'
      }" @click="toggleSystemMenu"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave" title="应用菜单">
        <img src="@/assets/icons/system/launchpad.png" alt="应用菜单" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
      </div>
      <div class="dock-item" :style="{
        width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
        height: `${dockConfig.iconSize + 8}px`,
        transition: 'transform 0.2s ease'
      }" @click="toggleDesktopSwitcher"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave" title="多桌面切换">
        <img src="@/assets/icons/system/desktop-switch.png" alt="多桌面切换" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
      </div>
      <div class="dock-item" :style="{
        width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
        height: `${dockConfig.iconSize + 8}px`,
        transition: 'transform 0.2s ease'
      }"
      @click="showSystemPreferences"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave" title="系统偏好设置">
        <img src="@/assets/icons/system/settings.png" alt="系统偏好设置" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
      </div>
      <div class="dock-item" :style="{
        width: (dockConfig.position === 'left' || dockConfig.position === 'right') ? 'auto' : `${dockConfig.iconSize + 8}px`,
        height: `${dockConfig.iconSize + 8}px`,
        transition: 'transform 0.2s ease'
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave" title="回收站">
        <img src="@/assets/icons/system/trash.png" alt="回收站" class="dock-icon" :style="{
          width: `${dockConfig.iconSize}px`,
          height: `${dockConfig.iconSize}px`
        }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useConfigStore } from '../stores/configStore'
import { useWindowStore } from '../stores/windowStore'
import { useMicroAppStore } from '../stores/microAppStore'
// Emits
const emit = defineEmits([
  'systemPreferencesShow',
])
// Props
const props = defineProps({
  dockApps: {
    type: Array,
    default: () => []
  },
  showDock: {
    type: Boolean,
    default: true
  }
})

// Stores
const configStore = useConfigStore()
const desktopStore = useDesktopStore()
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()

// Computed properties
const dockConfig = computed(() => configStore.dock || {
  position: 'bottom',
  size: 56,
  iconSize: 32,
  magnification: true,
  magnificationSize: 48,
  hide: false,
  autohide: false
})

const dockStyle = computed(() => {
  const position = dockConfig.value.position || 'bottom'
  const size = dockConfig.value.size || 56
  return {
    position: 'fixed',
    [position]: '16px',
    left: position === 'bottom' || position === 'top' ? '50%' : position === 'left' ? '16px' : 'auto',
    right: position === 'right' ? '16px' : 'auto',
    top: position === 'top' ? '16px' : 'auto',
    bottom: position === 'left' || position === 'right' ? '50%' : position === 'bottom' ? '16px' : 'auto',
    transform: position === 'bottom' || position === 'top' ? `translateX(-50%)` : `translateY(50%)`,
    height: (position === 'bottom' || position === 'top') ? `${size}px` : 'auto',
    width: (position === 'left' || position === 'right') ? `${size}px` : 'auto',
    flexDirection: (position === 'left' || position === 'right') ? 'column' : 'row'
  }
})

// Methods
const openApp = (app) => {
  // 检查应用是否为文件夹类型
  if (app.type === 'folder' && app.children && app.children.length > 0) {
    // 对于文件夹类型，显示子菜单
    console.log('📁 打开文件夹:', app.name)
    return
  }
  
  // 只处理叶子节点应用
  const newWindow = windowStore.createWindow(app.id, app.name)
  
  if (desktopStore.showSystemMenu) {
    desktopStore.toggleSystemMenu()
  }
  
  setTimeout(() => {
    const cacheKey = `${app.id}-${desktopStore.currentDesktopId}`
    const microAppLoaded = microAppStore.loadMicroApp(app.id, newWindow.containerId, cacheKey)
    
    if (!microAppLoaded) {
      const container = document.getElementById(newWindow.containerId)
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--background-color);">
            <img src="${app.icon}" alt="${app.name}" style="width: 80px; height: 80px; margin-bottom: 20px;">
            <h2 style="color: var(--text-color); margin-bottom: 10px;">${app.name}</h2>
            <p style="color: var(--secondary-text-color); text-align: center;">系统页面正在开发中...</p>
            <p style="color: var(--secondary-text-color); text-align: center; margin-top: 10px;">App ID: ${app.id}</p>
            <p style="color: var(--secondary-text-color); text-align: center; margin-top: 5px;">桌面: ${desktopStore.currentDesktopId}</p>
          </div>
        `
      }
    }
  }, 100)
}
const showSystemPreferences = () => {
  // 触发系统偏好设置事件
  emit('systemPreferencesShow')
  console.log('Showing system preferences')
}
const toggleFileSystem = () => {
  // 通过Window组件打开文件系统
  windowStore.createWindow('file-system', '文件系统', {
    width: 800,
    height: 600,
    x: (window.innerWidth - 800) / 2,
    y: (window.innerHeight - 600) / 2
  })
}

const toggleSystemMenu = () => {
  desktopStore.toggleLaunchpad()
}

const toggleDesktopSwitcher = () => {
  desktopStore.toggleDesktopSwitcher()
}

const handleMouseEnter = (event) => {
  const magnification = dockConfig.value.magnification || false
  const magnificationSize = dockConfig.value.magnificationSize || 48
  const iconSize = dockConfig.value.iconSize || 32
  
  if (magnification) {
    event.currentTarget.style.transform = `scale(${magnificationSize / iconSize})`
  }
}

const handleMouseLeave = (event) => {
  event.currentTarget.style.transform = 'scale(1)'
}
</script>
