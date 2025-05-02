# AI接入规范与模型列表

本文档提供了May应用支持的AI模型列表、API接入方式和最佳实践，方便开发人员快速接入和使用各类大语言模型服务。

## 1. 支持的模型列表

May应用目前支持以下两类API服务提供商的模型：

### 1.1 火山引擎API模型

| 模型ID | 模型名称 | 特点 | 适用场景 |
|--------|---------|------|---------|
| `deepseek-r1-250120` | 火山Deepseek R1 | 强大的推理能力，理解复杂指令 | 知识问答、内容创作、代码生成 |
| `deepseek-v3-250324` | 火山DeepSeek V3 | 升级版，更强的上下文理解能力 | 复杂任务、长文本理解、多轮对话 |
| `doubao-1-5-thinking-pro-250415` | 豆包 1.5 Thinking Pro | 增强版思考能力，推理更清晰 | 逻辑推理、分析总结、学术探讨 |
| `doubao-1-5-pro-256k-250115` | 豆包 1.5 Pro 256k | 超长上下文窗口，高达256K | 长文档分析、整本书籍理解、长篇创作 |

### 1.2 官方DeepSeek API模型

| 模型ID | 模型名称 | 特点 | 适用场景 |
|--------|---------|------|---------|
| `deepseek-chat` | 官方DeepSeek V3 | 最新版DeepSeek大模型 | 通用对话、知识问答、创意写作 |
| `deepseek-reasoner` | 官方DeepSeek R1 | 专注于推理能力的模型 | 复杂问题求解、科学计算、编程辅助 |

## 2. API提供商与接入配置

### 2.1 火山引擎API

**基础URL**：`https://ark.cn-beijing.volces.com/api/v3`  
**认证方式**：Bearer Token（ARK API Key）  
**示例curl命令**：
```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "deepseek-r1-250120",
    "messages": [
      {"role": "system","content": "你是人工智能助手."},
      {"role": "user","content": "请简要介绍一下你自己"}
    ]
  }'
```

### 2.2 官方DeepSeek API

**基础URL**：`https://api.deepseek.com`  
**认证方式**：Bearer Token（DeepSeek API Key）  
**示例curl命令**：
```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }'
```

## 3. 前端接入代码示例

### 3.1 使用OpenAI SDK

```typescript
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// 根据模型ID确定应该使用的API基础URL
const getBaseUrlForModel = (model: string): string => {
  // 官方DeepSeek模型使用官方API
  if (model === 'deepseek-chat' || model === 'deepseek-reasoner') {
    return 'https://api.deepseek.com';
  }
  // 默认使用火山引擎API
  return 'https://ark.cn-beijing.volces.com/api/v3';
};

// 创建API客户端实例
const createApiClient = (apiKey: string, model: string) => {
  const baseURL = getBaseUrlForModel(model);
  
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true // 允许在浏览器中使用
  });
};

// 标准请求示例
const sendStandardRequest = async (
  apiKey: string,
  messages: ChatCompletionMessageParam[],
  model: string = 'deepseek-r1-250120'
) => {
  try {
    const client = createApiClient(apiKey, model);
    
    const completion = await client.chat.completions.create({
      messages,
      model,
    });
    
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('API错误:', error);
    throw error;
  }
};

// 流式请求示例
const sendStreamingRequest = async (
  apiKey: string,
  messages: ChatCompletionMessageParam[],
  model: string = 'deepseek-r1-250120',
  onProgress: (text: string) => void
) => {
  try {
    const client = createApiClient(apiKey, model);
    
    const stream = await client.chat.completions.create({
      messages,
      model,
      stream: true,
    });
    
    let fullText = '';
    
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || '';
      fullText += content;
      onProgress(fullText);
    }
    
    return fullText;
  } catch (error) {
    console.error('流式API错误:', error);
    throw error;
  }
};
```

### 3.2 使用fetch API

```typescript
// 标准请求示例
const sendRequest = async (
  apiKey: string, 
  messages: any[], 
  model: string
) => {
  const isDeepSeekOfficial = model === 'deepseek-chat' || model === 'deepseek-reasoner';
  const baseUrl = isDeepSeekOfficial 
    ? 'https://api.deepseek.com' 
    : 'https://ark.cn-beijing.volces.com/api/v3';
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  });
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};
```

