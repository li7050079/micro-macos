<template>
  <div class="desktop-menu" :style="{ left: menuX + 'px', top: menuY + 'px' }">
    <div class="desktop-menu-item" @click="changeDesktopBackground">
      <span>更换桌面背景</span>
    </div>
    <div class="desktop-menu-item" @click="arrangeIcons">
      <span>整理图标</span>
    </div>
    <div class="desktop-menu-item" @click="cleanDesktop">
      <span>清理桌面</span>
    </div>
    <div class="desktop-menu-separator"></div>
    <div class="desktop-menu-item" @click="showSystemPreferences">
      <span>系统偏好设置</span>
    </div>
  </div>
</template>

<script setup>
import { useDesktopStore } from '../stores/desktopStore'
import { useConfigStore } from '../stores/configStore'

// Props
const props = defineProps({
  menuX: {
    type: Number,
    default: 0
  },
  menuY: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits([
  'backgroundChange',
  'iconsArrange',
  'desktopClean',
  'systemPreferencesShow',
  'menuClose'
])

// Stores
const desktopStore = useDesktopStore()
const configStore = useConfigStore()

// Methods
const changeDesktopBackground = () => {
  const backgroundOptions = [
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  ]
  
  const currentIndex = backgroundOptions.indexOf(configStore.desktop.background)
  const nextIndex = (currentIndex + 1) % backgroundOptions.length
  const newBackground = backgroundOptions[nextIndex]
  
  configStore.setDesktopBackground(newBackground)
}

const arrangeIcons = () => {
  desktopStore.arrangeIcons()
}

const cleanDesktop = () => {
  desktopStore.cleanDesktop()
}

const showSystemPreferences = () => {
  // 触发系统偏好设置事件
  emit('systemPreferencesShow')
  console.log('Showing system preferences')
}
</script>
