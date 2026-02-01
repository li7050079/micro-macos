<template>
  <div class="desktop-switcher" :style="desktopSwitcherStyle">
    <div 
      v-for="desktop in desktops" 
      :key="desktop.id"
      class="desktop-preview"
      :class="{ 'active': desktop.id === currentDesktopId }"
      @click="switchDesktop(desktop.id)"
    >
      <div class="desktop-preview-bg" :style="{ background: desktop.background }"><div class="desktop-preview-name">{{ desktop.name }}</div></div>
    </div>
    <div class="desktop-add" @click="addDesktop">
      <span>+</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useConfigStore } from '../stores/configStore'

// Props
const props = defineProps({})

// Emits
const emit = defineEmits([
  'desktopSwitch',
  'desktopAdd',
  'desktopSwitcherToggle'
])

// Stores
const desktopStore = useDesktopStore()
const configStore = useConfigStore()

// Computed properties
const dockConfig = computed(() => configStore.dock)
const desktops = computed(() => desktopStore.desktops)
const currentDesktopId = computed(() => desktopStore.currentDesktopId)

const desktopSwitcherStyle = computed(() => {
  const position = dockConfig.value.position
  const size = dockConfig.value.size + 32 // 包含边距
  
  switch (position) {
    case 'bottom':
      return {
        bottom: `${size}px`,
        left: '50%',
        right: 'auto',
        top: 'auto',
        transform: 'translateX(-50%)',
        flexDirection: 'row'
      }
    case 'left':
      return {
        left: `${size}px`,
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        flexDirection: 'column'
      }
    case 'right':
      return {
        right: `${size}px`,
        top: '50%',
        left: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        flexDirection: 'column'
      }
    case 'top':
      return {
        top: `${size}px`,
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateX(-50%)',
        flexDirection: 'row'
      }
    default:
      return {
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        flexDirection: 'row'
      }
  }
})

// Methods
const switchDesktop = (desktopId) => {
  desktopStore.switchDesktop(desktopId)
  desktopStore.toggleDesktopSwitcher()
  emit('desktopSwitch', desktopId)
  emit('desktopSwitcherToggle')
}

const addDesktop = () => {
  desktopStore.addDesktop()
  emit('desktopAdd')
}
</script>
