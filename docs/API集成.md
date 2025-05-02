# ChatGPT式对话应用API集成方案

## OpenAI API集成

### API概述
本应用将主要集成OpenAI的GPT系列API，用于提供对话功能。API集成方案设计满足以下特点：

1. 完全客户端实现，无需服务器中转
2. 支持用户配置自己的API密钥
3. 保持对话上下文，实现连贯交流
4. 支持灵活的模型和参数配置

### API端点

主要使用的端点：
- **Chat Completions**: `https://api.openai.com/v1/chat/completions`

### 认证方式

使用API密钥认证：
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};
```

## 请求构建

### 基础请求结构
```typescript
interface ChatCompletionRequest {
  model: string;            // 模型名称，如"gpt-4"
  messages: ChatMessage[];  // 消息历史，包含上下文
  temperature?: number;     // 随机性，0-2之间
  top_p?: number;           // 核采样替代温度
  n?: number;               // 生成备选回复数量
  max_tokens?: number;      // 最大输出token数
  presence_penalty?: number; // 主题重复惩罚，-2.0到2.0
  frequency_penalty?: number; // 词频惩罚，-2.0到2.0
  stop?: string[];          // 停止生成的标记
  stream?: boolean;         // 是否流式响应
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### 上下文构建示例
```typescript
// 构建带有上下文的请求
function buildChatRequest(conversation: Conversation, newMessage: string): ChatCompletionRequest {
  // 获取系统提示
  const systemPrompt = localStorage.getItem('systemPrompt') || '你是一个有帮助的AI助手。';
  
  // 构建消息历史
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // 添加最近N轮对话作为上下文（避免超出模型token限制）
  const recentMessages = getRecentMessages(conversation, 10);
  messages.push(...recentMessages);
  
  // 添加新消息
  messages.push({ role: 'user', content: newMessage });
  
  // 从设置获取参数
  const settings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
  
  return {
    model: settings.model || 'gpt-3.5-turbo',
    messages,
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 2000,
    presence_penalty: settings.presencePenalty || 0,
    frequency_penalty: settings.frequencyPenalty || 0,
  };
}
```

## API调用实现

### 基本调用函数
```typescript
async function callChatAPI(request: ChatCompletionRequest): Promise<string> {
  // 获取API密钥
  const encryptedApiKey = JSON.parse(localStorage.getItem('apiSettings') || '{}').apiKey;
  const apiKey = decryptData(encryptedApiKey, getUserPassphrase());
  
  if (!apiKey) {
    throw new Error('未设置API密钥');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求失败');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}
```

### 流式响应实现
```typescript
async function streamChatAPI(
  request: ChatCompletionRequest, 
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
): Promise<void> {
  // 获取API密钥
  const encryptedApiKey = JSON.parse(localStorage.getItem('apiSettings') || '{}').apiKey;
  const apiKey = decryptData(encryptedApiKey, getUserPassphrase());
  
  if (!apiKey) {
    throw new Error('未设置API密钥');
  }
  
  // 确保请求是流式的
  request.stream = true;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求失败');
    }
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');
    
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === '[DONE]') continue;
            
            const json = JSON.parse(jsonStr);
            const content = json.choices[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch (e) {
            console.warn('解析流数据失败', e);
          }
        }
      }
    }
    
    onComplete(fullText);
  } catch (error) {
    console.error('流式API调用失败:', error);
    throw error;
  }
}
```

## 模型与参数配置

### 支持的模型
```typescript
interface ModelOption {
  id: string;       // 模型标识符
  name: string;     // 显示名称
  maxTokens: number; // 最大token数
  costPer1kTokens: number; // 每1k token成本（美分）
}

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, costPer1kTokens: 0.5 },
  { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, costPer1kTokens: 3.0 },
  { id: 'gpt-4-32k', name: 'GPT-4 (32K)', maxTokens: 32768, costPer1kTokens: 6.0 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, costPer1kTokens: 2.0 }
];
```

### 参数说明与推荐值
```typescript
interface ParameterGuide {
  name: string;          // 参数名
  description: string;   // 描述
  defaultValue: number;  // 默认值
  min: number;           // 最小值
  max: number;           // 最大值
  step: number;          // 步长
  recommendedUse: string; // 推荐用途
}

const PARAMETER_GUIDES: Record<string, ParameterGuide> = {
  temperature: {
    name: '温度',
    description: '控制生成文本的随机性。较高的值使输出更随机，较低的值使其更确定和集中。',
    defaultValue: 0.7,
    min: 0,
    max: 2,
    step: 0.1,
    recommendedUse: '创意任务用0.7-1.0，精确任务用0-0.3'
  },
  topP: {
    name: '核采样',
    description: '另一种替代温度采样的方法。模型仅考虑累积概率为topP的token子集。',
    defaultValue: 1.0,
    min: 0,
    max: 1,
    step: 0.05,
    recommendedUse: '通常保持为1.0，除非需要控制确定性'
  },
  presencePenalty: {
    name: '主题重复惩罚',
    description: '减少模型谈论新主题的可能性。正值鼓励讨论新主题。',
    defaultValue: 0,
    min: -2,
    max: 2,
    step: 0.1,
    recommendedUse: '避免主题重复时使用0.1-0.5'
  },
  frequencyPenalty: {
    name: '词频惩罚',
    description: '减少特定单词重复的可能性。正值减少重复词。',
    defaultValue: 0,
    min: -2,
    max: 2,
    step: 0.1,
    recommendedUse: '减少逐字重复时使用0.1-0.8'
  }
};
```

## 错误处理策略

### 常见错误及处理方式
```typescript
// 错误类型定义
enum ApiErrorType {
  AUTHENTICATION = 'authentication',
  QUOTA_EXCEEDED = 'quota_exceeded',
  RATE_LIMIT = 'rate_limit',
  INVALID_REQUEST = 'invalid_request',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown'
}

// 错误处理函数
function handleApiError(error: any): { type: ApiErrorType, message: string } {
  if (!error.response) {
    return {
      type: ApiErrorType.NETWORK_ERROR,
      message: '网络连接错误，请检查您的互联网连接'
    };
  }
  
  const status = error.response.status;
  const data = error.response.data || {};
  
  switch (status) {
    case 401:
      return {
        type: ApiErrorType.AUTHENTICATION,
        message: 'API密钥无效，请检查您的API密钥设置'
      };
    case 429:
      if (data.error?.type?.includes('rate_limit')) {
        return {
          type: ApiErrorType.RATE_LIMIT,
          message: '已达到API速率限制，请稍后再试'
        };
      } else {
        return {
          type: ApiErrorType.QUOTA_EXCEEDED,
          message: '已超过API配额限制，请检查您的账单设置'
        };
      }
    case 400:
      return {
        type: ApiErrorType.INVALID_REQUEST,
        message: `请求无效: ${data.error?.message || '未知错误'}`
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: ApiErrorType.SERVER_ERROR,
        message: 'OpenAI服务器错误，请稍后再试'
      };
    default:
      return {
        type: ApiErrorType.UNKNOWN,
        message: `未知错误: ${data.error?.message || '请稍后再试'}`
      };
  }
}

// 用户友好的错误提示与建议
function getUserFriendlyErrorMessage(errorType: ApiErrorType): string {
  switch (errorType) {
    case ApiErrorType.AUTHENTICATION:
      return '您的API密钥似乎无效。请检查API密钥是否正确输入，或尝试重新生成新的API密钥。';
    case ApiErrorType.QUOTA_EXCEEDED:
      return '您的OpenAI账户已超出使用限额。请检查您的账单信息或增加使用限额。';
    case ApiErrorType.RATE_LIMIT:
      return '请求过于频繁，OpenAI API暂时限制了访问。请等待几分钟后再试。';
    case ApiErrorType.INVALID_REQUEST:
      return '请求包含无效参数。这可能是由于消息过长或包含不允许的内容。请尝试简化您的请求。';
    case ApiErrorType.SERVER_ERROR:
      return 'OpenAI服务器暂时遇到问题。这通常是暂时性的，请稍后再试。';
    case ApiErrorType.NETWORK_ERROR:
      return '无法连接到OpenAI服务器。请检查您的网络连接，或确认您没有使用不兼容的网络代理。';
    default:
      return '发生未知错误。如果问题持续存在，请尝试刷新页面或检查OpenAI服务状态。';
  }
}
```

## 费用管理与监控

### Token计数估算
```typescript
// 大致估算英文文本token数
function estimateTokenCount(text: string): number {
  // OpenAI的tokenizer平均每个token约为4个字符（英文）
  return Math.ceil(text.length / 4);
}

// 估算中文文本token数
function estimateChineseTokenCount(text: string): number {
  // 中文大约每个字符是1个token
  const chineseCharCount = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
  // 非中文部分按英文算法计算
  const nonChineseText = text.replace(/[\u4e00-\u9fa5]/g, '');
  const nonChineseTokens = estimateTokenCount(nonChineseText);
  
  return chineseCharCount + nonChineseTokens;
}

// 估算请求成本
function estimateRequestCost(
  messages: ChatMessage[],
  model: string
): { inputTokens: number, estimatedCost: number } {
  // 合并所有消息文本
  const allText = messages.map(m => m.content).join(' ');
  
  // 估算token数
  const containsChinese = /[\u4e00-\u9fa5]/.test(allText);
  const tokenCount = containsChinese 
    ? estimateChineseTokenCount(allText)
    : estimateTokenCount(allText);
  
  // 查找模型成本
  const modelInfo = AVAILABLE_MODELS.find(m => m.id === model);
  const costPer1kTokens = modelInfo?.costPer1kTokens || 0.5; // 默认按GPT-3.5计算
  
  // 计算成本（美分）
  const estimatedCost = (tokenCount / 1000) * costPer1kTokens;
  
  return {
    inputTokens: tokenCount,
    estimatedCost
  };
}
```

### 用量追踪
```typescript
interface UsageRecord {
  date: string;          // 日期，格式YYYY-MM-DD
  tokensUsed: number;    // 使用的token数
  estimatedCost: number; // 估计成本（美分）
  conversations: number; // 会话数量
  messages: number;      // 消息数量
}

// 记录用量
function trackUsage(tokensUsed: number, cost: number): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 获取现有记录
  const usageData = JSON.parse(localStorage.getItem('usageStats') || '{}');
  const todayStats = usageData[today] || { 
    tokensUsed: 0, 
    estimatedCost: 0,
    conversations: 0,
    messages: 0
  };
  
  // 更新今日统计
  todayStats.tokensUsed += tokensUsed;
  todayStats.estimatedCost += cost;
  todayStats.messages += 1;
  
  // 保存回本地存储
  usageData[today] = todayStats;
  localStorage.setItem('usageStats', JSON.stringify(usageData));
}
```

## 替代API提供商集成

本应用设计支持未来扩展到其他API提供商。以下是扩展架构：

```typescript
// API提供商接口
interface AIProvider {
  id: string;                 // 唯一标识
  name: string;               // 显示名称
  authenticationType: 'apiKey' | 'oauth' | 'other'; // 认证类型
  supportedModels: ModelOption[]; // 支持的模型
  
  // 方法
  sendChatMessage: (
    messages: ChatMessage[], 
    options: any
  ) => Promise<string>;
  
  streamChatMessage: (
    messages: ChatMessage[],
    options: any,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ) => Promise<void>;
}

// 实现示例：OpenAI提供商
class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  authenticationType = 'apiKey';
  supportedModels = AVAILABLE_MODELS;
  
  async sendChatMessage(messages, options) {
    // 实现...使用前面定义的函数
  }
  
  async streamChatMessage(messages, options, onChunk, onComplete) {
    // 实现...使用前面定义的函数
  }
}

// 实现示例：未来可添加其他提供商
class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';
  authenticationType = 'apiKey';
  supportedModels = [
    { id: 'claude-v1', name: 'Claude v1', maxTokens: 9000, costPer1kTokens: 1.1 },
    { id: 'claude-instant', name: 'Claude Instant', maxTokens: 9000, costPer1kTokens: 0.8 }
  ];
  
  // 实现方法...
}
