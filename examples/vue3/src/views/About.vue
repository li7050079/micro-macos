<template>
  <div class="about">
    <h2>关于 Vue 3 子应用</h2>
    <p>这是一个基于 Vue 3 的子应用示例，展示如何在主应用中集成 Vue 3 子应用。</p>
    
    <div class="info">
      <div class="info-item">
        <h3>技术栈</h3>
        <ul>
          <li>Vue 3</li>
          <li>Vue Router</li>
          <li>Vite</li>
          <li>JavaScript</li>
        </ul>
      </div>
      <div class="info-item">
        <h3>核心功能</h3>
        <ul>
          <li>独立运行</li>
          <li>微前端集成</li>
          <li>路由管理</li>
          <li>事件通信</li>
          <li>响应式设计</li>
        </ul>
      </div>
      <div class="info-item">
        <h3>最佳实践</h3>
        <ul>
          <li>组件化开发</li>
          <li>状态管理</li>
          <li>性能优化</li>
          <li>错误处理</li>
          <li>代码规范</li>
        </ul>
      </div>
    </div>
    
    <div class="actions">
      <router-link to="/" class="btn">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('About view mounted')
})
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about h2 {
  color: #42b983;
  margin-bottom: 1rem;
}

.about p {
  margin-bottom: 2rem;
  color: #666;
}

.info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: left;
}

.info-item h3 {
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.info-item ul {
  list-style: none;
  padding: 0;
}

.info-item li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

.info-item li:last-child {
  border-bottom: none;
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