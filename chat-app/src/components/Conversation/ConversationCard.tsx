import React, { useState } from 'react';
import ConfirmDialog from '../UI/ConfirmDialog';
import { formatSmartTime } from '../../utils/date-utils';

interface ConversationCardProps {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}

/**
 * 对话卡片组件
 * 显示单个对话的标题、预览、时间，以及删除按钮
 */
const ConversationCard: React.FC<ConversationCardProps> = ({
  id,
  title,
  preview,
  updatedAt,
  isActive,
  onSelect,
  onDelete
}) => {
  // 确认对话框状态
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 使用统一的智能时间格式化函数
  
  // 处理点击事件
  const handleClick = () => {
    onSelect(id);
  };
  
  // 处理删除事件
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    setShowConfirm(true);
  };
  
  // 删除状态
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // 确认删除
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      // 调用父组件的删除方法并等待结果
      const success = await onDelete(id);
      
      if (!success) {
        // 如果删除失败，显示错误
        setDeleteError('删除失败，请重试');
        console.error(`删除对话 ${id} 失败`);
        // 不关闭对话框，让用户看到错误
      } else {
        // 删除成功，关闭对话框
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('删除对话时发生错误:', error);
      setDeleteError('删除时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 取消删除
  const cancelDelete = () => {
    setShowConfirm(false);
  };
  
  return (
    <div 
      className={`conversation-card ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      style={{
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isActive ? 'var(--secondary-bg)' : 'rgba(255, 255, 255, 0.03)',
        cursor: 'pointer',
        marginBottom: 'var(--space-sm)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* 标题 */}
      <div style={{
        fontSize: 'var(--font-md)',
        fontWeight: 'bold',
        color: isActive ? 'var(--brand-color)' : 'var(--text-white)',
        marginBottom: 'var(--space-xs)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {title}
      </div>
      
      {/* 预览 */}
      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text-mid-gray)',
        marginBottom: 'var(--space-xs)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {preview || '新对话'}
      </div>
      
      {/* 时间和删除按钮行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* 时间 */}
        <div style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--text-mid-gray)'
        }}>
          {formatSmartTime(updatedAt)}
        </div>
        
        {/* 删除图标按钮 - ActionButton风格 */}
        <ActionButton
          onClick={handleDelete}
          label="删除对话"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          }
        />
      </div>
      
      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="删除对话"
        message="确定要删除这个对话吗？这个操作无法撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
        error={deleteError}
      />
      
      {/* 悬停效果的样式 */}
      <style>{`
        .conversation-card:hover {
          background-color: ${isActive ? 'var(--secondary-bg)' : 'rgba(255, 255, 255, 0.05)'};
        }
      `}</style>
    </div>
  );
};

// 操作按钮子组件
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, label, icon, disabled = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => {
        setShowTooltip(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        setIsHovered(false);
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: disabled
            ? 'var(--text-mid-gray)'
            : isHovered
              ? 'var(--brand-color)' // 鼠标悬停时变为品牌色（浅绿色）
              : 'var(--text-light-gray)',
          padding: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: 'var(--radius-sm)',
          opacity: disabled ? 0.5 : 1,
          transition: 'color 0.2s ease',
        }}
      >
        {icon}
      </button>

      {/* 工具提示 - 使用不透明背景 */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333', // 使用不透明的深色背景
            color: '#ffffff', // 纯白色文本以增加对比度
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-xs)',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
            border: '1px solid #555', // 添加边框增强可视性
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default ConversationCard;
