// May应用主题配置文件

// 定义应用的CSS变量
export const cssVariables = {
  /* 颜色系统 */
  brandColor: '#A5E887',
  mainBg: '#1E1E1E',
  secondaryBg: '#2D2D2D',
  sidebarBg: '#252525',
  cardBg: '#333333',
  
  /* 文本颜色 */
  textWhite: '#FFFFFF',
  textLightGray: '#CCCCCC',
  textMidGray: '#999999',
  textDark: '#171717',
  
  /* 功能色 */
  userBubble: '#A5E887',
  aiBubble: '#3A3A3A',
  borderColor: '#444444',
  errorColor: '#FF6B6B',
  
  /* 间距 */
  spaceXs: '4px',
  spaceSm: '8px',
  spaceMd: '16px',
  spaceLg: '24px',
  spaceXl: '32px',
  
  /* 字体大小 */
  fontXs: '12px',
  fontSm: '14px',
  fontMd: '15px',
  fontLg: '16px',
  fontXl: '24px',
  
  /* 布局 */
  navHeight: '40px',
  sidebarWidth: '10%',
  chatWidth: '45%',
  clipboardWidth: '45%',
  
  /* 圆角 */
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
};

// 生成CSS变量字符串，可用于全局样式
export function generateCssVariables() {
  let cssVars = ':root {\n';
  
  Object.entries(cssVariables).forEach(([key, value]) => {
    // 将驼峰命名转换为带连字符的CSS变量名
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars += `  --${cssVarName}: ${value};\n`;
  });
  
  cssVars += '}';
  return cssVars;
}

// 应用全局样式对象
export const globalStyles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: cssVariables.mainBg,
    color: cssVariables.textWhite,
    lineHeight: 1.5,
    height: '100vh',
    overflow: 'hidden'
  },
  
  // 滚动条样式
  '::-webkit-scrollbar': {
    width: '5px',
    height: '5px'
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '::-webkit-scrollbar-thumb': {
    background: cssVariables.borderColor,
    borderRadius: '3px'
  },
  '::-webkit-scrollbar-thumb:hover': {
    background: '#666666'
  },
  
  // 基础链接样式
  a: {
    color: cssVariables.brandColor,
    textDecoration: 'none'
  },
  'a:hover': {
    textDecoration: 'underline'
  },
  
  // 按钮基础样式
  button: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: cssVariables.radiusSm,
    padding: `${cssVariables.spaceSm} ${cssVariables.spaceMd}`,
    fontSize: cssVariables.fontSm,
    transition: 'all 0.2s ease'
  },
  'button:hover': {
    opacity: 0.9
  },
  'button:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  
  // 输入框基础样式
  input: {
    backgroundColor: cssVariables.secondaryBg,
    border: `1px solid ${cssVariables.borderColor}`,
    borderRadius: cssVariables.radiusMd,
    color: cssVariables.textWhite,
    padding: `${cssVariables.spaceSm} ${cssVariables.spaceMd}`,
    fontSize: cssVariables.fontMd
  },
  'input:focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${cssVariables.brandColor}33` // 33为20%透明度的十六进制表示
  },
  
  // 文本区域基础样式
  textarea: {
    backgroundColor: cssVariables.secondaryBg,
    border: `1px solid ${cssVariables.borderColor}`,
    borderRadius: cssVariables.radiusMd,
    color: cssVariables.textWhite,
    padding: `${cssVariables.spaceSm} ${cssVariables.spaceMd}`,
    fontSize: cssVariables.fontMd,
    resize: 'none'
  },
  'textarea:focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${cssVariables.brandColor}33`
  }
};

