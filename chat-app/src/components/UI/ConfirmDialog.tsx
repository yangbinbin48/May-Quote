import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * 通用确认对话框组件
 * 与应用内其他对话框统一风格
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
  isLoading = false,
  error = null
}) => {
  // 添加调试日志
  React.useEffect(() => {
    if (isOpen) {
      console.log(`🔔 确认对话框已打开: ${title}`);
    }
  }, [isOpen, title]);
  
  // 如果对话框未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--secondary-bg)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        color: 'var(--text-white)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>{title}</h2>
        
        <p style={{ marginBottom: 'var(--space-md)' }}>{message}</p>
        
        {/* 错误信息 */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            color: 'var(--error-color)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-md)',
            fontSize: 'var(--font-sm)'
          }}>
            {error}
          </div>
        )}
        
        {/* 按钮区域 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-sm)',
          marginTop: 'var(--space-md)'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--error-color)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '处理中...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
