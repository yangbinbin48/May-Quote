import React, { useState } from 'react';
import { ClipboardItem } from '../../types';
import { formatSmartTime } from '../../utils/date-utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useReference } from '../../contexts/ReferenceContext';

interface ClipboardCardProps {
  item: ClipboardItem;
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onCopy?: (id: string) => void;
  onQuote?: (id: string) => void;
  onLocate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * 剪贴板卡片组件
 * 
 * 显示单个剪贴板项内容，支持Markdown渲染
 * 提供复制、引用、定位和删除功能
 */
const ClipboardCard: React.FC<ClipboardCardProps> = ({
  item,
  selectMode = false,
  selected = false,
  onSelect,
  onCopy,
  onQuote,
  onLocate,
  onDelete
}) => {
  // 获取引用功能 hook
  const { addReference } = useReference();
  // 处理复制
  const handleCopy = () => {
    if (onCopy) {
      onCopy(item.id);
      // 复制到剪贴板
      navigator.clipboard.writeText(item.content);
    }
  };
  
  // 处理引用
  const handleQuote = () => {
    // 直接添加剪贴板内容到引用
    addReference(item.content);
    
    // 同时保留原始onQuote回调以保持兼容性
    if (onQuote) {
      onQuote(item.id);
    }
  };
  
  // 处理定位到源消息
  const handleLocate = () => {
    if (onLocate) {
      onLocate(item.id);
    }
  };
  
  // 处理删除
  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };
  
  // 处理选择
  const handleSelect = () => {
    if (selectMode && onSelect) {
      onSelect(item.id, !selected);
    }
  };
  
  return (
    <div
      className={`clipboard-card ${selectMode && selected ? 'selected' : ''}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        border: `1px solid ${selected ? 'var(--brand-color)' : 'var(--border-color)'}`,
        position: 'relative',
        transition: 'border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: selectMode ? 'pointer' : 'default',
      }}
      onClick={() => selectMode && handleSelect()}
    >
      {/* 选择框 */}
      {selectMode && (
        <div
          className="selection-checkbox"
          style={{
            position: 'absolute',
            left: '-30px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            aria-label="选择此卡片"
          />
        </div>
      )}
      
      {/* Markdown内容 */}
      <div className="markdown-body" style={{ marginBottom: 'var(--space-sm)' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match;
              return !inline ? (
                <SyntaxHighlighter
                  // @ts-ignore - 忽略类型错误，atomDark样式在运行时工作正常
                  style={atomDark}
                  language={match![1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {item.content}
        </ReactMarkdown>
      </div>
      
      {/* 底部信息和操作按钮 */}
      <div
        className="card-footer"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--space-sm)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: 'var(--space-sm)',
        }}
      >
        {/* 时间信息 */}
        <div
          className="timestamp"
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--text-mid-gray)',
          }}
        >
          {formatSmartTime(item.timestamp)}
        </div>
        
        {/* 操作按钮组 */}
        <div
          className="actions"
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
          }}
        >
          {/* 复制按钮 */}
          <ActionButton
            onClick={handleCopy}
            label="复制"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            }
          />
          
          {/* 引用按钮 */}
          <ActionButton
            onClick={handleQuote}
            label="引用"
            disabled={false}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
            }
          />
          
          {/* 定位按钮 */}
          <ActionButton
            onClick={handleLocate}
            label="定位到源消息"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            }
          />
          
          {/* 删除按钮 */}
          <ActionButton
            onClick={handleDelete}
            label="删除"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

// 操作按钮子组件
interface ActionButtonProps {
  onClick: () => void;
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
            border: '1px solid #555', // 添加边框增强可见性
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default ClipboardCard;
