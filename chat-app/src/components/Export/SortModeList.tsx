import React, { memo } from 'react';
import { ClipboardItem } from '../../types';
import SortModeCard from './SortModeCard';

interface SortModeListProps {
  items: ClipboardItem[];
  lastItemRef?: React.RefObject<HTMLDivElement | null>;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
}

/**
 * 排序模式下的项目列表组件
 * 移除拖放功能，使用上下按钮控制排序
 */
const SortModeList: React.FC<SortModeListProps> = ({
  items,
  lastItemRef,
  onMoveUp,
  onMoveDown
}) => {
  // 确保items始终是一个数组
  const safeItems = Array.isArray(items) ? items : [];
  
  return (
    <div className="sort-mode-list" style={{ minHeight: '100px' }}>
      {safeItems.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-md)' }}>
          <p>剪贴板中没有内容可排序</p>
        </div>
      ) : (
        safeItems.map((item, index) => {
          const isFirstItem = index === 0;
          const isLastItem = index === safeItems.length - 1;
          
          return (
            <div
              key={item.id}
              ref={isLastItem && lastItemRef ? lastItemRef : undefined}
              className="sort-mode-item"
              style={{ 
                marginBottom: 'var(--space-sm)'
              }}
            >
              <SortModeCard 
                item={item} 
                onMoveUp={onMoveUp} 
                onMoveDown={onMoveDown}
                isFirst={isFirstItem}
                isLast={isLastItem}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default memo(SortModeList);
