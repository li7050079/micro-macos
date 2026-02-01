<template>
  <div class="launchpad-overlay" @click="handleOverlayClick" @contextmenu="handleOverlayContextMenu">
    <!-- 确保覆盖整个屏幕的背景层 -->
    <div class="launchpad-background" @click="closeLaunchpad" @contextmenu="(event) => {
      event.preventDefault();
      closeLaunchpad();
    }"></div>
    
    <div class="launchpad-apps">
      <template v-for="app in displayApps" :key="app.id">
        <div 
          class="launchpad-app"
          @click.stop="handleAppClick(app, $event)"
          @contextmenu="(event) => {
            event.preventDefault();
            event.stopPropagation();
            showAppContextMenu(event, app, false);
          }"
        >
          <div class="launchpad-app-icon">
            <img :src="app.icon" :alt="app.name" />
            <span v-if="app.type === 'folder'" class="folder-window-item-bubble">{{ app.children?.length || 0 }}</span>
          </div>
          <div class="launchpad-app-name">{{ app.name }}</div>
        </div>
      </template>
    </div>
    
    <!-- 文件夹弹窗 -->
    <div v-if="showFolderPopup" class="launchpad-folder-popup" :style="folderPopupStyle">
      <div class="launchpad-folder-apps">
        <template v-for="app in currentFolder?.children" :key="app.id">
          <div 
              class="launchpad-app"
              @click.stop="handleAppClick(app, $event)"
              @contextmenu="(event) => {
                event.preventDefault();
                event.stopPropagation();
                showAppContextMenu(event, app, false);
              }"
            >
            <div class="launchpad-app-icon">
              <img :src="app.icon" :alt="app.name" />
              <span v-if="app.type === 'folder'" class="folder-window-item-bubble">{{ app.children?.length || 0 }}</span>
            </div>
            <div class="launchpad-app-name">{{ app.name }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useWindowStore } from '../stores/windowStore'
import { useMicroAppStore } from '../stores/microAppStore'

// Props
const props = defineProps({
  startMenuApps: {
    type: Array,
    default: () => []
  }
})

// Stores
const desktopStore = useDesktopStore()
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()

// State
const showFolderPopup = ref(false)
const currentFolder = ref(null)
const folderPopupPosition = ref({ x: 0, y: 0 })
const folderPopupInitialPosition = ref({ x: 0, y: 0 })
const hasInitialPosition = ref(false)

// Computed
const displayApps = computed(() => {
  // 只显示一级应用，不显示二级应用
  const allApps = props.startMenuApps || []
  // 按类型分组，文件夹在前
  return allApps.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  })
})

const folderPopupStyle = computed(() => {
  return {
    left: `${folderPopupPosition.value.x}px`,
    top: `${folderPopupPosition.value.y}px`
  }
})

// Methods
const closeLaunchpad = () => {
  desktopStore.toggleLaunchpad()
}

const handleOverlayClick = (event) => {
  // 只有点击遮罩层本身时才关闭
  if (showFolderPopup.value) {
    closeFolderPopup()
    return
  }
  closeLaunchpad()
}

// 右键点击空白处关闭launchpad
const handleOverlayContextMenu = (event) => {
  if (event.target === event.currentTarget) {
    event.preventDefault()
    closeLaunchpad()
  }
}

const handleAppClick = (app, event) => {
  if (app.type === 'folder' && app.children && app.children.length > 0) {
    // 显示文件夹弹窗
    currentFolder.value = app
    showFolderPopup.value = true
    
    // 计算弹窗位置，确保不超出边界且保持原位置
    if (event && !hasInitialPosition.value) {
      const rect = event.currentTarget.getBoundingClientRect()
      const popupWidth = 600
      const popupHeight = 400
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // 计算居中位置，确保不超出边界
      let x = rect.left + rect.width / 2 - popupWidth / 2
      let y = rect.top + rect.height + 10
      
      // 调整X坐标，确保弹窗不超出屏幕边界
      if (x < 20) {
        x = 20
      } else if (x + popupWidth > screenWidth - 20) {
        x = screenWidth - popupWidth - 20
      }
      
      // 调整Y坐标，确保弹窗不超出屏幕边界
      if (y + popupHeight > screenHeight - 20) {
        y = rect.top - popupHeight - 10
        // 如果还是超出上边界，调整到顶部
        if (y < 20) {
          y = 20
        }
      }
      
      // 保存初始位置
      folderPopupInitialPosition.value = { x, y }
      hasInitialPosition.value = true
      
      folderPopupPosition.value = {
        x: x,
        y: y
      }
    } else {
      // 使用保存的初始位置
      folderPopupPosition.value = {
        x: folderPopupInitialPosition.value.x,
        y: folderPopupInitialPosition.value.y
      }
    }
  } else {
    // 打开应用
    openApp(app)
    closeLaunchpad()
  }
}

const openApp = (app) => {
  // 只处理叶子节点应用
  const newWindow = windowStore.createWindow(app.id, app.name)
  
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

const showAppContextMenu = (event, app, isDesktop) => {
  event.preventDefault()
  event.stopPropagation()
  desktopStore.showAppContextMenu(event, app, isDesktop)
  // 应用上右键不关闭launchpad，只在空白处右键关闭
}

// 关闭文件夹弹窗
const closeFolderPopup = () => {
  showFolderPopup.value = false
  currentFolder.value = null
  // 重置初始位置状态
  hasInitialPosition.value = false
  folderPopupInitialPosition.value = { x: 0, y: 0 }
}
</script>

<style scoped>
.launchpad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 阻止浏览器右键菜单 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 背景层，用于捕获空白区域的点击事件 */
.launchpad-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}


.launchpad-apps {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 30px;
  overflow-y: auto;
  align-content: start;
}

.launchpad-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 120px;
  justify-content: center;
}

.launchpad-app:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.launchpad-app-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.launchpad-app-icon img {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.launchpad-app-name {
  font-size: 14px;
  color: var(--text-color);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  font-weight: 500;
}

/* 文件夹弹窗 */
.launchpad-folder-popup {
  position: absolute;
  z-index: 4;
  width: 600px;
  background: var(--shadow-color);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(--shadow-color);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: hidden;
}

/* 文件夹弹窗的背景遮罩 */
.launchpad-folder-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  background: transparent;
}

.launchpad-folder-apps {
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  max-height: 400px;
  overflow-y: auto;
}

/* 滚动条样式 */
.launchpad-apps::-webkit-scrollbar,
.launchpad-folder-apps::-webkit-scrollbar {
  width: 8px;
}

.launchpad-apps::-webkit-scrollbar-track,
.launchpad-folder-apps::-webkit-scrollbar-track {
  background: transparent;
}

.launchpad-apps::-webkit-scrollbar-thumb,
.launchpad-folder-apps::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.launchpad-apps::-webkit-scrollbar-thumb:hover,
.launchpad-folder-apps::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .launchpad-apps {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 20px;
    padding: 40px;
  }
  
  .launchpad-app-icon {
    width: 64px;
    height: 64px;
  }
  
  .launchpad-app {
    min-height: 100px;
  }
}

@media (max-width: 768px) {
  .launchpad-apps {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 15px;
    padding: 20px;
  }
  
  .launchpad-app-icon {
    width: 56px;
    height: 56px;
  }
  
  .launchpad-app-name {
    font-size: 12px;
    max-width: 80px;
  }
}
</style>