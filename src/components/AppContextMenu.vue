<template>
  <div class="app-context-menu" :style="{ left: appContextMenuX + 'px', top: appContextMenuY + 'px' }">
    <div class="context-menu-item" @click="openApp(selectedApp)">
      <img src="@/assets/icons/system/preview.png" alt="打开" class="context-menu-icon" />
      <span>打开</span>
    </div>
    <div class="context-menu-item" v-if="!isDesktopApp" @click="addAppToDesktop">
      <img src="@/assets/icons/system/rename.png" alt="添加到桌面" class="context-menu-icon" />
      <span>添加到桌面</span>
    </div>
    <div class="context-menu-item" v-if="isDesktopApp" @click="removeAppFromDesktop">
      <img src="@/assets/icons/system/delete.png" alt="从桌面移除" class="context-menu-icon" />
      <span>从桌面移除</span>
    </div>
  </div>
</template>

<script setup>
import { useDesktopStore } from '../stores/desktopStore'

// Props
const props = defineProps({
  selectedApp: {
    type: Object,
    required: true
  },
  appContextMenuX: {
    type: Number,
    default: 0
  },
  appContextMenuY: {
    type: Number,
    default: 0
  },
  isDesktopApp: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'appOpen',
  'appAddToDesktop',
  'appRemoveFromDesktop',
  'menuClose'
])

// Stores
const desktopStore = useDesktopStore()

// Methods
const openApp = (app) => {
  // 直接在组件内部处理应用打开
  console.log('Opening app:', app.name)
}

const addAppToDesktop = () => {
  if (props.selectedApp) {
    desktopStore.addAppToDesktop(props.selectedApp)
    console.log('Adding app to desktop:', props.selectedApp.name)
  }
}

const removeAppFromDesktop = () => {
  if (props.selectedApp) {
    desktopStore.removeAppFromDesktop(props.selectedApp.id)
    console.log('Removing app from desktop:', props.selectedApp.name)
  }
}
</script>
