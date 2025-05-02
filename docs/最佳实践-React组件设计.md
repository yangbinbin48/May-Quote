# May应用React组件设计最佳实践

## 组件拆分原则

### 单一职责原则
- **每个组件专注于一个功能点**：例如`InputArea`只负责消息输入，`MessageList`只负责消息展示
- **避免"超级组件"**：当组件超过300行或处理多个不相关功能时，考虑拆分
- **分离关注点**：UI渲染、数据处理、事件处理逻辑分离

```tsx
// 不佳示例：混合多种职责
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  // 消息处理逻辑
  // API调用逻辑
  // UI渲染逻辑
  // ...大量代码...
}

// 优化示例：拆分职责
function ChatInterface() {
  const { messages, sendMessage } = useChat(); // 逻辑提取到hook中
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <InputArea onSendMessage={sendMessage} />
    </div>
  );
}
```

### 组件粒度
- **太大的粒度**：难以维护和复用
- **太小的粒度**：增加复杂度和组件间通信成本
- **适度粒度**：以用户交互的自然边界划分

May应用中的最佳实践：
1. **页面级组件**：如`App`、`ChatInterface`
2. **功能区域组件**：如`MessageList`、`ConversationList`
3. **可复用UI组件**：如`ConfirmDialog`、`Button`
4. **特定功能组件**：如`MessageItem`、`ExportButton`

### 组合优于继承
- **使用组合模式**：通过组合小组件构建复杂UI
- **使用children属性**：灵活传递子组件
- **避免深层组件继承**：React推荐组合而非继承

```tsx
// 优秀示例：组合模式
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// 使用组合构建更复杂的组件
function ConversationCard({ conversation }) {
  return (
    <Card title={conversation.title}>
      <div className="preview">{conversation.preview}</div>
      <div className="timestamp">{formatDate(conversation.updatedAt)}</div>
    </Card>
  );
}
```

## 状态管理策略

### 状态分层
在May应用中，我们采用以下状态分层策略：

1. **局部UI状态**：使用`useState`
   - 组件内部临时状态
   - 表单输入值
   - UI显示状态（折叠/展开）

2. **共享状态**：使用自定义Hooks
   - 对话数据
   - 用户设置
   - 会话列表

3. **全局状态**：使用Context
   - 主题设置
   - 认证状态
   - 全局错误处理

```tsx
// 局部状态示例
function InputArea({ onSendMessage }) {
  // 纯UI状态使用useState
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  // ...
}

// 共享状态示例
function ChatInterface() {
  // 共享逻辑和状态通过Hooks抽象
  const { conversations, activeConversation, selectConversation } = useConversations();
  const { messages, sendMessage, isLoading } = useChat(activeConversation?.id);
  
  // ...
}
```

### 使用自定义Hooks抽象逻辑
- **将相关状态和业务逻辑封装**：如`useChat`、`useConversations`
- **减少组件中的直接API调用**：通过hooks提供统一接口
- **促进逻辑复用**：相同逻辑在多处使用时避免重复

```tsx
// 自定义Hook封装对话管理逻辑
export function useConversations() {
  const [conversationList, setConversationList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始化加载
  useEffect(() => {
    async function loadConversations() {
      try {
        const list = await getConversationList();
        setConversationList(list);
        // 加载上一次活动的对话ID
        const lastActiveId = await getActiveConversationId();
        setActiveId(lastActiveId || (list[0]?.id || null));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadConversations();
  }, []);
  
  // 提供操作方法
  const createConversation = useCallback(async () => {
    // 创建新对话的逻辑
  }, []);
  
  const selectConversation = useCallback(async (id) => {
    // 选择对话的逻辑
  }, []);
  
  return {
    conversationList,
    activeId,
    isLoading,
    createConversation,
    selectConversation
  };
}
```

### 避免Props钻取
- **适度使用Context**：避免过深的属性传递链
- **组合式组件API**：使用children或render props
- **局部状态提升**：仅提升到需要共享的最低层级

