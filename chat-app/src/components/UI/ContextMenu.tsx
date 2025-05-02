import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  children: React.ReactNode;
  preventTextSelection?: boolean; // 是否阻止菜单内文本被选中
}

/**
 * 通用上下文菜单组件
 * 
 * 显示在鼠标指定位置的菜单，提供统一的样式和行为
 * 点击菜单外部区域会自动关闭菜单
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  children,
  preventTextSelection = false
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 处理点击事件，点击菜单外部时关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // 仅在菜单打开时添加事件监听
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // 调整菜单位置，确保不会超出视口
  const adjustPosition = () => {
    if (!menuRef.current) return { top: position.y, left: position.x };
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    // 水平溢出检查
    if (position.x + rect.width > viewportWidth) {
      left = position.x - rect.width;
    }
    
    // 垂直溢出检查
    if (position.y + rect.height > viewportHeight) {
      top = position.y - rect.height;
    }
    
    return { top, left };
  };
  
  if (!isOpen) return null;
  
  const { top, left } = adjustPosition();
  
  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        zIndex: 1000,
        top,
        left,
        backgroundColor: '#333', // 深色背景
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        minWidth: '150px',
        border: '1px solid #555', // 边框增强可见性
        userSelect: preventTextSelection ? 'none' : 'text', // 阻止文本选择
      }}
      onClick={(e) => e.stopPropagation()} // 防止点击穿透
    >
      {children}
    </div>
  );
};

// 菜单项组件
interface ContextMenuItemProps {
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  onClick,
  icon,
  disabled = false,
  children
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      className={`context-menu-item ${disabled ? 'disabled' : ''}`}
      style={{
        padding: 'var(--space-sm) var(--space-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        color: disabled 
          ? 'var(--text-mid-gray)' 
          : isHovered 
            ? 'var(--brand-color)' // 鼠标悬停时变为品牌色（浅绿色）
            : 'var(--text-white)',
        backgroundColor: isHovered && !disabled ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
      onClick={() => !disabled && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span className="menu-item-icon">{icon}</span>}
      {children}
    </div>
  );
};

// 菜单分隔线
export const ContextMenuDivider: React.FC = () => (
  <div
    style={{
      height: '1px',
      backgroundColor: 'var(--border-color)',
      margin: '4px 0',
    }}
  />
);

export default ContextMenu;
