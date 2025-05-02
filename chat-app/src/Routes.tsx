import React from 'react';
import App from './App';
import PluginDemo from './components/Plugin/PluginDemo';

/**
 * 简单的路由组件，根据URL参数决定显示主应用还是插件演示页面
 * 插件演示页面的访问方式：
 * - 通过URL参数：?demo=plugin
 * - 通过键盘快捷键：fn+A+P+I
 */
const Routes: React.FC = () => {
  // 检查URL参数中是否包含demo=plugin
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'plugin';

  // 根据参数显示不同的组件
  return isDemoMode ? <PluginDemo /> : <App />;
};

export default Routes;
