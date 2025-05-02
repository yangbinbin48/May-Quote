import React, { useEffect, useRef } from 'react';

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onQuoteSelected: () => void;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
  onCancel: (e: React.MouseEvent) => void;
  isAllSelected: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 多选模式下的操作工具栏组件
 */
const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onQuoteSelected,
  onExportMarkdown,
  onExportPDF,
  onCancel,
  isAllSelected,
  containerRef
}) => {
  // 创建工具栏的引用
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // 使用useEffect更新工具栏位置
  useEffect(() => {
    // 定义更新位置的函数
    const updatePosition = () => {
      if (!containerRef?.current || !toolbarRef.current) return;
      
      // 获取剪贴板容器的位置和尺寸
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // 设置工具栏的位置和宽度，使其与剪贴板容器对齐并固定在底部
      toolbarRef.current.style.position = 'fixed';
      toolbarRef.current.style.bottom = `${window.innerHeight - containerRect.bottom}px`;
      toolbarRef.current.style.left = `${containerRect.left}px`;
      toolbarRef.current.style.width = `${containerRect.width}px`;
    };
    
    // 初始化位置
    updatePosition();
    
    // 监听滚动和窗口大小变化事件
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [containerRef]);
  return (
    <div
      ref={toolbarRef}
      className="selection-toolbar"
      style={{
        // 初始样式，将在useEffect中动态调整
        padding: 'var(--space-md)',
        backgroundColor: 'var(--main-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="selection-info">
        已选择 {selectedCount} / {totalCount} 项
      </div>
      
      <div className="selection-actions" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button
          onClick={onSelectAll}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-light-gray)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: 'pointer',
          }}
        >
          {isAllSelected ? '取消全选' : '全选'}
        </button>
        
        <button
          onClick={onQuoteSelected}
          disabled={selectedCount === 0}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-light-gray)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedCount === 0 ? 0.5 : 1,
          }}
        >
          引用所选
        </button>
        
        <button
          onClick={onExportMarkdown}
          disabled={selectedCount === 0}
          style={{
            backgroundColor: 'var(--brand-color)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-dark)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedCount === 0 ? 0.5 : 1,
          }}
        >
          导出为Markdown
        </button>
        
        <button
          onClick={onExportPDF}
          disabled={selectedCount === 0}
          style={{
            backgroundColor: 'var(--brand-color)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-dark)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedCount === 0 ? 0.5 : 1,
          }}
        >
          导出为PDF
        </button>
        
        <button
          onClick={onCancel}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-light-gray)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: 'pointer',
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default SelectionToolbar;
