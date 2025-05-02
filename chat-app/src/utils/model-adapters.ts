/**
 * 模型适配器 - 处理不同AI模型的特殊要求和预处理
 */

// 模型配置接口
export interface ModelConfig {
  // 是否需要严格交替消息（用户-助手-用户-助手...）
  requiresAlternatingMessages?: boolean;
  // 获取模型显示名
  getDisplayName?: (modelId: string) => string;
  // 其他可能的配置...
}

// 模型配置注册表
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // 官方DeepSeek R1需要严格交替消息
  'deepseek-reasoner': {
    requiresAlternatingMessages: true
  },
  // 其他模型暂时无特殊要求
};

/**
 * 获取模型配置
 * @param modelId 模型ID
 * @returns 模型配置
 */
export function getModelConfig(modelId: string): ModelConfig {
  return MODEL_CONFIGS[modelId] || {};
}

/**
 * 获取模型显示名
 * @param modelId 模型ID
 * @returns 模型显示名
 */
export function getModelDisplayName(modelId: string): string {
  // 模型ID到显示名称的映射
  const modelNames: Record<string, string> = {
    'deepseek-r1-250120': '火山Deepseek R1',
    'deepseek-v3-250324': '火山DeepSeek V3',
    'doubao-1-5-thinking-pro-250415': '豆包 1.5 Thinking Pro',
    'doubao-1-5-pro-256k-250115': '豆包 1.5 Pro 256k',
    'deepseek-chat': '官方DeepSeek V3',
    'deepseek-reasoner': '官方DeepSeek R1'
  };
  
  return modelNames[modelId] || modelId;
}

/**
 * 预处理消息 - 根据模型特性处理消息列表
 * @param messages 原始消息列表
 * @param modelId 模型ID
 * @returns 处理后的消息列表
 */
export function preprocessMessages(messages: any[], modelId: string): any[] {
  const config = getModelConfig(modelId);
  
  // 如果模型需要严格交替消息
  if (config.requiresAlternatingMessages) {
    return ensureAlternatingMessages(messages);
  }
  
  // 默认情况下，返回原始消息
  return messages;
}

/**
 * 确保消息严格交替（用户-助手-用户-助手...）
 * 这是针对一些模型的特殊要求，如deepseek-reasoner
 * @param messages 原始消息列表
 * @returns 处理后的消息列表
 */
function ensureAlternatingMessages(messages: any[]): any[] {
  if (!messages || messages.length === 0) return messages;
  
  // 处理后的消息列表
  const processedMessages: any[] = [];
  let lastRole: string | null = null;
  
  for (const message of messages) {
    // 如果角色与上一条消息相同，则跳过
    if (lastRole === message.role) {
      console.log(`[模型适配] 跳过连续的 ${message.role} 消息以确保交替格式`);
      continue;
    }
    
    processedMessages.push(message);
    lastRole = message.role;
  }
  
  // 特殊情况：如果第一条消息不是用户消息，则移除
  if (processedMessages.length > 0 && processedMessages[0].role !== 'user') {
    console.log('[模型适配] 移除非user角色的第一条消息');
    processedMessages.shift();
  }
  
  // 如果最终没有消息，添加一个默认的系统消息
  if (processedMessages.length === 0) {
    processedMessages.push({
      role: 'user',
      content: '你好'
    });
  }
  
  return processedMessages;
}
