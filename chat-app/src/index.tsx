import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Routes from './Routes';
import './styles/global.css';
import './styles/markdown.css';
import './styles/draggable.css';
import './styles/selection.css'; // 导入自定义文本选择样式

const container = document.getElementById('root');
if (!container) {
  throw new Error('找不到root元素。请确保HTML中有id为root的元素。');
}

// 快捷键处理函数，监听fn+A+P+I组合键
const handleKeyboardShortcut = () => {
  // 创建一个Set用于跟踪按下的按键
  const pressedKeys = new Set();
  
  // 键盘按下事件处理
  document.addEventListener('keydown', (e) => {
    if (!e.key) {
      return;
    }
    // 记录按下的键
    pressedKeys.add(e.key.toLowerCase());
    
    // 检查是否同时按下了fn+a+p+i
    // 注意：fn键通常不会被JavaScript直接检测到，
    // 但可以检测特定键(如F1-F12)来判断fn是否被按下
    // 这里简化为检测Alt键作为fn键的替代
    if (
      e.altKey && // 使用Alt键模拟fn键
      pressedKeys.has('a') && 
      pressedKeys.has('p') && 
      pressedKeys.has('i')
    ) {
      // 打开插件演示页
      window.location.href = '?demo=plugin';
    }
  });
  
  // 键盘释放事件处理
  document.addEventListener('keyup', (e) => {
    if (!e.key) {
      return;
    }
    // 移除释放的键
    pressedKeys.delete(e.key.toLowerCase());
  });
};

// 页面加载时初始化快捷键监听
handleKeyboardShortcut();

const root = createRoot(container);
// 禁用严格模式以避免组件双重挂载导致的重复初始化问题
// 在实际生产环境中可以考虑重新启用，但需要确保组件逻辑能处理双重挂载
root.render(
  <Routes />
);