// 组件特定样式
export const componentStyles = {
  // 导航栏
  navbar: {
    height: cssVariables.navHeight,
    backgroundColor: cssVariables.mainBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${cssVariables.spaceLg}`,
    borderBottom: `1px solid ${cssVariables.borderColor}`
  },
  
  // 品牌Logo
  logo: {
    color: cssVariables.brandColor,
    fontSize: cssVariables.fontXl,
    fontWeight: 'bold'
  },
  
  // 设置按钮
  settingsButton: {
    backgroundColor: cssVariables.brandColor,
    color: cssVariables.textDark,
    padding: `6px 12px`,
    borderRadius: cssVariables.radiusSm,
    fontSize: cssVariables.fontSm
  },
  
  // 主布局容器
  mainContainer: {
    display: 'flex',
    height: `calc(100vh - ${cssVariables.navHeight})`,
    overflow: 'hidden'
  },
  
  // 侧边栏（对话列表）
  sidebar: {
    width: cssVariables.sidebarWidth,
    backgroundColor: cssVariables.sidebarBg,
    padding: cssVariables.spaceMd,
    overflowY: 'auto',
    borderRight: `1px solid ${cssVariables.borderColor}`
  },
  
  // 对话列表项
  conversationItem: {
    padding: cssVariables.spaceMd,
    borderRadius: cssVariables.radiusMd,
    marginBottom: cssVariables.spaceSm,
    cursor: 'pointer'
  },
  conversationItemActive: {
    backgroundColor: cssVariables.secondaryBg,
    borderLeft: `4px solid ${cssVariables.brandColor}`
  },
  
  // 聊天区域
  chatArea: {
    width: cssVariables.chatWidth,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: cssVariables.secondaryBg
  },
  
  // 消息列表
  messageList: {
    flex: 1,
    padding: cssVariables.spaceLg,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  
  // 用户消息气泡
  userMessageBubble: {
    backgroundColor: cssVariables.userBubble,
    color: cssVariables.textDark,
    padding: `${cssVariables.spaceMd} ${cssVariables.spaceLg}`,
    borderRadius: cssVariables.radiusLg,
    borderBottomRightRadius: cssVariables.radiusSm,
    marginBottom: cssVariables.spaceMd,
    alignSelf: 'flex-end',
    maxWidth: '80%'
  },
  
  // AI消息气泡
  aiMessageBubble: {
    backgroundColor: cssVariables.aiBubble,
    color: cssVariables.textWhite,
    padding: `${cssVariables.spaceMd} ${cssVariables.spaceLg}`,
    borderRadius: cssVariables.radiusLg,
    borderBottomLeftRadius: cssVariables.radiusSm,
    marginBottom: cssVariables.spaceMd,
    alignSelf: 'flex-start',
    maxWidth: '80%'
  },
  
  // 输入区域
  inputArea: {
    padding: cssVariables.spaceMd,
    borderTop: `1px solid ${cssVariables.borderColor}`,
    backgroundColor: cssVariables.secondaryBg
  },
  
  // 输入容器
  inputContainer: {
    display: 'flex',
    backgroundColor: cssVariables.cardBg,
    borderRadius: cssVariables.radiusMd,
    border: `1px solid ${cssVariables.borderColor}`,
    overflow: 'hidden'
  },
  
  // 发送按钮
  sendButton: {
    backgroundColor: cssVariables.brandColor,
    color: cssVariables.textDark,
    borderRadius: 0,
    padding: `0 ${cssVariables.spaceLg}`
  },
  
  // 剪贴板区域
  clipboardArea: {
    width: cssVariables.clipboardWidth,
    backgroundColor: cssVariables.secondaryBg,
    padding: cssVariables.spaceLg,
    overflowY: 'auto',
    borderLeft: `1px solid ${cssVariables.borderColor}`
  },
  
  // 剪贴板项
  clipboardItem: {
    backgroundColor: cssVariables.cardBg,
    borderRadius: cssVariables.radiusMd,
    padding: cssVariables.spaceMd,
    marginBottom: cssVariables.spaceMd,
    border: `1px solid ${cssVariables.borderColor}`
  },
  
  // 空状态提示
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: cssVariables.textMidGray,
    textAlign: 'center',
    padding: cssVariables.spaceLg
  },
  
  // 错误提示
  errorMessage: {
    backgroundColor: `${cssVariables.errorColor}22`, // 22为透明度
    color: cssVariables.errorColor,
    padding: cssVariables.spaceMd,
    borderRadius: cssVariables.radiusMd,
    marginBottom: cssVariables.spaceMd
  }
};

// 媒体查询断点
export const breakpoints = {
  small: '768px',
  medium: '1200px'
};

// 响应式样式
export const responsiveStyles = {
  // 小屏幕样式
  small: {
    mainContainer: {
      flexDirection: 'column'
    },
    sidebar: {
      width: '100%',
      height: '200px',
      order: 2
    },
    chatArea: {
      width: '100%',
      order: 1
    },
    clipboardArea: {
      width: '100%',
      order: 3
    }
  },
  
  // 中等屏幕样式
  medium: {
    sidebar: {
      width: '15%'
    },
    chatArea: {
      width: '85%'
    },
    clipboardArea: {
      display: 'none'
    }
  }
};

// 导出主题对象
export default {
  cssVariables,
  globalStyles,
  componentStyles,
  breakpoints,
  responsiveStyles,
  generateCssVariables
};
