import React from 'react';
import ContextMenu, { ContextMenuItem, ContextMenuDivider } from '../UI/ContextMenu';
import { generateId } from '../../utils/storage-db';
import { ClipboardItem } from '../../types';
import { useReference } from '../../contexts/ReferenceContext';

interface MessageContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  selectedText: string;
  isMarkdown: boolean;
  messageId?: string;
  onCopy: () => void;
  onQuote?: () => void;
  onAddToClipboard: (item: ClipboardItem) => void;
  // 为了解决菜单打开时选择内容丢失问题，添加额外属性
  selectedTextForMenu?: string; // 缓存的选中文本，优先使用
  messageIdForMenu?: string;    // 缓存的消息ID，优先使用
  onOpenQuoteDialog?: (content: string) => void; // 新增：打开引用对话框
}

/**
 * 消息文本选择上下文菜单组件
 * 
 * 显示在用户选择消息文本并右键点击时的上下文菜单
 * 提供复制、引用、添加到剪贴板等功能
 */
const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  selectedText,
  isMarkdown,
  messageId,
  onCopy,
  onQuote,
  onAddToClipboard,
  selectedTextForMenu,
  messageIdForMenu,
  onOpenQuoteDialog
}) => {
  // 获取引用上下文
  const { addReference } = useReference();
  // 使用缓存的文本和消息ID (如果可用)，否则使用原始的
  const actualSelectedText = selectedTextForMenu || selectedText;
  const actualMessageId = messageIdForMenu || messageId;
  
  // 只在有选中文本时显示
  if (!actualSelectedText) return null;
  
  // 处理复制
  const handleCopy = () => {
    // 将选中文本复制到剪贴板
    navigator.clipboard.writeText(selectedText).then(() => {
      onCopy();
      onClose();
    });
  };
  
  // 处理引用
  const handleQuote = () => {
    // 确保有选中文本
    if (actualSelectedText) {
      // 添加到引用
      addReference(actualSelectedText);
      // 仍然保留原有的onQuote回调，以便兼容
      if (onQuote) {
        onQuote();
      }
      onClose();
    }
  };
  
  // 处理添加到剪贴板
  const handleAddToClipboard = () => {
    // 确保有选中文本和消息ID
    if (!actualSelectedText || !actualMessageId) {
      console.error('无法添加选中文本到剪贴板: 没有选中文本或消息ID');
      return;
    }
    
    // 创建新的剪贴板项
    const newClipboardItem: ClipboardItem = {
      id: generateId(),
      content: actualSelectedText,
      timestamp: Date.now(),
      order: 0, // 将在保存时调整
      source: {
        conversationId: '', // 将由handleAddSelectedTextToClipboard填充
        messageId: actualMessageId
      }
    };
    
    console.log('[DEBUG-clipboard] MessageContextMenu.handleAddToClipboard: 创建新的剪贴板项', {
      id: newClipboardItem.id,
      content: newClipboardItem.content.substring(0, 20) + '...',
      messageId: messageId,
      时间戳: new Date().toISOString()
    });
    
    // 调用父组件提供的回调
    console.log('[DEBUG-clipboard] MessageContextMenu: 调用onAddToClipboard回调');
    onAddToClipboard(newClipboardItem);
    
    // 关闭上下文菜单
    onClose();
  };

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      onClose={onClose}
      preventTextSelection={true} // 阻止菜单内文本被选中
    >
      {/* 复制选中文本 */}
      <ContextMenuItem
        onClick={handleCopy}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        }
      >
        复制选择内容
      </ContextMenuItem>
      
      {/* 引用 */}
      <ContextMenuItem
        onClick={handleQuote}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        }
      >
        引用选择内容
      </ContextMenuItem>
      
      <ContextMenuDivider />
      
      {/* 添加到剪贴板 */}
      <ContextMenuItem
        onClick={handleAddToClipboard}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
        }
      >
        添加选择内容到剪贴板
      </ContextMenuItem>
      
      {/* 引用到新对话 */}
      {onOpenQuoteDialog && (
        <ContextMenuItem
          onClick={() => {
            if (actualSelectedText && onOpenQuoteDialog) {
              onOpenQuoteDialog(actualSelectedText);
              onClose();
            }
          }}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          }
        >
          引用选择内容到新对话
        </ContextMenuItem>
      )}
    </ContextMenu>
  );
};

export default MessageContextMenu;
