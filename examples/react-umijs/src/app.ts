// 运行时配置

// 扩展 Window 接口
declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_APP_NAME__?: string
    __MICRO_APP_PROPS__?: any
    __MICRO_APP_BASE_ROUTE__?: string
    [key: string]: any
  }
}

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};

// 处理路由信息
function handleRouteInfo() {
  if (window.__MICRO_APP_ENVIRONMENT__ && window.__MICRO_APP_PROPS__ && window.__MICRO_APP_PROPS__.routeInfo) {
    const routeInfo = window.__MICRO_APP_PROPS__.routeInfo;
    console.log('Handling route info:', routeInfo);
    
    // 使用 UMI 的 history 实例进行导航
    if (window.g_history && routeInfo.path) {
      window.g_history.push({
        pathname: routeInfo.path,
        params: routeInfo.params || {},
        query: routeInfo.query || {}
      });
    }
  }
}

// 检查是否作为 micro-app 子应用运行
const isMicroApp = window.__MICRO_APP_ENVIRONMENT__;

if (isMicroApp) {
  window.__MICRO_APP_NAME__ = 'react-umijs';
  window.__MICRO_APP_BASE_ROUTE__ = window.__MICRO_APP_BASE_ROUTE__ || '/react-umijs';
  
  // 注册微前端生命周期
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = {
    mount: () => {
      console.log('React UMIJS app mounting as micro-app');
      // UMIJS 会自动初始化，这里只需要处理路由信息
      setTimeout(handleRouteInfo, 100); // 延迟处理，确保 UMI 已初始化
      return true;
    },
    unmount: () => {
      console.log('React UMIJS app unmounting from micro-app');
      // UMIJS 会自动清理
      return true;
    }
  };
  
  console.log('React UMIJS micro-app lifecycle registered');
}
