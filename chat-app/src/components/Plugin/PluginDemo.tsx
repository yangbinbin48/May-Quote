import React, { useState, useEffect } from 'react';
import PromptEditor from './PromptEditor';
import ApiConfig from './ApiConfig';
import ResponsePreview from './ResponsePreview';
import { OpenAI } from 'openai';
import { saveConfig, getConfig, encryptData, decryptData } from '../../utils/db';

// 插件演示页面 - 用于测试和配置平行AI分析功能
const PluginDemo: React.FC = () => {
  // 用户输入状态
  const [userInput, setUserInput] = useState('我需要向公司CEO推销我们的新型智能手表产品，应该怎么说？');
  
  // 系统提示词状态
  const [systemPrompt, setSystemPrompt] = useState(`你是一个专业的内容分析助手，负责识别用户请求的意图并提供相应的功能建议。请仔细分析以下用户输入，判断是否符合特定场景，并按指定格式返回结构化JSON响应。

请分析：

{userPrompt}

分析任务：
1. 判断用户是否有需要生成销售话术的意图
2. 判断用户是否有需要生成产品市场分析报告的意图
3. 如果都不符合以上场景，则返回无需处理的响应

返回格式必须严格遵循以下JSON结构：
{
  "type": "a" | "b" | "none",
  "suggestion": {
    "text": "提示文本",
    "input": {
      // 对于type="a"(销售话术)场景：
      "product": "提取的产品名称",
      "position": "提取的目标客户职位"
      // 对于type="b"(市场分析)场景：
      "product": "提取的产品名称"
    }
  }
}

其中：
- 只有当明确识别出产品名称AND客户职位时，才返回type="a"
- 只有当明确识别出产品名称时，才返回type="b"
- 如果无法确定以上场景或缺少必要信息，返回type="none"

请注意input对象的结构会根据type值变化。确保返回格式为有效的JSON，不包含任何额外文本或解释。`);

  // 响应映射配置
  const [responseMapping, setResponseMapping] = useState({
    a: {
      text: "你是否想使用神谕的销售话术生成器，只需要一句话即可生成最全面的话术",
      actionLabel: "执行"
    },
    b: {
      text: "网络球可以一句话帮你生成一份结构清晰的产品调研分析报告",
      actionLabel: "执行"
    }
  });

  // API配置状态
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'deepseek-v3-250324',
    enabled: false
  });

  // 分析结果状态
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null); // 保存API的原始响应
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // 测试案例列表
  const testCases = [
    { 
      name: "销售话术示例", 
      input: "我需要向公司CEO推销我们的新型智能手表产品，应该怎么说？" 
    },
    { 
      name: "市场分析示例", 
      input: "帮我分析一下特斯拉Model Y在中国市场的竞争情况" 
    },
    { 
      name: "普通问题示例", 
      input: "今天北京的天气怎么样？" 
    }
  ];

  // 保存配置到localStorage
  useEffect(() => {
    const pluginConfig = {
      systemPrompt,
      responseMapping,
      apiConfig: { ...apiConfig, apiKey: '' } // 不保存API密钥
    };
    
    localStorage.setItem('pluginConfig', JSON.stringify(pluginConfig));
  }, [systemPrompt, responseMapping, apiConfig]);

  // 从IndexedDB和localStorage加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 尝试从IndexedDB加载配置
        let loadedFromDB = false;
        
        // 1. 加载系统提示词
        const dbSystemPrompt = await getConfig('plugin-system-prompt', '');
        if (dbSystemPrompt) {
          setSystemPrompt(dbSystemPrompt);
          loadedFromDB = true;
        }
        
        // 2. 加载响应映射
        const dbResponseMapping = await getConfig('plugin-response-mapping', '');
        if (dbResponseMapping) {
          try {
            const parsedMapping = JSON.parse(dbResponseMapping);
            setResponseMapping(parsedMapping);
            loadedFromDB = true;
          } catch (e) {
            console.error('解析响应映射失败:', e);
          }
        }
        
        // 3. 加载API配置
        const dbApiConfig = await getConfig('plugin-api-config', '');
        if (dbApiConfig) {
          try {
            const parsedApiConfig = JSON.parse(dbApiConfig);
            setApiConfig(prev => ({
              ...prev,
              baseUrl: parsedApiConfig.baseUrl || prev.baseUrl,
              model: parsedApiConfig.model || prev.model,
              enabled: parsedApiConfig.enabled || prev.enabled
            }));
            loadedFromDB = true;
          } catch (e) {
            console.error('解析API配置失败:', e);
          }
        }
        
        // 4. 加载API密钥
        const encryptedApiKey = await getConfig('secondary-api-key', '');
        if (encryptedApiKey) {
          const decryptedKey = decryptData(encryptedApiKey);
          if (decryptedKey) {
            setApiConfig(prev => ({
              ...prev,
              apiKey: decryptedKey
            }));
            loadedFromDB = true;
          }
        }
        
        // 如果没有从数据库加载到配置，则尝试从localStorage加载
        if (!loadedFromDB) {
          const savedConfig = localStorage.getItem('pluginConfig');
          
          if (savedConfig) {
            try {
              const parsedConfig = JSON.parse(savedConfig);
              setSystemPrompt(parsedConfig.systemPrompt || systemPrompt);
              setResponseMapping(parsedConfig.responseMapping || responseMapping);
              
              // 只加载除apiKey外的API配置
              if (parsedConfig.apiConfig) {
                setApiConfig(prev => ({
                  ...prev,
                  baseUrl: parsedConfig.apiConfig.baseUrl || prev.baseUrl,
                  model: parsedConfig.apiConfig.model || prev.model,
                  enabled: parsedConfig.apiConfig.enabled || prev.enabled
                }));
              }
            } catch (error) {
              console.error('从localStorage加载配置时出错:', error);
            }
          }
        } else {
          console.log('已从May数据库成功加载配置');
        }
        
      } catch (error) {
        console.error('加载配置时出错:', error);
      }
    };
    
    loadConfig();
  }, []);

  // 分析用户输入
  const analyzeUserInput = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      if (!apiConfig.apiKey) {
        throw new Error('请先配置API密钥');
      }
      
      // 替换提示词中的占位符
      const prompt = systemPrompt.replace('{userPrompt}', userInput);
      
      // 创建OpenAI客户端
      const client = new OpenAI({
        apiKey: apiConfig.apiKey,
        baseURL: apiConfig.baseUrl,
        dangerouslyAllowBrowser: true
      });
      
      // 发送请求
      const response = await client.chat.completions.create({
        model: apiConfig.model,
        messages: [
          { role: 'system', content: prompt }
        ]
      });
      
      // 处理响应
      const content = response.choices[0]?.message?.content || '';
      // 保存原始响应
      setRawResponse(content);
      
      try {
        // 尝试清理并解析JSON响应
        // 去除可能的Markdown代码块标记和其他非JSON字符
        const cleanedContent = content
          .replace(/^```(json)?/, '') // 移除开始的```json或```
          .replace(/```$/, '')        // 移除结束的```
          .replace(/^\s+|\s+$/g, '')  // 移除前后空白
          .replace(/\|$/, '');        // 移除末尾可能的|符号
          
        // 尝试解析JSON响应
        const parsedResult = JSON.parse(cleanedContent);
        setAnalysisResult(parsedResult);
      } catch (parseError) {
        console.error('解析JSON响应失败:', parseError);
        setAnalysisError(`AI返回的内容不是有效的JSON格式: ${content}`);
      }
    } catch (error: any) {
      console.error('分析过程出错:', error);
      setAnalysisError(`分析失败: ${error.message || '未知错误'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 加载测试案例
  const loadTestCase = (index: number) => {
    setUserInput(testCases[index].input);
  };

  return (
    <div className="app-container">
      {/* 顶部导航 */}
      <nav className="navbar" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 var(--space-lg)'
      }}>
        <div className="logo">May Plugin Demo</div>
        <button
          onClick={async () => {
            try {
              // 保存系统提示词
              await saveConfig('plugin-system-prompt', systemPrompt);
              
              // 保存响应映射
              await saveConfig('plugin-response-mapping', JSON.stringify(responseMapping));
              
              // 保存API配置（不含密钥）
              const apiConfigToSave = {
                baseUrl: apiConfig.baseUrl,
                model: apiConfig.model,
                enabled: apiConfig.enabled
              };
              await saveConfig('plugin-api-config', JSON.stringify(apiConfigToSave));
              
              // 加密并保存API密钥
              if (apiConfig.apiKey) {
                const encryptedKey = encryptData(apiConfig.apiKey);
                await saveConfig('secondary-api-key', encryptedKey);
              }
              
              alert('配置已成功保存到May数据库！');
            } catch (error) {
              console.error('保存配置失败:', error);
              alert('保存配置失败: ' + (error instanceof Error ? error.message : '未知错误'));
            }
          }}
          className="save-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            backgroundColor: 'transparent',
            color: 'var(--text-light-gray)',
            border: 'none',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--brand-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-light-gray)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          保存到May
        </button>
      </nav>
      
      {/* 主内容区 */}
      <div style={{ 
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--main-bg)',
        minHeight: 'calc(100vh - var(--nav-height))',
        color: 'var(--text-white)',
        overflowY: 'auto',  /* 添加垂直滚动 */
        maxHeight: 'calc(100vh - var(--nav-height))', /* 限制最大高度 */
        position: 'relative' /* 确保正确定位 */
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-xl)', 
          marginBottom: 'var(--space-lg)',
          color: 'var(--brand-color)'
        }}>
          平行AI分析插件配置
        </h1>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)'
        }}>
          {/* 左侧配置区 */}
          <div>
            {/* 用户输入区 */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
                用户输入模拟
              </h2>
              
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  resize: 'vertical',
                  color: 'var(--text-white)',
                  fontSize: 'var(--font-md)',
                  marginBottom: 'var(--space-sm)'
                }}
                placeholder="输入模拟用户提问..."
              />
              
              {/* 测试案例按钮 */}
              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-md)'
              }}>
                {testCases.map((testCase, index) => (
                  <button
                    key={index}
                    onClick={() => loadTestCase(index)}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-white)',
                      border: 'none',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-sm)'
                    }}
                  >
                    {testCase.name}
                  </button>
                ))}
              </div>
              
              {/* 分析按钮 */}
              <button
                onClick={analyzeUserInput}
                disabled={isAnalyzing || !apiConfig.apiKey || !apiConfig.enabled}
                style={{
                  backgroundColor: 'var(--brand-color)',
                  color: 'var(--text-dark)',
                  border: 'none',
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  cursor: (isAnalyzing || !apiConfig.apiKey || !apiConfig.enabled) ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--font-md)',
                  fontWeight: 'bold',
                  opacity: (isAnalyzing || !apiConfig.apiKey || !apiConfig.enabled) ? 0.5 : 1
                }}
              >
                {isAnalyzing ? '分析中...' : '测试分析'}
              </button>
              
              {!apiConfig.enabled && (
                <span style={{ 
                  marginLeft: 'var(--space-md)',
                  color: 'var(--text-mid-gray)',
                  fontSize: 'var(--font-sm)'
                }}>
                  请先启用API配置
                </span>
              )}
            </div>
            
            {/* API 配置 */}
            <ApiConfig 
              config={apiConfig}
              onConfigChange={setApiConfig}
            />
          </div>
          
          {/* 右侧区域 */}
          <div>
            {/* 系统提示词编辑器 */}
            <PromptEditor
              systemPrompt={systemPrompt}
              onPromptChange={setSystemPrompt}
              responseMapping={responseMapping}
              onResponseMappingChange={setResponseMapping}
            />
          </div>
        </div>
        
        {/* 结果展示区 */}
        <ResponsePreview
          result={analysisResult}
          rawResponse={rawResponse}
          error={analysisError}
          responseMapping={responseMapping}
        />
      </div>
    </div>
  );
};

export default PluginDemo;
