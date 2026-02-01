# Vue3 子应用配置样例

## 1. 子应用路由配置

Vue3子应用的路由配置如下 (`src/router/index.js`)：

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(window.__MICRO_APP_ENVIRONMENT__ ? '/vue3/' : '/'),
  routes
})

export default router
```

## 2. 主应用中Vue3子应用的配置

在主应用的 `appManagerService.js` 中，Vue3子应用的配置如下：

```javascript
{
  id: 'vue3-subapp',
  name: 'Vue 3 示例',
  icon: '/src/assets/icons/apps/vue.svg',
  entry: '//localhost:8081',
  container: '#app-container',
  activeRule: '/vue3',
  iframe: true,
  type: 'app',
  children: [
    {
      id: 'vue3-dashboard',
      name: '仪表盘',
      icon: '/src/assets/icons/apps/vue.svg',
      type: 'app',
      path: '/',
      params: {},
      query: {}
    },
    {
      id: 'vue3-about',
      name: '关于',
      icon: '/src/assets/icons/apps/vue.svg',
      type: 'app',
      path: '/about',
      params: {},
      query: {}
    }
  ]
}
```

## 3. 直接访问二级菜单的配置说明

### 配置字段说明

- `id`: 应用的唯一标识符
- `name`: 应用显示名称
- `icon`: 应用图标路径
- `entry`: 子应用的入口地址
- `container`: 子应用的容器选择器
- `activeRule`: 子应用的基础路由
- `iframe`: 是否使用iframe模式
- `type`: 应用类型，`app`表示叶子节点应用
- `children`: 二级菜单配置数组
  - `id`: 二级菜单的唯一标识符
  - `name`: 二级菜单显示名称
  - `icon`: 二级菜单图标路径
  - `type`: 菜单类型，`app`表示叶子节点
  - `path`: 子应用内部的路由路径
  - `params`: 路由参数
  - `query`: 查询参数

### 配置原理

当点击二级菜单时，主应用会：
1. 查找二级菜单对应的子应用配置
2. 构建完整的子应用配置，包括：
   - 继承父级的 `entry`、`container`、`activeRule` 等配置
   - 使用二级菜单的 `path` 构建完整的路由路径
   - 使用二级菜单的 `params` 和 `query` 构建完整的URL
3. 创建窗口并加载子应用，将完整配置传递给子应用
4. 子应用根据传递的路由信息，直接导航到对应页面

## 4. 子应用接收路由信息

Vue3子应用在 `main.js` 中接收并处理路由信息：

```javascript
// 处理路由信息
function handleRouteInfo() {
  if (window.__MICRO_APP_ENVIRONMENT__ && window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const routeInfo = window.__MICRO_APP_PROPS__.routeInfo
    console.log('Handling route info:', routeInfo)
    
    if (router && routeInfo.path) {
      router.push({
        path: routeInfo.path,
        params: routeInfo.params || {},
        query: routeInfo.query || {}
      }).then(() => {
        console.log('Navigation to', routeInfo.path, 'successful')
      }).catch(err => {
        console.error('Navigation error:', err)
      })
    }
  }
}
```

## 5. 测试验证

### 测试步骤

1. **启动主应用**：
   ```bash
   npm run dev
   ```

2. **启动Vue3子应用**：
   ```bash
   cd examples/vue3
   npm run dev
   ```

3. **在主应用中测试**：
   - 打开主应用，点击桌面或开始菜单中的 "Vue 3 示例"
   - 展开二级菜单，点击 "仪表盘"，应该直接打开Vue3子应用的Home页面
   - 展开二级菜单，点击 "关于"，应该直接打开Vue3子应用的About页面

### 预期效果

- 点击 "仪表盘" -> 直接打开 Vue3 子应用的 Home 页面 (`http://localhost:8081/`)
- 点击 "关于" -> 直接打开 Vue3 子应用的 About 页面 (`http://localhost:8081/about`)

## 6. 自定义二级菜单

### 添加新的二级菜单

要添加新的二级菜单，需要：

1. **在Vue3子应用中添加新的路由**：
   ```javascript
   // src/router/index.js
   const routes = [
     {
       path: '/',
       name: 'Home',
       component: Home
     },
     {
       path: '/about',
       name: 'About',
       component: About
     },
     {
       path: '/contact',
       name: 'Contact',
       component: () => import('../views/Contact.vue')
     }
   ]
   ```

2. **在主应用配置中添加新的二级菜单**：
   ```javascript
   children: [
     {
       id: 'vue3-dashboard',
       name: '仪表盘',
       icon: '/src/assets/icons/apps/vue.svg',
       type: 'app',
       path: '/',
       params: {},
       query: {}
     },
     {
       id: 'vue3-about',
       name: '关于',
       icon: '/src/assets/icons/apps/vue.svg',
       type: 'app',
       path: '/about',
       params: {},
       query: {}
     },
     {
       id: 'vue3-contact',
       name: '联系我们',
       icon: '/src/assets/icons/apps/vue.svg',
       type: 'app',
       path: '/contact',
       params: {},
       query: {}
     }
   ]
   ```

3. **在Vue3子应用中创建对应的视图组件**：
   ```vue
   <!-- src/views/Contact.vue -->
   <template>
     <div class="contact">
       <h1>联系我们</h1>
       <p>这是Vue3子应用的联系我们页面</p>
     </div>
   </template>
   ```

## 7. 常见问题排查

### 问题1：二级菜单点击后只打开子应用首页

**原因**：
- 子应用的路由信息未正确传递
- 子应用未正确处理路由信息

**解决方案**：
- 检查子应用的 `main.js` 中是否正确处理了 `handleRouteInfo` 函数
- 检查主应用的 `appManagerService.js` 中是否正确构建了完整的路由配置

### 问题2：二级菜单点击后子应用加载失败

**原因**：
- 子应用的 `entry` 配置错误
- 子应用未启动
- 子应用的路由配置错误

**解决方案**：
- 确保子应用已启动并能正常访问
- 检查子应用的 `entry` 配置是否正确
- 检查子应用的路由配置是否正确

### 问题3：二级菜单不显示

**原因**：
- 主应用的菜单配置错误
- `children` 数组配置不正确

**解决方案**：
- 检查 `children` 数组的配置格式是否正确
- 确保每个二级菜单都有正确的 `id`、`name`、`type` 等字段

## 8. 总结

通过以上配置，您可以：

1. 在主应用中为Vue3子应用配置二级菜单
2. 通过点击二级菜单直接访问Vue3子应用的对应页面
3. 灵活扩展和自定义二级菜单
4. 实现主应用与子应用之间的路由信息传递

这种配置方式不仅适用于Vue3子应用，也适用于React、Angular等其他类型的子应用，是一种通用的二级菜单配置方案。