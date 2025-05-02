import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
import { getConfig, decryptData } from '../../utils/storage-db';

/**
 * 平行AI分析插件
 * 
 * 这个组件用于在May的实际对话流程中集成平行AI分析功能。
 * 工作流程：
 * 1. 用户在May中输入消息
 * 2. 消息同时发送给主AI服务和辅助AI服务
 * 3. 辅助AI分析用户意图，返回结构化JSON
 * 4. 如果识别出特定意图，在界面上显示相应提示
 */

interface ParallelAIPluginProps {
  userInput: string;  // 用户输入内容
  showSuggestion: boolean; // 控制显示/隐藏建议
}

interface SuggestionData {
  type: 'a' | 'b' | 'none';
  suggestion?: {
    text: string;
    input: any;
  };
}

const ParallelAIPlugin: React.FC<ParallelAIPluginProps> = ({ 
  userInput,
  showSuggestion
}) => {
  // 插件配置状态
  const [pluginConfig, setPluginConfig] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 从IndexedDB加载插件配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 加载系统提示词
        const systemPrompt = await getConfig('plugin-system-prompt', '');
        
        // 加载响应映射
        const responseMappingStr = await getConfig('plugin-response-mapping', '');
        let responseMapping = null;
        if (responseMappingStr) {
          try {
            responseMapping = JSON.parse(responseMappingStr);
          } catch (e) {
            console.error('解析响应映射失败:', e);
          }
        }
        
        // 加载API配置
        const apiConfigStr = await getConfig('plugin-api-config', '');
        let apiConfig = null;
        if (apiConfigStr) {
          try {
            apiConfig = JSON.parse(apiConfigStr);
          } catch (e) {
            console.error('解析API配置失败:', e);
          }
        }
        
        // 如果从数据库加载到配置，则使用数据库配置
        if (systemPrompt && responseMapping && apiConfig) {
          setPluginConfig({
            systemPrompt,
            responseMapping,
            apiConfig
          });
          console.log('已从May数据库加载插件配置');
        } else {
          // 否则尝试从localStorage加载（兼容旧版）
          const savedConfig = localStorage.getItem('pluginConfig');
          if (savedConfig) {
            try {
              const config = JSON.parse(savedConfig);
              setPluginConfig(config);
              console.log('已从localStorage加载插件配置');
            } catch (error) {
              console.error('加载插件配置失败:', error);
            }
          }
        }
      } catch (error) {
        console.error('加载插件配置失败:', error);
      }
    };
    
    loadConfig();
  }, []);
  
  // 当用户输入变化时，分析用户意图
  useEffect(() => {
    // 如果没有用户输入或插件配置，则不执行分析
    if (!userInput || !pluginConfig) {
      return;
    }
    
    // 如果插件未启用，则不执行分析
    if (!pluginConfig.apiConfig?.enabled) {
      return;
    }
    
    const analyzeUserInput = async () => {
      setIsLoading(true);
      
      try {
        // 获取API密钥和配置
        // 先尝试从数据库获取API密钥
        let apiKey = '';
        const encryptedApiKey = await getConfig('secondary-api-key', '');
        if (encryptedApiKey) {
          apiKey = decryptData(encryptedApiKey);
        }
        
        // 如果数据库没有，尝试从localStorage获取（兼容旧版）
        if (!apiKey) {
          apiKey = localStorage.getItem('secondaryApiKey') || '';
        }
        
        if (!apiKey) {
          throw new Error('未找到API密钥，请在配置页面设置');
        }
        
        const { apiConfig, systemPrompt } = pluginConfig;
        
        // 创建OpenAI客户端
        const client = new OpenAI({
          apiKey: apiKey || '',
          baseURL: apiConfig.baseUrl,
          dangerouslyAllowBrowser: true
        });
        
        // 替换提示词中的占位符
        const prompt = systemPrompt.replace('{userPrompt}', userInput);
        
        // 发送请求
        const response = await client.chat.completions.create({
          model: apiConfig.model,
          messages: [
            { role: 'system', content: prompt }
          ]
        });
        
        // 处理响应
        const content = response.choices[0]?.message?.content || '';
        
        try {
          // 尝试解析JSON响应
          const result = JSON.parse(content);
          setSuggestion(result);
        } catch (parseError) {
          console.error('解析JSON响应失败:', parseError);
          setSuggestion(null);
        }
      } catch (error) {
        console.error('平行AI分析错误:', error);
        setSuggestion(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // 调用分析函数
    analyzeUserInput();
  }, [userInput, pluginConfig]);
  
  // 处理忽略建议
  const handleIgnore = () => {
    setSuggestion(null);
  };
  
  // 处理执行建议
  const handleExecute = () => {
    // 在这里实现执行相应功能的逻辑
    // 例如提交到另一个AI服务，或者启动特定功能
    console.log('执行建议:', suggestion);
    
    // 执行后清空建议
    setSuggestion(null);
  };
  
  // 如果没有建议或建议类型为none，则不显示任何内容
  if (!showSuggestion || !suggestion || suggestion.type === 'none' || isLoading) {
    return null;
  }
  
  // 根据建议类型获取对应的配置
  const mappingType = suggestion.type as 'a' | 'b';
  const mappingConfig = pluginConfig?.responseMapping?.[mappingType];
  
  if (!mappingConfig) {
    return null;
  }
  
  // 渲染建议UI
  return (
    <div style={{ 
      backgroundColor: 'var(--secondary-bg)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-lg)',
      margin: 'var(--space-md) 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 渲染提示信息 */}
      <p style={{ 
        marginBottom: 'var(--space-sm)',
        color: 'var(--brand-color)',
        fontWeight: 'bold'
      }}>
        {mappingConfig.text}
      </p>
      
      {/* 渲染预填充的输入 */}
      <div style={{ 
        backgroundColor: 'var(--card-bg)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-md)',
        color: 'var(--text-light-gray)'
      }}>
        {suggestion.type === 'a' ? (
          <span>产品：{suggestion.suggestion?.input.product}，目标客户：{suggestion.suggestion?.input.position}</span>
        ) : (
          <span>产品：{suggestion.suggestion?.input.product}</span>
        )}
      </div>
      
      {/* 渲染按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={handleIgnore}
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-white)',
            border: 'none',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          忽略
        </button>
        
        <button
          onClick={handleExecute}
          style={{
            backgroundColor: 'var(--brand-color)',
            color: 'var(--text-dark)',
            border: 'none',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {mappingConfig.actionLabel}
        </button>
      </div>
    </div>
  );
};

export default ParallelAIPlugin;

/**
 * 集成指南:
 * 
 * 1. 在ChatInterface.tsx中导入此组件:
 *    import ParallelAIPlugin from '../Plugin/ParallelAIPlugin';
 * 
 * 2. 在InputArea组件附近添加此组件:
 *    <ParallelAIPlugin 
 *      userInput={currentUserInput} 
 *      showSuggestion={true}
 *    />
 * 
 * 3. 创建机制保存辅助AI的API密钥:
 *    localStorage.setItem('secondaryApiKey', apiKey);
 * 
 * 4. 当用户按fn+A+P+I时，重定向到配置页面:
 *    window.location.href = '?demo=plugin';
 */
