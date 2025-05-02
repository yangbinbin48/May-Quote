import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface TextSelectionState {
  isSelecting: boolean;   // 是否处于选择状态
  hasSelection: boolean;  // 是否有文本被选中
  selectedText: string;   // 选中的文本内容
  cachedSelectedText: string; // 缓存的选中文本，在右键点击时保存
  position: Position;     // 右键菜单显示的位置
  messageId?: string;     // 选择发生在哪个消息内
  cachedMessageId?: string; // 缓存的消息ID，在右键点击时保存
  isMarkdown: boolean;    // 选择的是否是Markdown内容
}

/**
 * 文本选择Hook
 * 用于处理消息气泡中的文本选择、右键菜单显示等
 */
export function useTextSelection() {
  // 文本选择状态
  const [selectionState, setSelectionState] = useState<TextSelectionState>({
    isSelecting: false,
    hasSelection: false,
    selectedText: '',
    cachedSelectedText: '',
    position: { x: 0, y: 0 },
    messageId: undefined,
    cachedMessageId: undefined,
    isMarkdown: false
  });
  
  // 右键菜单显示状态
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  // 处理文本选择变化
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed) {
      // 没有选择文本或选择已折叠（没有范围）
      setSelectionState(prev => ({
        ...prev,
        hasSelection: false,
        selectedText: ''
      }));
      return;
    }
    
    const selectedText = selection.toString().trim();
    const hasSelection = selectedText.length > 0;
    
    if (hasSelection) {
      // 找到包含选区的消息元素
      let messageElement = null;
      let isMarkdown = false;
      
      // 向上遍历DOM树，寻找包含选区的消息元素
      let currentNode = selection.anchorNode;
      while (currentNode && !messageElement) {
        // 查找消息元素
        if (currentNode.nodeType === 1) {
          const element = currentNode as Element;
          
          // 检查是否是消息项
          if (element.id && element.id.startsWith('message-')) {
            messageElement = element;
          }
          
          // 检查是否在markdown内容中
          if (element.classList && element.classList.contains('markdown-body')) {
            isMarkdown = true;
          }
        }
        currentNode = currentNode.parentNode;
      }
      
      // 获取消息ID
      const messageId = messageElement?.id ? messageElement.id.replace('message-', '') : undefined;
      
      setSelectionState(prev => ({
        ...prev,
        hasSelection,
        selectedText,
        messageId,
        isMarkdown
      }));
    } else {
      setSelectionState(prev => ({
        ...prev,
        hasSelection: false,
        selectedText: ''
      }));
    }
  }, []);
  
  // 处理右键点击事件
  const handleContextMenu = useCallback((event: MouseEvent) => {
    // 获取当前选择
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    const hasSelection = selectedText.length > 0;
    
    // 只有当有文本被选中时才阻止默认行为并显示自定义菜单
    if (hasSelection) {
      event.preventDefault();
      
      console.log('[DEBUG-selection] 右键点击时缓存选中文本:', selectedText.substring(0, 20) + (selectedText.length > 20 ? '...' : ''));
      
      // 查找消息ID
      let messageId: string | undefined;
      let isMarkdown = false;
      
      // 向上遍历DOM树找到消息容器
      let currentNode = selection?.anchorNode;
      while (currentNode && !messageId) {
        if (currentNode.nodeType === 1) {
          const element = currentNode as Element;
          if (element.id && element.id.startsWith('message-')) {
            messageId = element.id.replace('message-', '');
          }
          if (element.classList && element.classList.contains('markdown-body')) {
            isMarkdown = true;
          }
        }
        currentNode = currentNode.parentNode;
      }
      
      // 立即缓存选中文本和消息ID，确保右键菜单操作时能访问到正确的文本
      setSelectionState(prev => ({
        ...prev,
        hasSelection: true,
        selectedText: selectedText,
        cachedSelectedText: selectedText, // 缓存选中的文本
        position: { x: event.clientX, y: event.clientY },
        messageId,
        cachedMessageId: messageId, // 缓存消息ID
        isMarkdown
      }));
      
      // 显示上下文菜单
      setShowContextMenu(true);
    }
  }, []);
  
  // 关闭上下文菜单
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);
  
  // 清除选择
  const clearSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    
    setSelectionState({
      isSelecting: false,
      hasSelection: false,
      selectedText: '',
      cachedSelectedText: '',
      position: { x: 0, y: 0 },
      messageId: undefined,
      cachedMessageId: undefined,
      isMarkdown: false
    });
    
    setShowContextMenu(false);
  }, []);
  
  // 监听文本选择事件
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', closeContextMenu);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', closeContextMenu);
    };
  }, [handleSelectionChange, handleContextMenu, closeContextMenu]);
  
  return {
    ...selectionState,
    // 使用缓存的文本和消息ID进行菜单操作
    selectedTextForMenu: selectionState.cachedSelectedText || selectionState.selectedText,
    messageIdForMenu: selectionState.cachedMessageId || selectionState.messageId,
    showContextMenu,
    clearSelection,
    closeContextMenu
  };
}
