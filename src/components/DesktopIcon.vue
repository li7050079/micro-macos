<template>
  <div 
    class="desktop-icon" 
    :class="{
      'desktop-folder': app.type === 'folder' && app.children && app.children.length > 0,
      'dragging': draggedIconIndex === index,
      'long-pressing': isLongPressing
    }"
    :style="{
      width: `${desktopConfig.iconGridSize - 10}px`,
      cursor: isLongPressing || isDragging ? 'grabbing' : 'pointer'
    }"
    @click="(event) => handleIconClick(event, app, index)"
    @mousedown="(event) => handleIconMouseDown(event, app, index)"
    @mousemove="(event) => handleIconMouseMove(event, app, index)"
    @mouseup="(event) => handleIconMouseUp(event, app, index)"
    @mouseleave="handleIconMouseLeave"
    @contextmenu="showAppContextMenu($event, app, true)"
  >
    <div class="icon-wrapper" :style="{
      width: `${desktopConfig.iconSize}px`,
      height: `${desktopConfig.iconSize}px`
    }">
      <img :src="app.icon" :alt="app.name" class="mac-icon" :style="{
        width: `${desktopConfig.iconSize * 0.75}px`,
        height: `${desktopConfig.iconSize * 0.75}px`
      }" draggable="false" @mousedown.prevent @dragstart.prevent />
      <div v-if="app.type === 'folder' && app.children && app.children.length > 0" class="folder-bubble">
        <span class="folder-bubble-count">{{ app.children.length }}</span>
      </div>
    </div>
    <div class="icon-label">{{ app.name }}</div>
  </div>
  
  <!-- 使用 Teleport 将文件夹窗口传送到 body 下 -->
  <Teleport to="body">
    <div 
      v-if="showFolderWindow && selectedFolderApp"
      class="folder-window"
      @click="closeFolderWindow"
    >
      <div class="folder-window-content" @click.stop>
        <div class="folder-window-header">
          <img :src="selectedFolderApp.icon" :alt="selectedFolderApp.name" class="folder-window-icon" />
          <span class="folder-window-title">{{ selectedFolderApp.name }}</span>
          <button class="folder-window-close" @click="closeFolderWindow" title="关闭通知中心" />
        </div>
        <div class="folder-window-grid">
          <div 
            v-for="childApp in selectedFolderApp.children" 
            :key="childApp.id"
            class="folder-window-item"
            @click="handleFolderWindowItemClick(childApp)"
            @contextmenu="showAppContextMenu($event, childApp, false)"
          >
            <div class="folder-window-item-icon">
              <img :src="childApp.icon" :alt="childApp.name" />
              <div v-if="childApp.type === 'folder' && childApp.children && childApp.children.length > 0" class="folder-window-item-bubble">
                <span>{{ childApp.children.length }}</span>
              </div>
            </div>
            <div class="folder-window-item-label">{{ childApp.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useConfigStore } from '../stores/configStore'
import { useWindowStore } from '../stores/windowStore'
import { useMicroAppStore } from '../stores/microAppStore'
import dragManager from '../utils/dragManager'

// Props
const props = defineProps({
  app: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  draggedIconIndex: {
    type: Number,
    default: -1
  },
  isLongPressing: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'iconClick',
  'iconMouseDown',
  'iconMouseMove',
  'iconMouseUp',
  'iconMouseLeave',
  'appContextMenu'
])

// Stores
const desktopStore = useDesktopStore()
const configStore = useConfigStore()
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()

// Computed properties
const desktopConfig = computed(() => configStore.desktop)

// Drag state
const longPressTimer = ref(null)
const longPressThreshold = 500 // 长按阈值，毫秒

// Folder window state
const showFolderWindow = ref(false)
const selectedFolderApp = ref(null)

// Methods
// 打开文件夹窗口
const openFolderWindow = (app) => {
  selectedFolderApp.value = app
  showFolderWindow.value = true
  
  // 点击其他地方关闭文件夹窗口
  setTimeout(() => {
    document.removeEventListener('click', closeFolderWindow)
    document.addEventListener('click', closeFolderWindow)
  }, 100)
}

// 关闭文件夹窗口
const closeFolderWindow = (event) => {
  // debugger
  // if (event) {
  //   const folderWindow = document.querySelector('.folder-window')
  //   if (folderWindow && folderWindow.contains(event.target)) {
  //     return
  //   }
  // }
  
  showFolderWindow.value = false
  selectedFolderApp.value = null
  document.removeEventListener('click', closeFolderWindow)
}

// 处理文件夹窗口项点击
const handleFolderWindowItemClick = (childApp) => {
  if (childApp.type === 'folder' && childApp.children && childApp.children.length > 0) {
    // 对于文件夹类型，继续展开子级
    selectedFolderApp.value = childApp
  } else {
    // 对于非文件夹类型，打开应用
    openApp(childApp)
    closeFolderWindow()
  }
}

const openApp = (app, event = null) => {
  // 检查应用是否为文件夹类型
  if (app.type === 'folder' && app.children && app.children.length > 0) {
    // 对于文件夹类型，显示文件夹窗口
    console.log('📁 打开文件夹:', app.name)
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    openFolderWindow(app)
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

const handleIconClick = (event, app, index) => {
  // 获取图标元素
  const iconElement = event.target.closest('.desktop-icon')
  
  if (props.isDragging) {
    // 在拖拽模式下，点击不打开应用，提供视觉反馈
    if (iconElement) {
      iconElement.style.transform = 'scale(0.95)'
      setTimeout(() => {
        iconElement.style.transform = ''
      }, 100)
    }
    console.log('🎯 拖拽模式下点击，不打开应用:', { app, index })
  } else {
    // 正常模式下，打开应用
    openApp(app, event)
    console.log('🎯 正常模式下点击，打开应用:', { app, index })
  }
}

const handleIconMouseDown = (event, app, index) => {
  // 只处理左键点击
  if (event.button !== 0) return
  
  // 阻止默认行为，防止浏览器拖拽图片
  event.preventDefault()
  
  // 获取图标元素
  const iconElement = event.target.closest('.desktop-icon')
  if (!iconElement) return
  
  // 清除之前的定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 保存初始状态
  const startX = event.clientX
  const startY = event.clientY
  
  // 设置长按定时器
  longPressTimer.value = setTimeout(() => {
    // 进入长按状态
    // 启动拖拽
    dragManager.startDrag(iconElement, { app, index }, event)
    console.log('🎯 长按触发，进入编辑模式:', { app, index })
  }, longPressThreshold)
  
  console.log('🎯 鼠标按下，开始检测长按:', { app, index })
}

const handleIconMouseMove = (event, app, index) => {
  // 这里可以添加鼠标移动的逻辑
  console.log('🎯 鼠标移动:', { app, index })
}

const handleIconMouseUp = (event, app, index) => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 获取图标元素
  const iconElement = event.target.closest('.desktop-icon')
  
  // 注意：不要在这里重置样式，因为拖拽状态由dragManager管理
  // 拖拽结束时，dragManager会自动重置样式
  
  if (props.isLongPressing || props.isDragging) {
    // 在长按或拖拽状态下，释放鼠标不会打开应用
    console.log('🎯 长按/拖拽状态下释放鼠标，不打开应用:', { app, index })
  } else {
    // 非长按状态，正常处理
    console.log('🎯 正常状态下释放鼠标:', { app, index })
  }
}

const handleIconMouseLeave = (event) => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 如果处于长按状态，重置样式
  if (props.isLongPressing) {
    const iconElement = event.target.closest('.desktop-icon')
    if (iconElement) {
      iconElement.style.transform = ''
      iconElement.style.boxShadow = ''
      iconElement.style.border = ''
      iconElement.style.transition = ''
    }
    
    console.log('🎯 长按状态下鼠标离开，退出长按状态')
  }
}

const showAppContextMenu = (event, app, isDesktop) => {
  console.log('📋 文件夹窗口中触发右键菜单:', app.name, isDesktop)
  event.preventDefault()
  event.stopPropagation()
  emit('appContextMenu', event, app, isDesktop)
}
</script>