## 4. 接入最佳实践

### 4.1 API密钥管理

- **安全存储**：永远不要在前端代码中硬编码API密钥
- **加密存储**：在客户端存储时使用加密方式
- **权限控制**：为不同环境（开发、生产）使用不同的API密钥
- **密钥轮换**：定期更换API密钥以提高安全性

### 4.2 模型选择指南

- **通用对话**：优先选择`deepseek-chat`或`deepseek-v3-250324`
- **复杂推理**：优先选择`deepseek-reasoner`或`doubao-1-5-thinking-pro-250415`
- **长文本处理**：优先选择`doubao-1-5-pro-256k-250115`
- **性能与成本平衡**：对于简单任务，可使用基础模型以节省成本

### 4.3 错误处理

- 实现指数退避重试机制
- 为用户提供友好的错误提示
- 记录API错误日志以便分析
- 设置超时处理，避免请求无限等待

### 4.4 UI/UX注意事项

- 在发送请求时显示加载状态
- 对于流式响应，实现打字机效果增强用户体验
- 给用户提供取消正在进行的请求的选项
- 保存历史对话，支持上下文引用
- 在顶部工具栏显示当前使用的模型信息（名称/ID格式），便于调试和透明度

### 4.5 模型适配器系统

May应用实现了模型适配器系统，用于处理不同模型的特殊要求：

```typescript
// 模型配置接口示例
interface ModelConfig {
  // 是否需要严格交替消息（用户-助手-用户-助手...）
  requiresAlternatingMessages?: boolean;
  // 获取模型显示名
  getDisplayName?: (modelId: string) => string;
  // 其他可能的配置...
}

// 示例：预处理消息以适应模型要求
function preprocessMessages(messages: any[], modelId: string): any[] {
  const config = getModelConfig(modelId);
  
  // 针对特定模型的特殊处理
  if (config.requiresAlternatingMessages) {
    return ensureAlternatingMessages(messages);
  }
  
  // 默认情况下，返回原始消息
  return messages;
}
```

这种架构允许系统适应不同模型的独特需求，无需修改核心代码即可添加对新模型的支持。

## 5. 添加新模型的流程

如需添加新的模型支持，请遵循以下步骤：

1. 在`ApiSettings.tsx`的`AVAILABLE_MODELS`数组中添加新模型信息
2. 如果新模型使用不同的API基础URL，更新`getBaseUrlForModel`函数
3. 确保用户界面中提供适当的提示，说明该模型所需的API密钥类型
4. 测试新模型的连接和响应格式

## 6. 故障排除

### 常见错误及解决方案

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|---------|
| "API key not valid" | API密钥无效或过期 | 检查并更新API密钥 |
| "Model not found" | 模型ID错误或不可用 | 确认模型ID或选择其他可用模型 |
| "Too many requests" | 超出API调用限制 | 实现速率限制或升级账户计划 |
| "Context length exceeded" | 输入内容超过模型上下文窗口 | 精简输入内容或使用支持更长上下文的模型 |
| "... does not support successive user or assistant messages" | 模型要求严格交替的消息格式 | 使用模型适配器系统处理消息格式 |

### 模型特殊要求

#### deepseek-reasoner（官方DeepSeek R1）

该模型有以下特殊要求：

- **严格交替的消息格式**：不支持连续的相同角色消息（如用户消息后跟另一个用户消息）
- **必须交替**：消息必须严格按照用户-助手-用户-助手的顺序
- **错误处理**：系统的模型适配器会自动处理这些要求，确保消息格式符合要求

示例实现（使用预处理器）：

```typescript
// 确保消息严格交替（用户-助手-用户-助手...）
function ensureAlternatingMessages(messages: any[]): any[] {
  // 处理后的消息列表
  const processedMessages: any[] = [];
  let lastRole: string | null = null;
  
  for (const message of messages) {
    // 如果角色与上一条消息相同，则跳过
    if (lastRole === message.role) {
      console.log(`跳过连续的 ${message.role} 消息以确保交替格式`);
      continue;
    }
    
    processedMessages.push(message);
    lastRole = message.role;
  }
  
  return processedMessages;
}
```

---

如有任何问题或需要更新，请联系项目维护人员。

*最后更新：2025年5月2日*
