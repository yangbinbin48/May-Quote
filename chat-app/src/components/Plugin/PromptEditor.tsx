import React, { useState } from 'react';

interface PromptEditorProps {
  systemPrompt: string;
  onPromptChange: (prompt: string) => void;
  responseMapping: {
    a: {
      text: string;
      actionLabel: string;
    };
    b: {
      text: string;
      actionLabel: string;
    };
  };
  onResponseMappingChange: (mapping: any) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ 
  systemPrompt, 
  onPromptChange,
  responseMapping,
  onResponseMappingChange
}) => {
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'mapping'
  
  // 处理提示文本变化
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value);
  };
  
  // 处理响应映射文本变化
  const handleMappingChange = (type: 'a' | 'b', field: 'text' | 'actionLabel', value: string) => {
    onResponseMappingChange({
      ...responseMapping,
      [type]: {
        ...responseMapping[type],
        [field]: value
      }
    });
  };
  
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
        系统提示词配置
      </h2>
      
      {/* 标签页切换 */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: 'var(--space-md)'
      }}>
        <button
          onClick={() => setActiveTab('prompt')}
          style={{
            backgroundColor: activeTab === 'prompt' ? 'var(--card-bg)' : 'transparent',
            color: 'var(--text-white)',
            border: 'none',
            padding: 'var(--space-sm) var(--space-md)',
            borderBottom: activeTab === 'prompt' 
              ? '2px solid var(--brand-color)' 
              : '2px solid transparent',
            borderRadius: 0,
            cursor: 'pointer'
          }}
        >
          提示词编辑
        </button>
        <button
          onClick={() => setActiveTab('mapping')}
          style={{
            backgroundColor: activeTab === 'mapping' ? 'var(--card-bg)' : 'transparent',
            color: 'var(--text-white)',
            border: 'none',
            padding: 'var(--space-sm) var(--space-md)',
            borderBottom: activeTab === 'mapping' 
              ? '2px solid var(--brand-color)' 
              : '2px solid transparent',
            borderRadius: 0,
            cursor: 'pointer'
          }}
        >
          响应配置
        </button>
      </div>
      
      {/* 提示词编辑区 */}
      {activeTab === 'prompt' && (
        <div>
          <textarea
            value={systemPrompt}
            onChange={handlePromptChange}
            style={{
              width: '100%',
              height: '500px',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              color: 'var(--text-white)',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
          <p style={{ 
            marginTop: 'var(--space-xs)', 
            color: 'var(--text-mid-gray)',
            fontSize: 'var(--font-xs)'
          }}>
            提示: 使用 {'{userPrompt}'} 作为用户输入的占位符
          </p>
        </div>
      )}
      
      {/* 响应映射配置 */}
      {activeTab === 'mapping' && (
        <div>
          {/* 销售话术响应配置 */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ 
              marginBottom: 'var(--space-sm)',
              color: 'var(--text-light-gray)',
              fontSize: 'var(--font-md)'
            }}>
              销售话术提示 (type="a")
            </h3>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--space-xs)',
                color: 'var(--text-mid-gray)'
              }}>
                提示文本
              </label>
              <input
                type="text"
                value={responseMapping.a.text}
                onChange={(e) => handleMappingChange('a', 'text', e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  color: 'var(--text-white)'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--space-xs)',
                color: 'var(--text-mid-gray)'
              }}>
                按钮文本
              </label>
              <input
                type="text"
                value={responseMapping.a.actionLabel}
                onChange={(e) => handleMappingChange('a', 'actionLabel', e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  color: 'var(--text-white)'
                }}
              />
            </div>
          </div>
          
          {/* 市场分析响应配置 */}
          <div>
            <h3 style={{ 
              marginBottom: 'var(--space-sm)',
              color: 'var(--text-light-gray)',
              fontSize: 'var(--font-md)'
            }}>
              市场分析提示 (type="b")
            </h3>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--space-xs)',
                color: 'var(--text-mid-gray)'
              }}>
                提示文本
              </label>
              <input
                type="text"
                value={responseMapping.b.text}
                onChange={(e) => handleMappingChange('b', 'text', e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  color: 'var(--text-white)'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--space-xs)',
                color: 'var(--text-mid-gray)'
              }}>
                按钮文本
              </label>
              <input
                type="text"
                value={responseMapping.b.actionLabel}
                onChange={(e) => handleMappingChange('b', 'actionLabel', e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  color: 'var(--text-white)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
