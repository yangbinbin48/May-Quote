import React from 'react';

interface ApiConfigProps {
  config: {
    apiKey: string;
    baseUrl: string;
    model: string;
    enabled: boolean;
  };
  onConfigChange: (newConfig: any) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ config, onConfigChange }) => {
  // 处理API密钥变更
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      apiKey: e.target.value
    });
  };
  
  // 处理基础URL变更
  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      baseUrl: e.target.value
    });
  };
  
  // 处理模型变更
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({
      ...config,
      model: e.target.value
    });
  };
  
  // 处理启用状态变更
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      enabled: e.target.checked
    });
  };
  
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
        辅助AI服务配置
      </h2>
      
      {/* API密钥输入 */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label 
          htmlFor="api-key-input" 
          style={{ 
            display: 'block', 
            marginBottom: 'var(--space-xs)',
            color: 'var(--text-mid-gray)'
          }}
        >
          API密钥
        </label>
        <input
          id="api-key-input"
          type="password"
          value={config.apiKey}
          onChange={handleApiKeyChange}
          placeholder="输入API密钥"
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
      
      {/* 基础URL输入 */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label 
          htmlFor="base-url-input"
          style={{ 
            display: 'block', 
            marginBottom: 'var(--space-xs)',
            color: 'var(--text-mid-gray)'
          }}
        >
          API基础URL
        </label>
        <input
          id="base-url-input"
          type="text"
          value={config.baseUrl}
          onChange={handleBaseUrlChange}
          placeholder="API基础URL"
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
      
      {/* 模型选择 */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label 
          htmlFor="model-select"
          style={{ 
            display: 'block', 
            marginBottom: 'var(--space-xs)',
            color: 'var(--text-mid-gray)'
          }}
        >
          模型选择
        </label>
        <select
          id="model-select"
          value={config.model}
          onChange={handleModelChange}
          style={{
            width: '100%',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-sm)',
            color: 'var(--text-white)'
          }}
        >
          <option value="deepseek-v3-250324">火山Deepseek V3</option>
        </select>
      </div>
      
      {/* 功能启用开关 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginTop: 'var(--space-lg)'
      }}>
        <label
          htmlFor="plugin-enabled"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            id="plugin-enabled"
            type="checkbox"
            checked={config.enabled}
            onChange={handleEnabledChange}
            style={{
              marginRight: 'var(--space-sm)'
            }}
          />
          <span style={{ color: 'var(--text-white)' }}>
            启用平行AI分析功能
          </span>
        </label>
      </div>
      
      {/* 提示信息 */}
      <p style={{ 
        marginTop: 'var(--space-sm)',
        color: 'var(--text-mid-gray)',
        fontSize: 'var(--font-xs)'
      }}>
        注意：启用后，系统将同时向主要AI和辅助AI发送用户输入
      </p>
    </div>
  );
};

export default ApiConfig;
