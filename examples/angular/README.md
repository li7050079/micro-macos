# Angular 子应用示例

## 项目概述

这是一个基于 Angular 的子应用示例，展示如何在主应用中集成 Angular 子应用。

## 技术栈

- Angular
- Angular Router
- Angular CLI
- TypeScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
ng serve
```

### 构建生产版本

```bash
ng build
```

## 项目结构

```
angular/
├── src/               # 源代码
│   ├── app/           # 应用代码
│   │   ├── app.component.ts  # 根组件
│   │   ├── app.module.ts     # 根模块
│   │   └── app-routing.module.ts  # 路由配置
│   ├── main.ts         # 入口文件
│   └── index.html      # HTML 模板
├── package.json        # 项目配置
├── angular.json        # Angular 配置
└── tsconfig.json       # TypeScript 配置
```

## 关键配置

### 1. 入口文件配置

在 `src/main.ts` 中，需要导出 Qiankun 要求的生命周期钩子：

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { ApplicationRef } from '@angular/core'

let platform = null

// 初始化子应用
export function bootstrap(props: any) {
  console.log('Angular app bootstraped')
  return Promise.resolve()
}

// 挂载子应用
export function mount(props: any) {
  console.log('Angular app mounted', props)
  platform = platformBrowserDynamic()
  return platform.bootstrapModule(AppModule)
    .then(moduleRef => {
      const appRef = moduleRef.injector.get(ApplicationRef)
      const componentRef = appRef.components[0]
      return Promise.resolve()
    })
}

// 卸载子应用
export function unmount(props: any) {
  console.log('Angular app unmounted')
  platform.destroy()
  platform = null
  return Promise.resolve()
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err))
}
```

### 2. 构建配置

在 `angular.json` 中，需要配置构建选项以支持微前端环境：

```json
{
  "projects": {
    "angular": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/angular",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.css"
            ],
            "scripts": [],
            "baseHref": "/"
          },
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "extractCss": true,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            }
          }
        },
        "serve": {
          "options": {
            "port": 8083,
            "host": "localhost",
            "disableHostCheck": true
          },
          "configurations": {
            "production": {
              "browserTarget": "angular:build:production"
            }
          }
        }
      }
    }
  }
}
```

### 3. 路由配置

在 `src/app/app-routing.module.ts` 中，需要配置路由：

```typescript
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home/home.component'
import { AboutComponent } from './about/about.component'

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 4. 主应用注册

在主应用的 `micro-app/qiankun-config.js` 中注册子应用：

```javascript
registerMicroApps([
  {
    name: 'angular',
    entry: '//localhost:8083',
    container: '#angular',
    activeRule: '/angular',
    props: {
      message: 'Hello from main app'
    }
  }
])
```

## 功能示例

### 1. 组件示例

```typescript
// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-home',
  template: `
    <div class="home">
      <h1>Hello Angular!</h1>
      <p>Welcome to your Angular sub-application!</p>
    </div>
  `,
  styles: [`
    .home {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      color: #3f51b5;
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
```

### 2. 与主应用通信

```typescript
// src/app/utils/event-bus.ts
class EventBus {
  private events: { [key: string]: Function[] } = {}
  
  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }
  
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  }
  
  off(event: string, callback: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

const eventBus = new EventBus()
export default eventBus

// 使用示例
// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'
import eventBus from './utils/event-bus'

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private handleMainMessage: (data: any) => void

  constructor() {
    this.handleMainMessage = (data: any) => {
      console.log('Received message from main app:', data)
    }
  }

  ngOnInit(): void {
    // 监听主应用事件
    eventBus.on('main:message', this.handleMainMessage)
    
    // 向主应用发送事件
    eventBus.emit('sub:message', {
      message: 'Hello from Angular sub-app'
    })
  }

  ngOnDestroy(): void {
    eventBus.off('main:message', this.handleMainMessage)
  }
}
```

## 最佳实践

1. **独立运行**：子应用应支持独立运行，便于开发和调试
2. **生命周期管理**：正确实现 Qiankun 要求的生命周期钩子
3. **路由配置**：使用 hash 路由或正确配置 base href
4. **样式隔离**：使用组件样式封装
5. **通信机制**：使用事件总线或全局状态进行通信
6. **错误处理**：添加错误处理，提高应用稳定性
7. **性能优化**：使用懒加载模块和 OnPush 变更检测

## 常见问题

### 1. 子应用加载失败

**解决方案**：
- 检查子应用的入口地址是否正确
- 检查子应用的构建配置是否正确
- 检查子应用的生命周期钩子是否正确实现

### 2. 路由冲突

**解决方案**：
- 使用 hash 路由
- 配置正确的 base href
- 避免使用绝对路径

### 3. 样式污染

**解决方案**：
- 使用组件样式封装
- 使用 ViewEncapsulation
- 为子应用添加命名空间

### 4. 通信失败

**解决方案**：
- 检查事件总线是否正确初始化
- 检查事件名称是否一致
- 检查通信协议是否符合规范

## 总结

本示例展示了如何创建一个基于 Angular 的子应用，并集成到主应用中。通过正确配置入口文件、构建选项和路由，以及实现必要的生命周期钩子，可以构建一个功能完整、性能良好的 Angular 子应用。