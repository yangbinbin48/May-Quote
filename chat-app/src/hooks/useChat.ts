import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiKey, getModel } from '../utils/storage';
import { sendMessageStream } from '../services/ai-service';
import { preprocessMessages } from '../utils/model-adapters';
import { Message } from '../components/Chat/MessageItem';
import { generateId } from '../utils/storage-db';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 聊天功能Hook
 * @param conversationId 当前对话ID
 * @param updateConversation 更新对话回调函数
 */
export function useChat(
  conversationId?: string | null,
  updateConversation?: (messages: Message[]) => void
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用ref来追踪最新的消息，避免闭包问题
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  
  // 当conversationId变化时，清空消息
  useEffect(() => {
    if (conversationId) {
      // 如果是切换对话，清空当前消息
      // 注意：实际消息会在App组件中从对话数据加载
      setMessages([]);
      setError(null);
    }
  }, [conversationId]);
  
  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('请先设置API密钥');
      return;
    }
    
    // 创建用户消息
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    // 创建临时的AI消息（用于显示加载状态）
    const tempAiMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      loading: true
    };
    
    // 添加消息到状态
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage, tempAiMessage];
      messagesRef.current = newMessages; // 更新ref
      return newMessages;
    });
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 准备发送给API的消息，从ref中获取最新状态
      const apiMessages = messagesRef.current
        .filter(msg => msg && msg.role && (msg.role !== 'assistant' || !msg.loading)) // 添加安全检查，过滤掉临时加载消息和无效消息
        .map(msg => ({
          role: msg.role,
          content: msg.content || '' // 确保content至少为空字符串
        }));
      
      // 获取当前选择的模型
      const model = getModel();
      
      // 处理流式响应中的进度更新
      const handleProgress = (text: string) => {
        setMessages(prevMessages => {
          // 确保有消息且数组不为空
          if (!prevMessages || prevMessages.length === 0) {
            return prevMessages;
          }
          
          const lastMessage = prevMessages[prevMessages.length - 1];
          
          // 确保lastMessage存在且具有role属性
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.loading) {
            // 更新AI消息内容
            const newMessages = [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: text }
            ];
            messagesRef.current = newMessages; // 更新ref
            return newMessages;
          }
          return prevMessages;
        });
      };
      
      // 处理错误
      const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setMessages(prevMessages => {
          const withoutLoading = prevMessages.filter(msg => !msg.loading);
          messagesRef.current = withoutLoading; // 更新ref
          return withoutLoading;
        });
      };
      
      // 根据模型对消息进行预处理
      const processedMessages = preprocessMessages(apiMessages, model);
      
      // 记录处理过程
      if (processedMessages.length !== apiMessages.length) {
        console.log(`[模型适配] 消息已预处理: ${apiMessages.length} -> ${processedMessages.length} 条消息`);
      }
      
      // 发送消息并处理流式响应
      await sendMessageStream(
        apiKey,
        processedMessages,
        model,
        handleProgress,
        handleError
      );
      
      // 完成加载，更新最后的AI消息状态
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.loading) {
          const newMessages = [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, loading: false }
          ];
          messagesRef.current = newMessages; // 更新ref
          return newMessages;
        }
        return prevMessages;
      });
    } catch (err: any) {
      // 处理错误
      setError(err.message || '发送消息时出错');
      // 移除临时的AI消息
      setMessages(prevMessages => {
        const withoutLoading = prevMessages.filter(msg => !msg.loading);
        messagesRef.current = withoutLoading; // 更新ref
        return withoutLoading;
      });
    } finally {
      setIsLoading(false);
      
      // 如果提供了更新回调，则更新对话
      if (updateConversation && conversationId) {
        updateConversation(messagesRef.current);
      }
    }
  }, [updateConversation, conversationId]); // 依赖updateConversation和conversationId
  
  // 清空所有消息
  const clearMessages = useCallback(() => {
    setMessages([]);
    messagesRef.current = []; // 清空ref
    setError(null);
  }, []);
  // 直接设置消息列表的方法 - 用于加载初始消息
  const setInitialMessages = useCallback((initialMsgs: Message[]) => {
    if (initialMsgs && initialMsgs.length > 0) {
      // 确保所有消息的loading属性为false，避免历史消息显示加载动画
      const processedMessages = initialMsgs.map(msg => ({
        ...msg,
        loading: false // 强制设置为false，确保不会显示加载指示器
      }));
      
      setMessages(processedMessages);
      messagesRef.current = processedMessages;
    }
  }, []);
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setInitialMessages
  };
}
