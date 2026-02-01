<template>
  <div class="system-menu" :style="systemMenuStyle">
    <div class="system-menu-apps">
      <template v-for="app in startMenuApps" :key="app.id">
        <div 
            v-if="app.type === 'app' || !app.children || app.children.length === 0" 
            class="system-menu-item"
            @click="openApp(app)"
            @contextmenu="showAppContextMenu($event, app, false)"
          >
            <img :src="app.icon" :alt="app.name" class="system-menu-icon" />
            <span>{{ app.name }}</span>
          </div>
        <div v-else class="system-menu-folder">
          <div class="system-menu-item folder-item" @click.stop @contextmenu="showAppContextMenu($event, app, false)">
            <img :src="app.icon" :alt="app.name" class="system-menu-icon" />
            <span>{{ app.name }}</span>
            <span class="folder-arrow">▶</span>
            <div class="system-menu-submenu">
              <template v-for="childApp in app.children" :key="childApp.id">
                <div 
                  v-if="childApp.type === 'app' || !childApp.children || childApp.children.length === 0" 
                  class="system-menu-item"
                  @click="openApp(childApp)"
                  @contextmenu="showAppContextMenu($event, childApp, false)"
                >
                  <img :src="childApp.icon" :alt="childApp.name" class="system-menu-icon" />
                  <span>{{ childApp.name }}</span>
                </div>
                <div v-else class="system-menu-folder">
                  <div class="system-menu-item folder-item" @click.stop @contextmenu="showAppContextMenu($event, childApp, false)">
                    <img :src="childApp.icon" :alt="childApp.name" class="system-menu-icon" />
                    <span>{{ childApp.name }}</span>
                    <span class="folder-arrow">▶</span>
                    <div class="system-menu-submenu">
                      <div 
                        v-for="grandchildApp in childApp.children" 
                        :key="grandchildApp.id"
                        class="system-menu-item"
                        @click="openApp(grandchildApp)"
                        @contextmenu="showAppContextMenu($event, grandchildApp, false)"
                      >
                        <img :src="grandchildApp.icon" :alt="grandchildApp.name" class="system-menu-icon" />
                        <span>{{ grandchildApp.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  
  <!-- 应用右键菜单 -->
  <AppContextMenu 
    v-if="desktopStore.showAppContextMenuVisible"
    :selected-app="desktopStore.selectedApp"
    :app-context-menu-x="desktopStore.appContextMenuX"
    :app-context-menu-y="desktopStore.appContextMenuY"
    :is-desktop-app="desktopStore.isDesktopApp"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useDesktopStore } from '../stores/desktopStore'
import { useWindowStore } from '../stores/windowStore'
import { useMicroAppStore } from '../stores/microAppStore'
import AppContextMenu from './AppContextMenu.vue'

// Props
const props = defineProps({
  startMenuApps: {
    type: Array,
    default: () => []
  }
})

// Stores
const configStore = useConfigStore()
const desktopStore = useDesktopStore()
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()



// Computed properties
const dockConfig = computed(() => configStore.dock)

const systemMenuStyle = computed(() => {
  const position = dockConfig.value.position
  const size = dockConfig.value.size + 0 // 包含边距
  
  switch (position) {
    case 'bottom':
      return {
        bottom: `${size}px`,
        left: '50%',
        right: 'auto',
        top: 'auto',
        transform: 'translateX(-50%)',
        marginLeft: '0'
      }
    case 'left':
      return {
        left: `${size}px`,
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        marginLeft: '0'
      }
    case 'right':
      return {
        right: `${size}px`,
        top: '50%',
        left: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        marginLeft: '0'
      }
    case 'top':
      return {
        top: `${size}px`,
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateX(-50%)',
        marginLeft: '0'
      }
    default:
      return {
        bottom: '80px',
        left: '50%',
        marginLeft: '-160px'
      }
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

const showAppContextMenu = (event, app, isDesktop) => {
  desktopStore.showAppContextMenu(event, app, isDesktop)
  console.log('🎯 显示应用右键菜单:', { app, isDesktop })
}

const closeAppContextMenu = () => {
  desktopStore.closeAppContextMenu()
}

// 生命周期
onMounted(() => {
  // 添加系统菜单子菜单的定位
  setTimeout(() => {
    const updateSubmenuPosition = (folderItem) => {
      const submenu = folderItem.querySelector('.system-menu-submenu')
      if (submenu) {
        const folderRect = folderItem.getBoundingClientRect()
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const menuWidth = 200
        
        // 计算实际菜单高度
        const menuItems = submenu.querySelectorAll('.system-menu-item')
        const menuHeight = Math.min(300, menuItems.length * 36 + 20)
        
        // 简单的位置计算
        let rightPosition = -menuWidth
        if (folderRect.right + menuWidth > screenWidth) {
          rightPosition = menuWidth
        }
        
        let topPosition = 0
        if (folderRect.top + menuHeight > screenHeight) {
          topPosition = screenHeight - folderRect.top - menuHeight
        }
        if (topPosition < 0) {
          topPosition = 0
        }
        
        // 应用样式
        submenu.style.right = `${rightPosition}px`
        submenu.style.top = `${topPosition}px`
        
        // 递归处理子菜单中的文件夹
        const childFolderItems = submenu.querySelectorAll('.system-menu-folder')
        childFolderItems.forEach(childFolderItem => {
          updateSubmenuPosition(childFolderItem)
        })
      }
    }
    
    // 为所有文件夹项添加鼠标进入事件监听器
    const folderItems = document.querySelectorAll('.system-menu-folder')
    folderItems.forEach(folderItem => {
      folderItem.addEventListener('mouseenter', () => {
        updateSubmenuPosition(folderItem)
      })
    })
  }, 1500)
})
</script>
