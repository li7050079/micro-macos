<template>
  <div class="notification-center">
    <div class="notification-header">
      <h3>通知中心</h3>
      <button class="notification-close" @click="toggleNotificationCenter" title="关闭通知中心" />
    </div>
    <div class="notification-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'read': notification.read }"
        @click="markNotificationAsRead(notification.id)"
      >
        <img :src="notification.icon" :alt="notification.title" class="notification-icon" />
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
      </div>
    </div>
    <div class="notification-footer">
      <button class="notification-clear" @click="clearAllNotifications">清除所有通知</button>
    </div>
  </div>
</template>

<script setup>
import { useDesktopStore } from '../stores/desktopStore'

// Props
const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([])

// Stores
const desktopStore = useDesktopStore()

// Methods
const toggleNotificationCenter = () => {
  desktopStore.toggleNotificationCenter()
}

const markNotificationAsRead = (notificationId) => {
  desktopStore.markNotificationAsRead(notificationId)
}

const clearAllNotifications = () => {
  desktopStore.clearAllNotifications()
}
</script>
