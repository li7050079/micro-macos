<template>
  <div 
    class="window"
    :class="{ 'active': window.active, 'maximized': window.maximized }"
    :data-window-id="window.id"
    :style="{
      left: window.x + 'px',
      top: window.y + 'px',
      width: window.width + 'px',
      height: window.height + 'px'
    }"
    @click="activateWindow(window)"
  >
    <!-- 窗口拖拽句柄 -->
    <div class="window-resize-handles">
      <div class="resize-handle top" @mousedown="startResize($event, window, 'top')"></div>
      <div class="resize-handle right" @mousedown="startResize($event, window, 'right')"></div>
      <div class="resize-handle bottom" @mousedown="startResize($event, window, 'bottom')"></div>
      <div class="resize-handle left" @mousedown="startResize($event, window, 'left')"></div>
      <div class="resize-handle top-left" @mousedown="startResize($event, window, 'top-left')"></div>
      <div class="resize-handle top-right" @mousedown="startResize($event, window, 'top-right')"></div>
      <div class="resize-handle bottom-left" @mousedown="startResize($event, window, 'bottom-left')"></div>
      <div class="resize-handle bottom-right" @mousedown="startResize($event, window, 'bottom-right')"></div>
    </div>
    
    <div class="window-header" @mousedown="startDrag($event, window)">
      <div class="window-title">{{ window.title }}</div>
      <div class="window-controls">
        <button class="window-control minimize" @click.stop="minimizeWindow(window)" title="最小化"></button>
        <button class="window-control maximize" @click.stop="maximizeWindow(window)" title="最大化"></button>
        <button class="window-control close" @click.stop="closeWindow(window)" title="关闭"></button>
      </div>
    </div>
    <div class="window-content" ref="contentRef">
      <!-- 本地组件 -->
      <template v-if="window.appId === 'file-system'">
        <FileSystem />
      </template>
      <template v-else-if="window.appId === 'config-panel'">
        <ConfigPanel @close="() => closeWindow(window.id)" />
      </template>
      <!-- 外部微应用容器 -->
      <template v-else>
        <div 
          :id="window.containerId" 
          class="app-container"
          :data-app-id="window.appId"
          ref="containerRef"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useWindowStore } from '../stores/windowStore'
import { useMicroAppStore } from '../stores/microAppStore'
import { useDesktopStore } from '../stores/desktopStore'
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import FileSystem from './FileSystem.vue'
import ConfigPanel from './ConfigPanel.vue'

// Props
const props = defineProps({
  window: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'windowDragStart'
])

// Refs
const contentRef = ref(null)
const containerRef = ref(null)

// Stores
const windowStore = useWindowStore()
const microAppStore = useMicroAppStore()
const desktopStore = useDesktopStore()

// Methods
const activateWindow = (window) => {
  windowStore.activateWindow(window.id)
  
  // 调整容器尺寸
  nextTick(() => {
    adjustMicroAppSize()
  })
}

const minimizeWindow = (window) => {
  windowStore.minimizeWindow(window.id)
}

const maximizeWindow = (window) => {
  windowStore.maximizeWindow(window.id)
  
  // 调整微应用容器尺寸
  nextTick(() => {
    adjustMicroAppSize()
  })
}

const closeWindow = (window) => {
  windowStore.closeWindow(window.id)
}

const startDrag = (event, window) => {
  activateWindow(window)
  emit('windowDragStart', event, window)
}

