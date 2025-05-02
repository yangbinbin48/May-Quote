# May应用AI交互与用户体验最佳实践

## AI交互设计原则

### 上下文管理策略

May应用中的上下文管理是AI交互的核心部分，我们采用以下策略确保对话的连贯性和智能性：

#### 上下文组装
- **渐进式上下文**：根据对话深度动态调整上下文长度
- **核心记忆保留**：确保重要信息不被丢弃
- **自动摘要**：对超长历史进行压缩和摘要

```typescript
// 上下文组装示例
function buildContext(conversationId: string, messageLimit = 20): Message[] {
  const conversation = getConversation(conversationId);
  if (!conversation) return [];
  
  // 获取最新的N条消息
  let recentMessages = conversation.messages.slice(-messageLimit);
  
  // 如果消息太多，添加系统摘要
  if (conversation.messages.length > messageLimit) {
    const systemSummary = {
      role: 'system',
      content: `这是之前对话的摘要: ${generateSummary(conversation.messages.slice(0, -messageLimit))}`
    };
    
    recentMessages = [systemSummary, ...recentMessages];
  }
  
  // 添加系统提示，确保AI行为一致
  const systemPrompt = {
    role: 'system',
    content: getSystemPrompt(conversation.settings)
  };
  
  return [systemPrompt, ...recentMessages];
}
```

#### Token管理
- **预估Token使用量**：根据模型限制预估每条消息的token数
- **动态调整**：在接近限制时自动压缩上下文
- **优先级机制**：重要消息优先保留

```typescript
// Token管理示例
function optimizeContextForTokenLimit(messages: Message[], maxTokens = 4000): Message[] {
  // 估算当前token使用量
  let estimatedTokens = estimateTokenCount(messages);
  
  // 如果在限制范围内，直接返回
  if (estimatedTokens <= maxTokens) return messages;
  
  // 优先保留的消息类型
  const systemMessages = messages.filter(m => m.role === 'system');
  let userAssistantMessages = messages.filter(m => m.role !== 'system');
  
  // 保留最近的对话，移除较早的对话
  while (estimatedTokens > maxTokens && userAssistantMessages.length > 2) {
    // 从中间开始移除（保留最早的背景和最近的交互）
    const midIndex = Math.floor(userAssistantMessages.length / 3);
    userAssistantMessages.splice(midIndex, 2); // 移除一组问答
    
    // 重新计算token
    estimatedTokens = estimateTokenCount([...systemMessages, ...userAssistantMessages]);
  }
  
  // 实在不够，压缩系统消息
  if (estimatedTokens > maxTokens && systemMessages.length > 1) {
    // 合并系统消息
    const combinedSystem = {
      role: 'system',
      content: systemMessages.map(m => m.content).join(' ')
    };
    
    return [combinedSystem, ...userAssistantMessages];
  }
  
  return [...systemMessages, ...userAssistantMessages];
}
```

### 用户体验一致性

#### 响应风格统一
- **使用系统提示**：设置基础的AI响应风格
- **消息类型识别**：针对不同类型问题使用一致的回复结构
- **格式化输出**：保持代码、列表等特殊内容的一致格式

```typescript
// 系统提示示例
const baseSystemPrompt = `你是一个有用的AI助手，请遵循以下原则:
1. 提供简洁、准确、有帮助的回答
2. 代码示例使用语法高亮格式
3. 解释复杂概念时使用类比和实例
4. 保持友好但专业的语气
5. 如果不确定，坦诚承认并提供最佳猜测`;
```

#### 进度和状态反馈
- **实时状态显示**：显示消息发送和接收状态
- **打字效果**：模拟AI打字过程，提供实时反馈
- **错误状态处理**：提供清晰的错误提示和恢复选项

```typescript
// 消息状态处理
function MessageItem({ message }) {
  // 根据消息状态显示不同UI
  if (message.status === 'sending') {
    return <SendingMessageUI message={message} />;
  } else if (message.status === 'error') {
    return <ErrorMessageUI message={message} onRetry={handleRetry} />;
  } else {
    return <NormalMessageUI message={message} />;
  }
}
```

### 错误处理机制

#### API错误处理
- **分类错误类型**：网络错误、认证错误、限流错误等
- **友好错误消息**：将技术错误转化为用户可理解的信息
- **重试策略**：针对不同错误类型实施不同重试策略

```typescript
// API错误处理示例
async function sendMessageWithErrorHandling(message, retries = 3) {
  try {
    return await sendMessage(message);
  } catch (error) {
    // 网络错误处理
    if (error.isNetworkError && retries > 0) {
      await delay(1000); // 延迟重试
      return sendMessageWithErrorHandling(message, retries - 1);
    }
    
    // 限流错误
    if (error.status === 429) {
      const retryAfter = error.headers['retry-after'] || 5;
      showNotification(`API请求过于频繁，${retryAfter}秒后重试`);
      await delay(retryAfter * 1000);
      return sendMessageWithErrorHandling(message, retries);
    }
    
    // 认证错误
    if (error.status === 401) {
      showNotification('API密钥无效，请检查设置');
      openApiSettings();
      throw new Error('认证失败');
    }
    
    // 其他错误
    throw error;
  }
}
```

