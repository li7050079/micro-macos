import { Component, OnInit, OnDestroy } from '@angular/core'
import eventBus from './utils/event-bus'

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <header class="app-header">
        <h1>Angular 子应用</h1>
        <nav class="app-nav">
          <a routerLink="/" class="nav-link">首页</a>
          <a routerLink="/about" class="nav-link">关于</a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <p>© 2026 Angular 子应用示例</p>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .app-header {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    h1 {
      color: #3f51b5;
      margin: 0 0 20px 0;
    }
    .app-nav {
      display: flex;
      gap: 20px;
    }
    .nav-link {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 4px;
    }
    .nav-link:hover {
      background-color: #e3f2fd;
    }
    .app-main {
      min-height: 400px;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .app-footer {
      margin-top: 20px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      text-align: center;
      color: #666;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private handleMainMessage: (data: any) => void

  constructor() {
    this.handleMainMessage = (data: any) => {
      console.log('Received message from main app:', data)
    }
  }

  ngOnInit(): void {
    console.log('Angular app mounted')
    
    // 向主应用发送事件
    eventBus.emit('sub:message', {
      message: 'Hello from Angular sub-app'
    })
    
    // 监听主应用事件
    eventBus.on('main:message', this.handleMainMessage)
  }

  ngOnDestroy(): void {
    eventBus.off('main:message', this.handleMainMessage)
  }
}