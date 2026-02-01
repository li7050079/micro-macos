import { Component } from '@angular/core'

@Component({
  selector: 'app-home',
  template: `
    <div class="home">
      <h2>欢迎来到 Angular 子应用</h2>
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
    </div>
  `,
  styles: [`
    .home {
      text-align: center;
      padding: 40px 20px;
    }
    h2 {
      color: #3f51b5;
      margin-bottom: 30px;
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
      display: inline-block;
      margin: 5px;
    }
  `]
})
export class HomeComponent {
  constructor() { }
}