```tsx
// 不佳示例：Props钻取
function ChatApp() {
  const [darkMode, setDarkMode] = useState(false);
  return <ChatInterface darkMode={darkMode} onToggleDarkMode={setDarkMode} />;
}

function ChatInterface({ darkMode, onToggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
      <Content darkMode={darkMode} />
    </div>
  );
}

// 优化：使用Context
const ThemeContext = createContext();

function ChatApp() {
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <ChatInterface />
    </ThemeContext.Provider>
  );
}

function Header() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  // 直接使用context中的值，无需通过props传递
}
```

## 性能优化技巧

### 组件优化
- **使用`React.memo`**：避免不必要的重渲染
- **使用`useCallback`和`useMemo`**：稳定函数和计算值引用
- **懒加载组件**：使用`React.lazy`和`Suspense`

```tsx
// 使用memo避免不必要的渲染
const MessageItem = React.memo(function MessageItem({ message }) {
  return (
    <div className={`message ${message.role}`}>
      {message.content}
    </div>
  );
});

// 优化回调函数
function InputArea({ onSend }) {
  const [message, setMessage] = useState('');
  
  // 稳定回调引用，避免子组件不必要重渲染
  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  }, [message, onSend]);
  
  // ...
}
```

### 列表优化
- **使用`key`属性**：帮助React识别列表项变化
- **虚拟化长列表**：仅渲染视口内可见项
- **分页加载**：避免一次加载大量数据

```tsx
// 使用唯一且稳定的key
function MessageList({ messages }) {
  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageItem 
          key={message.id} // 使用稳定的唯一ID
          message={message} 
        />
      ))}
    </div>
  );
}

// 虚拟列表示例
function VirtualMessageList({ messages }) {
  return (
    <VirtualList
      height={500}
      itemCount={messages.length}
      itemSize={84} // 每项高度
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MessageItem message={messages[index]} />
        </div>
      )}
    </VirtualList>
  );
}
```

### 渲染优化
- **避免内联对象创建**：防止不必要的重渲染
- **条件渲染优化**：使用短路运算符
- **使用`React.Fragment`**：避免多余DOM节点

```tsx
// 不佳示例：每次渲染创建新的内联样式对象
function Button({ color }) {
  return (
    <button style={{ backgroundColor: color, padding: '10px' }}>
      点击
    </button>
  );
}

// 优化：从props派生样式
function Button({ color }) {
  // 计算值缓存
  const buttonStyle = useMemo(() => ({
    backgroundColor: color,
    padding: '10px'
  }), [color]);
  
  return <button style={buttonStyle}>点击</button>;
}
```

## 代码组织与可维护性

### 目录结构
May应用采用的目录结构原则：

```
src/
├── components/       # 按功能域分组
│   ├── Chat/         # 聊天相关组件
│   ├── Settings/     # 设置相关组件
│   └── Export/       # 导出相关组件
├── hooks/            # 自定义钩子
├── services/         # API和外部服务
├── utils/            # 工具函数
├── styles/           # 全局样式
└── types/            # TypeScript类型定义
```

- **按功能域组织**：相关功能组件放在同一目录
- **组件文件命名**：使用PascalCase（如`MessageList.tsx`）
- **辅助文件命名**：使用kebab-case（如`global-styles.css`）

### 组件文件组织
- **一个文件一个组件**：保持文件简洁
- **辅助组件**：小型辅助组件可与主组件放在同一文件
- **导出原则**：组件文件只导出一个主组件

```tsx
// MessageItem.tsx
import React from 'react';
import { formatTime } from '../../utils/time';

// 辅助组件，不对外导出
function MessageHeader({ role, timestamp }) {
  return (
    <div className="message-header">
      <span className="role">{role === 'user' ? '我' : 'AI'}</span>
      <span className="time">{formatTime(timestamp)}</span>
    </div>
  );
}

// 主组件，向外导出
function MessageItem({ message }) {
  return (
    <div className={`message-item ${message.role}`}>
      <MessageHeader role={message.role} timestamp={message.timestamp} />
      <div className="message-content">{message.content}</div>
    </div>
  );
}

export default MessageItem;
```

