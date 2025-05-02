import React from 'react';

interface SortModeToolbarProps {
  onCancel: (e: React.MouseEvent) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 排序模式下的操作工具栏组件
 * 
 * 显示在底部，提供"完成排序"按钮，仅用于退出排序模式
 * 注意：排序结果在点击"完成排序"按钮时保存
 */
const SortModeToolbar: React.FC<SortModeToolbarProps> = ({
  onCancel,
  containerRef
}) => {
  // 创建工具栏的引用
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  
  // 使用useEffect更新工具栏位置
  React.useEffect(() => {
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
      className="sort-mode-toolbar"
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
      <div className="sort-info">
        排序模式：使用上下按钮调整顺序，点击"完成排序"保存并退出
      </div>
      
      <div className="sort-actions">
        <button
          onClick={onCancel}
          style={{
            backgroundColor: 'var(--brand-color)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-dark)',
            padding: 'var(--space-xs) var(--space-sm)',
            cursor: 'pointer',
          }}
        >
          完成排序
        </button>
      </div>
    </div>
  );
};

export default SortModeToolbar;
