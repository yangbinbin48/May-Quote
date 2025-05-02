import React, { useRef, useEffect } from 'react';
import MessageItem, { Message } from './MessageItem';

import { ClipboardItem } from '../../types';

interface MessageListProps {
  messages: Message[];
  onContextMenu?: (event: React.MouseEvent, messageId: string) => void;
  onCopy?: (messageId: string) => void;
  onQuote?: (messageId: string) => void;
  onAddToClipboard?: (messageId: string) => void;
  onAddSelectedTextToClipboard?: (item: ClipboardItem) => void; // 新增：添加选中文本到剪贴板
  onQuoteToNewConversation?: (messageContent: string, userPrompt: string) => void; // 新增：引用到新对话
  onOpenQuoteDialog?: (content: string) => void; // 新增：打开引用对话框
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onContextMenu, 
  onCopy,
  onQuote,
  onAddToClipboard,
  onAddSelectedTextToClipboard,
  onQuoteToNewConversation,
  onOpenQuoteDialog
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 当新消息添加时自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 如果没有消息，显示空白状态
  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <p>没有消息。发送一条消息开始对话吧！</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          onContextMenu={onContextMenu}
          onCopy={onCopy}
          onQuote={onQuote}
          onAddToClipboard={onAddToClipboard}
          onAddSelectedTextToClipboard={onAddSelectedTextToClipboard}
          onQuoteToNewConversation={onQuoteToNewConversation}
          onOpenQuoteDialog={onOpenQuoteDialog}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