#### 优雅降级
- **部分功能可用**：在API不可用时保留本地功能
- **离线模式**：提供查看历史对话的离线能力
- **恢复机制**：连接恢复后的数据同步策略

```typescript
// 优雅降级示例
function ChatInterface() {
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  
  // 检测API可用性
  useEffect(() => {
    checkApiAvailability()
      .then(available => setIsApiAvailable(available))
      .catch(() => setIsApiAvailable(false));
  }, []);
  
  // 根据API可用性渲染不同UI
  return (
    <div className="chat-interface">
      <MessageList messages={messages} />
      
      {isApiAvailable ? (
        <InputArea onSendMessage={sendMessage} />
      ) : (
        <OfflineNotice>
          <p>API连接不可用，您可以浏览历史对话，但无法发送新消息</p>
          <button onClick={checkApiAvailability}>重试连接</button>
        </OfflineNotice>
      )}
    </div>
  );
}
```

## 用户体验优化

### 响应式设计

#### 自适应布局
- **响应式栅格系统**：基于屏幕尺寸重新组织布局
- **优先级排列**：在小屏幕上优先显示核心功能
- **交互方式适配**：针对触摸设备优化交互

```css
/* 响应式布局CSS示例 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 200px;
    order: 2;
  }
  
  .chat-area {
    width: 100%;
    order: 1;
  }
  
  .clipboard-area {
    width: 100%;
    order: 3;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .sidebar {
    width: 15%;
  }
  
  .chat-area {
    width: 85%;
  }
  
  .clipboard-area {
    display: none;
  }
}
```

#### 组件自适应
- **弹性输入框**：自动调整高度适应内容
- **溢出处理**：长内容的优雅截断和展开
- **触摸目标尺寸**：确保在移动设备上有足够的点击区域

```typescript
// 弹性输入框实现
function AutoResizeTextarea() {
  const textareaRef = useRef(null);
  
  // 自动调整高度
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 重置高度，以便正确计算滚动高度
    textarea.style.height = 'auto';
    
    // 计算新高度，设置限制
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, 50), // 最小高度50px
      200                                  // 最大高度200px
    );
    
    textarea.style.height = `${newHeight}px`;
  };
  
  return (
    <textarea 
      ref={textareaRef}
      onChange={autoResize}
      onInput={autoResize}
    />
  );
}
```

### 加载体验优化

#### 骨架屏与占位符
- **内容占位**：使用骨架屏减少加载时的布局偏移
- **渐进式加载**：优先加载可见区域内容
- **转场动画**：平滑过渡减少等待感知

```tsx
// 消息列表骨架屏
function MessageListSkeleton() {
  return (
    <div className="message-list-skeleton">
      <div className="skeleton-item user">
        <div className="avatar pulse" />
        <div className="content">
          <div className="line pulse" style={{ width: '80%' }} />
          <div className="line pulse" style={{ width: '60%' }} />
        </div>
      </div>
      
      <div className="skeleton-item assistant">
        <div className="avatar pulse" />
        <div className="content">
          <div className="line pulse" style={{ width: '90%' }} />
          <div className="line pulse" style={{ width: '75%' }} />
          <div className="line pulse" style={{ width: '50%' }} />
        </div>
      </div>
    </div>
  );
}
```

#### 懒加载策略
- **列表懒加载**：滚动时动态加载更多消息
- **资源懒加载**：非关键资源延迟加载
- **代码分割**：按需加载功能模块

