import { Component } from '@angular/core'

@Component({
  selector: 'app-about',
  template: `
    <div class="about">
      <h2>关于我们</h2>
      <p>这是一个基于 Angular 的子应用示例，展示如何在主应用中集成 Angular 子应用。</p>
      <p>技术栈：</p>
      <ul>
        <li>Angular 16</li>
        <li>TypeScript</li>
        <li>Angular Router</li>
        <li>Qiankun 微前端</li>
      </ul>
      <p>功能特点：</p>
      <ul>
        <li>支持独立运行</li>
        <li>支持在主应用中集成</li>
        <li>支持与主应用通信</li>
        <li>支持路由导航</li>
      </ul>
      <p>最佳实践：</p>
      <ul>
        <li>独立运行：子应用应支持独立运行，便于开发和调试</li>
        <li>生命周期管理：正确实现 Qiankun 要求的生命周期钩子</li>
        <li>路由配置：使用 hash 路由或正确配置 base href</li>
        <li>样式隔离：使用组件样式封装</li>
        <li>通信机制：使用事件总线或全局状态进行通信</li>
        <li>错误处理：添加错误处理，提高应用稳定性</li>
        <li>性能优化：使用懒加载模块和 OnPush 变更检测</li>
      </ul>
    </div>
  `,
  styles: [`
    .about {
      padding: 40px 20px;
    }
    h2 {
      color: #3f51b5;
      margin-bottom: 30px;
      text-align: center;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    li {
      background-color: #f8f9fa;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
    }
  `]
})
export class AboutComponent {
  constructor() { }
}