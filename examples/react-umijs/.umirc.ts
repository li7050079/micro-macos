import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
  ],
  npmClient: 'npm',
  // 添加publicPath配置，解决微前端环境中的路径问题
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '//localhost:8000/',
  // 禁用mfsu，避免微前端环境中的模块联邦问题
  mfsu: false,
});

