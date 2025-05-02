import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NewConversationDialogProps {
  isOpen: boolean;
  title: string;
  referenceContent: string;
  onConfirm: (prompt: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * 引用到新对话框组件
 * 展示引用内容，让用户输入提示词，并创建新的对话
 */
const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  isOpen,
  title,
  referenceContent,
  onConfirm,
  onCancel,
  isLoading = false,
  error = null
}) => {
  // 用户输入的提示词
  const [prompt, setPrompt] = useState('');
  
  // 处理确认按钮点击
  const handleConfirm = () => {
    // 如果提示词为空，不执行操作
    if (!prompt.trim()) return;
    
    // 调用确认回调函数，传递用户输入的提示词
    onConfirm(prompt);
  };
  
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
        maxWidth: '600px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        color: 'var(--text-white)',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>{title}</h2>
        
        {/* 引用内容区域 */}
        <div style={{
          backgroundColor: 'var(--main-bg)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)',
          maxHeight: '30vh',
          overflowY: 'auto',
          borderLeft: '3px solid var(--brand-color)'
        }}>
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline ? (
                    <SyntaxHighlighter
                      // @ts-ignore
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
              {referenceContent}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* 输入框 */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label 
            htmlFor="prompt-input" 
            style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: 'var(--font-sm)'
            }}
          >
            请输入你的提示词：
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="基于引用内容，我想要..."
            style={{
              width: '100%',
              minHeight: '100px',
              backgroundColor: 'var(--main-bg)',
              color: 'var(--text-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm)',
              resize: 'vertical',
              fontSize: 'var(--font-md)'
            }}
          />
        </div>
        
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
          marginTop: 'auto'
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
            取消
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading || !prompt.trim()}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--brand-color)',
              color: 'var(--text-dark)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isLoading || !prompt.trim() ? 0.7 : 1
            }}
          >
            {isLoading ? '处理中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationDialog;
