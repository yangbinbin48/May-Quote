import React, { useRef, useEffect } from 'react';
import { truncateForDisplay } from '../../utils/reference-utils';

interface ReferenceTooltipProps {
  content: string;  // 完整引用内容
  isVisible: boolean; // 是否显示
  tooltipRef?: React.RefObject<HTMLDivElement | null>; // 可选的ref用于外部访问
}

/**
 * 引用预览气泡组件
 * 当鼠标悬停或点击引用标签时显示更多内容
 * 点击外部区域时隐藏
 */
const ReferenceTooltip: React.FC<ReferenceTooltipProps> = ({ 
  content, 
  isVisible,
  tooltipRef: externalRef
}) => {
  // 使用传入的ref或创建一个新的ref
  const internalRef = useRef<HTMLDivElement>(null);
  const tooltipRef = externalRef || internalRef;
  
  // 使用useEffect确保tooltip显示在视口内
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // 获取元素位置信息
      const rect = tooltipRef.current.getBoundingClientRect();
      
      // 检查是否超出顶部视口
      if (rect.top < 0) {
        // 如果超出视口顶部，改变位置到底部显示
        tooltipRef.current.style.bottom = 'auto';
        tooltipRef.current.style.top = '100%';
        tooltipRef.current.style.marginTop = '8px';
        tooltipRef.current.style.marginBottom = '0';
      }
      
      // 检查是否超出左侧视口
      if (rect.left < 0) {
        tooltipRef.current.style.left = '0';
      }
      
      // 检查是否超出右侧视口
      if (rect.right > window.innerWidth) {
        tooltipRef.current.style.left = 'auto';
        tooltipRef.current.style.right = '0';
      }
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  // 截断过长的引用内容（最大500字符）
  const displayContent = truncateForDisplay(content);
  
  return (
    <div 
      ref={tooltipRef}
      className="reference-tooltip" 
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        width: '300px',
        maxHeight: '200px',
        overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 9999, // 提高z-index以确保显示在其他元素之上
        marginBottom: '8px',
        color: 'var(--text-light-gray)',
        fontSize: 'var(--font-sm)',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        pointerEvents: 'auto' // 确保tooltip可以独立接收鼠标事件
      }}
    >
      {displayContent}
    </div>
  );
};

export default ReferenceTooltip;