// 开始调整窗口大小
const startResize = (event, window, direction) => {
  event.preventDefault()
  activateWindow(window)
  
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = window.width
  const startHeight = window.height
  const startXPos = window.x
  const startYPos = window.y
  
  // 最小窗口尺寸
  const minWidth = 200
  const minHeight = 150
  
  // 禁用窗口过渡效果
  const windowElement = document.querySelector(`[data-window-id="${window.id}"]`)
  if (windowElement) {
    windowElement.style.transition = 'none'
  }
  
  let resizeAnimationFrame = null
  
  // 鼠标移动事件处理
  const handleMouseMove = (moveEvent) => {
    if (resizeAnimationFrame) {
      cancelAnimationFrame(resizeAnimationFrame)
    }
    
    resizeAnimationFrame = requestAnimationFrame(() => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startXPos
      let newY = startYPos
      
      // 根据方向调整窗口大小
      switch (direction) {
        case 'top':
          newHeight = Math.max(minHeight, startHeight - deltaY)
          newY = startYPos + (startHeight - newHeight)
          break
        case 'right':
          newWidth = Math.max(minWidth, startWidth + deltaX)
          break
        case 'bottom':
          newHeight = Math.max(minHeight, startHeight + deltaY)
          break
        case 'left':
          newWidth = Math.max(minWidth, startWidth - deltaX)
          newX = startXPos + (startWidth - newWidth)
          break
        case 'top-left':
          newWidth = Math.max(minWidth, startWidth - deltaX)
          newHeight = Math.max(minHeight, startHeight - deltaY)
          newX = startXPos + (startWidth - newWidth)
          newY = startYPos + (startHeight - newHeight)
          break
        case 'top-right':
          newWidth = Math.max(minWidth, startWidth + deltaX)
          newHeight = Math.max(minHeight, startHeight - deltaY)
          newY = startYPos + (startHeight - newHeight)
          break
        case 'bottom-left':
          newWidth = Math.max(minWidth, startWidth - deltaX)
          newHeight = Math.max(minHeight, startHeight + deltaY)
          newX = startXPos + (startWidth - newWidth)
          break
        case 'bottom-right':
          newWidth = Math.max(minWidth, startWidth + deltaX)
          newHeight = Math.max(minHeight, startHeight + deltaY)
          break
      }
      
      // 更新窗口状态
      windowStore.updateWindow(window.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      })
    })
  }
  
  // 鼠标释放事件处理
  const handleMouseUp = () => {
    if (resizeAnimationFrame) {
      cancelAnimationFrame(resizeAnimationFrame)
    }
    
    // 恢复窗口过渡效果
    if (windowElement) {
      setTimeout(() => {
        windowElement.style.transition = 'all 0.2s ease'
      }, 50)
    }
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  // 添加事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 调整微应用容器尺寸
const adjustMicroAppSize = () => {
  if (!contentRef.value || !containerRef.value) return
  
  // 获取内容区域的实际尺寸
  const contentRect = contentRef.value.getBoundingClientRect()
  console.log('📏 调整微应用容器尺寸:', {
    containerId: props.window.containerId,
    appId: props.window.appId,
    width: contentRect.width,
    height: contentRect.height
  })
  
  // 设置容器尺寸
  containerRef.value.style.width = `${contentRect.width}px`
  containerRef.value.style.height = `${contentRect.height}px`
  containerRef.value.style.minHeight = '200px'
  containerRef.value.style.minWidth = '300px'
  
  // 查找并调整iframe尺寸
  const iframe = containerRef.value.querySelector('iframe')
  if (iframe) {
    iframe.style.width = `${contentRect.width}px`
    iframe.style.height = `${contentRect.height}px`
    iframe.style.border = 'none'
    iframe.style.display = 'block'
    console.log('📏 调整iframe尺寸:', {
      width: contentRect.width,
      height: contentRect.height
    })
  }
  
  // 查找并调整micro-app元素尺寸
  const microAppElement = containerRef.value.querySelector('micro-app')
  if (microAppElement) {
    microAppElement.style.width = `${contentRect.width}px`
    microAppElement.style.height = `${contentRect.height}px`
    console.log('📏 调整micro-app元素尺寸:', {
      width: contentRect.width,
      height: contentRect.height
    })
  }
  
  // 强制触发重排
  containerRef.value.offsetHeight
}

// 监听窗口尺寸变化
watch(() => props.window.width, () => {
  nextTick(() => {
    adjustMicroAppSize()
  })
})

watch(() => props.window.height, () => {
  nextTick(() => {
    adjustMicroAppSize()
  })
})

watch(() => props.window.maximized, () => {
  nextTick(() => {
    adjustMicroAppSize()
  })
})

// 当窗口组件挂载时，调整容器尺寸
onMounted(() => {
  console.log('🖼️ 窗口组件挂载:', props.window.appId)
  
  // 调整容器尺寸
  nextTick(() => {
    adjustMicroAppSize()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', adjustMicroAppSize)
})

// 当窗口组件卸载时，保留微应用实例记录
// 注意：不再清理微应用实例，以保持缓存状态
onUnmounted(() => {
  console.log('🗑️ 窗口组件卸载:', props.window.appId)
  // 切换桌面时保留微应用实例，确保重新挂载时能恢复状态
  console.log('💾 保留微应用实例，保持缓存状态:', props.window.appId)
  
  // 移除事件监听
  window.removeEventListener('resize', adjustMicroAppSize)
})
</script>

<style scoped>
/* 窗口拖拽句柄样式 */
.window-resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  pointer-events: auto;
  background: transparent;
  z-index: 10;
}

/* 边缘拖拽句柄 */
.resize-handle.top {
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: ns-resize;
}

.resize-handle.right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
}

.resize-handle.bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: ns-resize;
}

.resize-handle.left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
}

/* 角落拖拽句柄 */
.resize-handle.top-left {
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: nwse-resize;
}

.resize-handle.top-right {
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: nesw-resize;
}

.resize-handle.bottom-left {
  bottom: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: nesw-resize;
}

.resize-handle.bottom-right {
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: nwse-resize;
}

/* 拖拽句柄悬停效果 */
.resize-handle:hover {
  background: rgba(0, 122, 255, 0.3);
}

/* 最大化状态下隐藏拖拽句柄 */
.window.maximized .window-resize-handles {
  display: none;
}
</style>
