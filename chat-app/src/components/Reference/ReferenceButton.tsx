import React from 'react';

interface ReferenceButtonProps {
  content: string;  // 要引用的内容
  onReference: (content: string) => void;
  buttonText?: string; // 可选的按钮文本
  className?: string; // 可选的额外样式类
}

/**
 * 引用按钮组件
 * 用于在消息气泡、剪贴板卡片等地方显示引用按钮
 */
const ReferenceButton: React.FC<ReferenceButtonProps> = ({ 
  content, 
  onReference,
  buttonText = "引用",
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReference(content);
  };
  
  return (
    <button
      className={`reference-button ${className}`}
      onClick={handleClick}
      title="引用此内容"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: 'var(--text-light-gray)',
        border: 'none',
        padding: '4px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-sm)',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-color)')}
      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-light-gray)')}
    >
      {/* 引用图标 */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '4px' }}
          >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
      
      {/* 按钮文本 */}
      {buttonText}
    </button>
  );
};

export default ReferenceButton;
