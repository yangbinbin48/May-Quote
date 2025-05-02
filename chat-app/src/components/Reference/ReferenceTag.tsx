import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReferenceItem } from '../../types';
import ReferenceTooltip from './ReferenceTooltip';

interface ReferenceTagProps {
  reference: ReferenceItem;
  onDelete: (id: string) => void;
}

/**
 * 引用标签组件
 * 在输入框中显示引用内容的标签
 */
const ReferenceTag: React.FC<ReferenceTagProps> = ({ 
  reference,
  onDelete 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // 处理点击外部关闭tooltip
  const handleClickOutside = useCallback((event: MouseEvent) => {
    // 如果点击的不是tag或tooltip内的元素，则关闭tooltip
    if (showTooltip && 
        tagRef.current && 
        !tagRef.current.contains(event.target as Node) && 
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)) {
      setShowTooltip(false);
    }
  }, [showTooltip]);
  
  // 添加和移除全局点击事件监听器
  useEffect(() => {
    // 只有当tooltip显示时才添加事件监听器
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // 清理函数 - 当组件卸载或showTooltip变化时移除事件监听器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip, handleClickOutside]);
  
  // 处理点击tag
  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTooltip(!showTooltip); // 切换tooltip显示状态
  };
  
  return (
    <div
      ref={tagRef}
      className="reference-tag"
      onClick={handleTagClick}
      onMouseEnter={() => !showTooltip && setShowTooltip(true)} // 仅在未显示时由hover触发显示
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--tag-bg, #333)',
        color: 'var(--brand-color)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        margin: '0 4px',
        maxWidth: '200px',
        overflow: 'visible', // 修改为visible，允许tooltip溢出
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        position: 'relative', // 确保position是relative
        fontSize: 'var(--font-sm)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s ease', // 所有属性都有过渡效果
        cursor: 'pointer', // 增加指针样式提示可交互
        minHeight: '24px',
        userSelect: 'none' // 防止文本被选中
      }}
    >
      {/* 引用图标 */}
      <span 
        className="reference-tag-icon" 
        style={{ marginRight: '4px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
        </svg>
      </span>
      
      {/* 引用预览文本 */}
      <span className="reference-tag-text">
        {reference.previewText}
      </span>
      
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(reference.id);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-light-gray)',
          marginLeft: '4px',
          padding: '2px',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--font-xs)',
          transition: 'color 0.2s ease, background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-color)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-light-gray)'}
        aria-label="删除引用"
        title="删除引用"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      {/* 引用内容预览气泡 */}
      <ReferenceTooltip 
        content={reference.content}
        isVisible={showTooltip}
        tooltipRef={tooltipRef}
      />
    </div>
  );
};

export default ReferenceTag;