### Props设计
- **使用解构**：直接在参数中解构props
- **提供默认值**：为可选props设置默认值
- **使用TypeScript接口**：明确定义props类型

```tsx
// 良好的props设计
interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

function InputArea({ 
  onSendMessage, 
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 2000
}: InputAreaProps) {
  // 组件实现
}
```

### 错误处理
- **边界错误捕获**：使用ErrorBoundary组件
- **条件检查**：验证关键props和状态
- **优雅降级**：在数据缺失时提供备选UI

```tsx
// 错误边界组件
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error('组件错误:', error, info);
    // 可以将错误上报给监控服务
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-display">
          <h3>很抱歉，出现了错误</h3>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 在应用中使用
function App() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}
```

## 异步操作与副作用

### useEffect最佳实践
- **明确依赖项**：准确声明所有依赖
- **避免过度触发**：合理设置依赖项
- **清理函数**：释放资源，防止内存泄漏

```tsx
// 良好的useEffect使用
function ConversationList() {
  const [conversations, setConversations] = useState([]);
  
  // 加载对话列表
  useEffect(() => {
    let isMounted = true;
    
    async function loadConversations() {
      try {
        const data = await getConversationList();
        // 防止组件卸载后设置状态
        if (isMounted) {
          setConversations(data);
        }
      } catch (error) {
        console.error('加载对话失败:', error);
      }
    }
    
    loadConversations();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, []); // 空依赖数组 - 仅在挂载时执行一次
  
  // ...
}
```

### 处理异步操作
- **使用async/await**：简化异步逻辑
- **状态管理**：使用isLoading、error等状态
- **乐观更新**：先更新UI，再确认服务端结果

```tsx
// 处理异步操作的最佳实践
function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 发送消息
  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    // 生成临时ID
    const tempId = Date.now().toString();
    
    // 创建用户消息对象
    const userMessage = {
      id: tempId,
      content,
      role: 'user',
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // 乐观更新UI
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // API调用
      const response = await sendToAPI(conversationId, content);
      
      // 更新消息状态
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'sent', id: response.messageId }
          : msg
      ));
      
      // 添加AI回复
      if (response.reply) {
        setMessages(prev => [...prev, {
          id: response.replyId,
          content: response.reply,
          role: 'assistant',
          timestamp: Date.now(),
          status: 'sent'
        }]);
      }
    } catch (err) {
      setError(err.message);
      
      // 更新失败状态
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'error', error: err.message }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };
  
  return { messages, isLoading, error, sendMessage };
}
```

### 防抖与节流
- **输入防抖**：减少不必要的状态更新和API调用
- **滚动节流**：优化滚动事件处理
- **使用工具函数**：封装可复用的防抖/节流逻辑

```tsx
// 使用防抖的示例
import { debounce } from '../utils/performance';

function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');
  
  // 使用useCallback包装debounce函数，避免重复创建
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 500),
    [onSearch]
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="搜索..."
    />
  );
}
```

## 总结

在May应用中，我们采用了以下React组件设计最佳实践：

1. **合理的组件拆分**：单一职责原则，适当粒度，组合优于继承
2. **分层状态管理**：根据状态性质选择恰当的管理方式
3. **自定义Hooks抽象**：封装复杂逻辑，提高复用性
4. **性能优化措施**：memo、useCallback、虚拟列表等
5. **清晰的代码组织**：按功能域分组，保持组件文件简洁
6. **异步操作最佳实践**：正确处理加载状态、错误和清理

这些实践使May应用的前端代码更加可维护、高效和可靠，同时提升了开发体验和协作效率。
