<template>
  <div class="system-tray" :class="{ 'hidden': !features.systemTray || !showSystemTray }">
    <div class="tray-items">
      <div 
        v-for="item in systemTray" 
        :key="item.id"
        class="tray-item"
        @click="toggleTrayItem(item.id)"
      >
        <img :src="item.icon" :alt="item.name" class="tray-icon" />
        <div class="tray-status">{{ item.status }}</div>
      </div>
      <div class="tray-item" @click="toggleNotificationCenter" v-if="features.notificationCenter">
        <img src="@/assets/icons/system/siri.png" alt="通知" class="tray-icon" />
      </div>
      <div class="tray-item">
        <div class="tray-time">{{ currentTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDesktopStore } from '../stores/desktopStore'
import { useConfigStore } from '../stores/configStore'

// Props
const props = defineProps({
  showSystemTray: {
    type: Boolean,
    default: true
  },
  features: {
    type: Object,
    default: () => ({
      systemTray: true,
      notificationCenter: true
    })
  }
})

// Emits
const emit = defineEmits([
  'trayItemToggle',
  'notificationCenterToggle'
])

// Stores
const desktopStore = useDesktopStore()
const configStore = useConfigStore()

// Computed properties
const systemTray = computed(() => desktopStore.systemTray)
const currentTime = computed(() => desktopStore.currentTime)

// Methods
const toggleTrayItem = (itemId) => {
  const item = systemTray.value.find(item => item.id === itemId)
  if (item) {
    if (itemId === 'wifi') {
      item.status = item.status === 'connected' ? 'disconnected' : 'connected'
    } else if (itemId === 'bluetooth') {
      item.status = item.status === 'on' ? 'off' : 'on'
    }
  }
}

const toggleNotificationCenter = () => {
  desktopStore.toggleNotificationCenter()
}
</script>
