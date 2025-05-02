import React from 'react';
import ConversationCard from './ConversationCard';
import { ConversationMeta } from '../../types';

interface ConversationListProps {
  conversations: ConversationMeta[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onCreateNew: () => void;
  isLoading?: boolean;
}

/**
 * 对话列表组件
 * 包含新建按钮和对话卡片列表
 */
const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onCreateNew,
  isLoading = false
}) => {
  return (
    <div className="conversation-list" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 新对话按钮 */}
      <button
        className="new-conversation-button"
        onClick={onCreateNew}
        style={{
          backgroundColor: 'transparent',
          border: '1px solid var(--brand-color)',
          color: 'var(--brand-color)',
          padding: 'var(--space-sm) var(--space-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-md)',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新对话
      </button>
      
      {/* 对话列表 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 var(--space-xs) var(--space-xs) 0' // 右侧padding为滚动条预留空间
      }}>
        {isLoading ? (
          // 加载状态
          <div className="loading-state" style={{ 
            padding: 'var(--space-md)',
            color: 'var(--text-mid-gray)',
            textAlign: 'center'
          }}>
            加载对话列表...
          </div>
        ) : conversations.length === 0 ? (
          // 空状态
          <div className="empty-state" style={{ 
            padding: 'var(--space-md)',
            color: 'var(--text-mid-gray)',
            textAlign: 'center'
          }}>
            暂无对话记录
          </div>
        ) : (
          // 对话卡片列表
          conversations.map(conversation => (
            <ConversationCard
              key={conversation.id}
              id={conversation.id}
              title={conversation.title}
              preview={conversation.preview}
              updatedAt={conversation.updatedAt}
              isActive={activeConversationId === conversation.id}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
      
      {/* 添加样式 */}
      <style>{`
        .new-conversation-button:hover {
          background-color: var(--brand-color);
          color: var(--text-dark);
        }
        
        /* 自定义滚动条 */
        .conversation-list > div::-webkit-scrollbar {
          width: 5px;
        }
        
        .conversation-list > div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .conversation-list > div::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }
        
        .conversation-list > div::-webkit-scrollbar-thumb:hover {
          background: #666666;
        }
      `}</style>
    </div>
  );
};

export default ConversationList;
