<template>
  <div class="home">
    <h2>欢迎来到 Vue 3 子应用</h2>
    <p>这是一个基于 Vue 3 的子应用示例，展示如何在主应用中集成 Vue 3 子应用。</p>
    
    <div class="features">
      <div class="feature-item">
        <h3>📦 模块化设计</h3>
        <p>采用 Vue 3 Composition API，实现模块化组件设计</p>
      </div>
      <div class="feature-item">
        <h3>🔄 微前端集成</h3>
        <p>支持与主应用的无缝集成，实现微前端架构</p>
      </div>
      <div class="feature-item">
        <h3>🌐 路由管理</h3>
        <p>使用 Vue Router 实现客户端路由管理</p>
      </div>
      <div class="feature-item">
        <h3>🔗 事件通信</h3>
        <p>通过事件总线与主应用和其他子应用通信</p>
      </div>
    </div>
    
    <div class="actions">
      <router-link to="/about" class="btn">了解更多</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Home view mounted')
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.home h2 {
  color: #42b983;
  margin-bottom: 1rem;
}

.home p {
  margin-bottom: 2rem;
  color: #666;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-item {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-item h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-item p {
  font-size: 0.9rem;
  color: #666;
}

.actions {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #3aae7a;
}
</style>