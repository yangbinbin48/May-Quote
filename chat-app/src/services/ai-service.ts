import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import {AVAILABLE_MODELS} from '../components/Settings/ApiSettings'

// 根据模型ID确定应该使用的API基础URL
const getBaseUrlForModel = (model: string): string => {
  const matchedModel = AVAILABLE_MODELS.find(model_info => model_info && model_info.id === model);
  if (matchedModel?.api_base && matchedModel.api_base.length > 0) {
    return matchedModel.api_base;
  }
  // 官方DeepSeek模型使用官方API
  if (model === 'deepseek-chat' || model === 'deepseek-reasoner') {
    return 'https://api.deepseek.com';
  }
  // 默认使用火山引擎API
  return 'https://ark.cn-beijing.volces.com/api/v3';
};

// 创建API客户端实例
export const createApiClient = (apiKey: string, model: string) => {
  const baseURL = getBaseUrlForModel(model);
  
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true // 允许在浏览器中使用
  });
};

// 发送消息并获取响应（标准方式）
export const sendMessage = async (
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
    
    return {
      content: completion.choices[0]?.message?.content || '',
      error: null
    };
  } catch (error: any) {
    console.error('AI API错误:', error);
    return {
      content: '',
      error: error.message || '发送消息时出错'
    };
  }
};

// 发送消息并获取流式响应
export const sendMessageStream = async (
  apiKey: string,
  messages: ChatCompletionMessageParam[],
  model: string = 'deepseek-r1-250120',
  onProgress: (text: string) => void,
  onError: (error: string) => void
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
  } catch (error: any) {
    console.error('AI API流式响应错误:', error);
    onError(error.message || '获取流式响应时出错');
    return '';
  }
};
