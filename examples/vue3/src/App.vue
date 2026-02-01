<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue 3 子应用</h1>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <p>© 2026 Vue 3 子应用示例</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import eventBus from './utils/event-bus'

onMounted(() => {
  console.log('Vue 3 app mounted')
  
  // 向主应用发送事件
  eventBus.emit('sub:message', {
    message: 'Hello from Vue 3 sub-app'
  })
  
  // 监听主应用事件
  eventBus.on('main:message', (data) => {
    console.log('Received message from main app:', data)
  })
})

onUnmounted(() => {
  console.log('Vue 3 app unmounted')
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #42b983;
  color: white;
  padding: 1rem;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  background-color: #f5f5f5;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>