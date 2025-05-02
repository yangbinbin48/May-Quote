import React from 'react';
import { ClipboardItem } from '../../types';

interface SortModeCardProps {
  item: ClipboardItem;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * 排序模式下的精简卡片组件 - 使用上下按钮移动
 * 移除拖拽功能，改用简单按钮控制移动
 */
const SortModeCard: React.FC<SortModeCardProps> = ({ 
  item, 
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false
}) => {
  // 截断文本，使内容较短
  const truncateText = (text: string): string => {
    if (text.length <= 120) return text;
    return text.substring(0, 120) + '...';
  };
  
  // 按钮样式
  const baseButtonStyle = {
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.2s ease',
    color: 'var(--text-light-gray)'
  };
  
  return (
    <div 
      className="sort-mode-card"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-sm)',
        minHeight: '90px', // 改为最小高度确保足够空间
        overflow: 'hidden',
        lineHeight: '1.5',
        position: 'relative',
        display: 'flex',
      }}
    >
      {/* 简化的内容显示 */}
      <div style={{ 
        wordBreak: 'break-word', 
        flex: 1,
        paddingRight: '40px' // 为按钮预留空间
      }}>
        {truncateText(item.content)}
      </div>
      
      {/* 上下移动按钮 */}
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px' // 增加间距，减轻密集感
      }}>
        <button
          onClick={() => onMoveUp(item.id)}
          disabled={isFirst}
          style={{
            ...baseButtonStyle,
            cursor: isFirst ? 'default' : 'pointer',
            opacity: isFirst ? 0.3 : 1, // 降低禁用状态透明度使效果更明显
          }}
          title="上移"
          className="sort-button"
          onMouseOver={(e) => {
            if (!isFirst) {
              e.currentTarget.style.backgroundColor = 'var(--brand-color)';
              e.currentTarget.style.color = 'var(--text-dark)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-light-gray)';
          }}
        >
          ▲
        </button>
        <button
          onClick={() => onMoveDown(item.id)}
          disabled={isLast}
          style={{
            ...baseButtonStyle,
            cursor: isLast ? 'default' : 'pointer',
            opacity: isLast ? 0.3 : 1, // 降低禁用状态透明度使效果更明显
          }}
          title="下移"
          className="sort-button"
          onMouseOver={(e) => {
            if (!isLast) {
              e.currentTarget.style.backgroundColor = 'var(--brand-color)';
              e.currentTarget.style.color = 'var(--text-dark)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-light-gray)';
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default SortModeCard;
