import React, { useState } from 'react';
import { Message } from '../Chat/MessageItem';
import { useReference } from '../../contexts/ReferenceContext';

interface MessageActionsProps {
  message: Message;
  onCopy: (messageId: string) => void;
  onQuote?: (messageId: string) => void;  // 保留向后兼容
  onAddToClipboard: (messageId: string) => void;
  onQuoteToNewConversation?: (messageContent: string, userPrompt: string) => void;
  onOpenQuoteDialog?: (content: string) => void; // 新增：打开引用对话框
}

/**
 * 消息操作按钮组件
 * 
 * 提供消息的复制、引用和添加到剪贴板等功能按钮
 * 设计为轻量级悬浮按钮组，hover时显示全色
 */
const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onCopy,
  onQuote,
  onAddToClipboard,
  onQuoteToNewConversation,
  onOpenQuoteDialog
}) => {
  // 获取引用context
  const { addReference } = useReference();
  
  // 复制成功提示状态
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  // 添加到剪贴板成功提示状态
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  // 引用成功提示状态
  const [showReferenceSuccess, setShowReferenceSuccess] = useState(false);
  // 状态跟踪按钮组是否被悬停
  const [isGroupHovered, setIsGroupHovered] = useState(false);

  // 处理复制
  const handleCopy = () => {
    onCopy(message.id);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 1500);
  };

  // 处理添加到剪贴板
  const handleAddToClipboard = () => {
    onAddToClipboard(message.id);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 1500);
  };

  // 只在AI消息上显示操作按钮
  if (message.role !== 'assistant') {
    return null;
  }

  return (
    <div 
      className="message-actions" 
      style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginTop: 'var(--space-xs)',
        opacity: isGroupHovered ? 1 : 0.7, // 悬停时完全不透明
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
    >
      {/* 复制按钮 */}
      <ActionButton 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        }
        tooltip="复制"
        onClick={handleCopy}
      />
      
      {/* 引用按钮 */}
      <ActionButton 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        }
        tooltip="引用"
        onClick={() => {
          addReference(message.content);
          setShowReferenceSuccess(true);
          setTimeout(() => setShowReferenceSuccess(false), 1500);
        }}
      />
      
      {/* 添加到剪贴板按钮 */}
      <ActionButton 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
        }
        tooltip="添加到剪贴板"
        onClick={handleAddToClipboard}
      />
      
      {/* 引用到新对话按钮 */}
      <ActionButton 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        }
        tooltip="引用到新对话"
        onClick={() => {
          if (onOpenQuoteDialog) {
            onOpenQuoteDialog(message.content);
          }
        }}
      />

      {/* 成功提示 */}
      {showCopySuccess && (
        <div className="success-toast" style={{
          position: 'absolute',
          right: 0,
          bottom: '100%',
          backgroundColor: '#A5E887', // 使用不透明的品牌色
          color: 'var(--text-dark)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          marginBottom: 'var(--space-xs)',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // 添加阴影增强可见性
          border: '1px solid #95d877', // 添加边框增强可见性
        }}>
          已复制到剪贴板
        </div>
      )}

      {/* 添加成功提示 */}
      {showAddSuccess && (
        <div className="success-toast" style={{
          position: 'absolute',
          right: 0,
          bottom: '100%',
          backgroundColor: '#A5E887', // 使用不透明的品牌色
          color: 'var(--text-dark)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          marginBottom: 'var(--space-xs)',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // 添加阴影增强可见性
          border: '1px solid #95d877', // 添加边框增强可见性
        }}>
          已添加到剪贴板
        </div>
      )}
      
      {/* 引用成功提示 */}
      {showReferenceSuccess && (
        <div className="success-toast" style={{
          position: 'absolute',
          right: 0,
          bottom: '100%',
          backgroundColor: '#A5E887', // 使用不透明的品牌色
          color: 'var(--text-dark)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          marginBottom: 'var(--space-xs)',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // 添加阴影增强可见性
          border: '1px solid #95d877', // 添加边框增强可见性
        }}>
          已添加引用
        </div>
      )}
      
      {/* 这里删除了NewConversationDialog的引用 */}
    </div>
  );
};

// 操作按钮子组件
interface ActionButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, tooltip, onClick, disabled = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'inline-block',
      }}
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
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: disabled 
            ? 'var(--text-mid-gray)' 
            : isHovered 
              ? 'var(--brand-color)' // 鼠标悬停时变为品牌色（浅绿色）
              : 'var(--text-light-gray)',
          transition: 'color 0.2s ease',
          padding: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {icon}
      </button>
      
      {/* 工具提示 */}
      {showTooltip && (
        <div style={{
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
          border: '1px solid #555', // 添加边框增强可见性
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default MessageActions;