```typescript
// 列表懒加载实现
function MessageList() {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);
  
  // 加载更多消息
  const loadMoreMessages = async () => {
    if (!hasMore) return;
    
    try {
      const newMessages = await fetchMessages(conversationId, page);
      if (newMessages.length < 20) {
        setHasMore(false);
      }
      
      setMessages(prev => [...prev, ...newMessages]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };
  
  // 滚动监听
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    
    const handleScroll = () => {
      if (list.scrollTop <= 50 && hasMore) {
        loadMoreMessages();
      }
    };
    
    list.addEventListener('scroll', handleScroll);
    return () => list.removeEventListener('scroll', handleScroll);
  }, [hasMore]);
  
  return (
    <div className="message-list" ref={listRef}>
      {hasMore && <LoadingIndicator />}
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

### 反馈与指引

#### 微交互设计
- **状态转换动画**：操作执行时的视觉反馈
- **输入反馈**：输入过程中的实时验证
- **成功/失败反馈**：清晰的操作结果指示

```tsx
// 状态转换动画示例
function SendButton({ onClick, isLoading }) {
  return (
    <button 
      className={`send-button ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <SendIcon />
      )}
    </button>
  );
}
```

#### 用户引导
- **首次使用引导**：新用户功能介绍
- **功能发现提示**：引导用户发现高级功能
- **空状态设计**：提供有意义的空状态界面

```tsx
// 空状态设计示例
function EmptyConversationState() {
  return (
    <div className="empty-state">
      <img src="/images/chat-empty.svg" alt="开始新对话" />
      <h3>开始你的第一个对话</h3>
      <p>你可以询问任何问题，AI将智能回答并记住上下文</p>
      <button className="primary-button">
        <PlusIcon /> 新建对话
      </button>
    </div>
  );
}
```

## 数据安全与隐私

### 本地优先存储

#### 隐私保护
- **无服务器架构**：数据仅存储在用户本地
- **最小信息收集**：仅收集必要的用户信息
- **透明数据使用**：清晰说明API调用中的数据使用

```typescript
// 隐私声明组件
function PrivacyNotice() {
  return (
    <div className="privacy-notice">
      <h4>隐私声明</h4>
      <p>
        您的所有对话内容仅存储在您的设备上，我们不会收集或存储您的对话数据。
        API调用仅发送给OpenAI服务，受其隐私政策约束。
      </p>
      <p>
        您的API密钥经过加密后存储在本地，不会传输到我们的服务器。
      </p>
    </div>
  );
}
```

#### 数据导出与备份
- **完整导出选项**：允许用户导出所有数据
- **选择性导出**：支持按对话导出
- **本地备份**：提供简单的备份恢复机制

```typescript
// 数据导出功能
async function exportAllData() {
  try {
    // 获取所有数据
    const conversations = await getAllConversations();
    const settings = await getAllSettings();
    
    // 组装导出包
    const exportData = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      conversations,
      settings: {
        ...settings,
        apiKey: undefined // 出于安全考虑不导出API密钥
      }
    };
    
    // 创建下载
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `may-data-export-${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('导出数据失败:', error);
    return false;
  }
}
```

### 敏感数据处理

#### API密钥安全
- **加密存储**：使用简单加密存储API密钥
- **存储分离**：敏感数据与普通数据分开存储
- **会话限制**：密钥仅在内存中短暂存在

```typescript
// API密钥安全存储
export const saveApiKey = async (apiKey: string): Promise<void> => {
  if (!apiKey) {
    await saveConfig(CONFIG_KEYS.API_KEY, '');
    return;
  }
  
  // 加密API密钥
  const encrypted = encryptData(apiKey);
  await saveConfig(CONFIG_KEYS.API_KEY, encrypted);
};

// 获取API密钥时解密
export const getApiKey = (): string => {
  try {
    // 从缓存获取，减少解密次数
    const cachedValue = sessionStorage.getItem('api-key-cache');
    if (cachedValue) {
      return cachedValue;
    }
    
    // 获取加密后的API密钥并解密
    let result = '';
    getConfig(CONFIG_KEYS.API_KEY, '').then(value => {
      if (value) {
        result = decryptData(value);
        // 临时缓存到会话存储中
        sessionStorage.setItem('api-key-cache', result);
      }
    });
    
    return result || '';
  } catch (e) {
    console.error('获取API密钥失败:', e);
    return '';
  }
};
```

#### 内容安全
- **用户控制**：用户可随时删除任何对话
- **清除功能**：提供一键清除所有数据选项
- **数据生命周期**：用户可设置自动清理策略

```tsx
// 系统重置功能
async function resetSystem() {
  try {
    // 显示确认对话框
    const confirmed = await showConfirmDialog({
      title: '确认重置系统',
      message: '这将删除所有对话和设置，此操作无法撤销',
      confirmText: '重置系统',
      cancelText: '取消'
    });
    
    if (!confirmed) return false;
    
    // 清空数据库
    await clearDatabase();
    
    // 清除本地存储
    localStorage.clear();
    sessionStorage.clear();
    
    // 重新初始化应用
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('重置系统失败:', error);
    return false;
  }
}
```

## 总结

在May应用中，我们采用了以下AI交互与用户体验最佳实践：

1. **智能上下文管理**：确保AI对话连贯性，同时考虑token限制
2. **一致的响应体验**：使用系统提示和状态反馈保持体验一致性
3. **全面的错误处理**：分类处理各种错误并提供优雅降级
4. **响应式设计**：自适应布局和组件确保多设备良好体验
5. **加载体验优化**：骨架屏、懒加载减少等待感知
6. **本地优先存储**：保护用户隐私和数据安全

这些最佳实践使May应用在无服务器架构下仍能提供流畅、安全且智能的用户体验。
