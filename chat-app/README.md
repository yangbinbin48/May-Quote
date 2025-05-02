# ChatGPT对话应用

一个纯前端的ChatGPT对话应用，支持API自定义、上下文记忆和多格式导出。

## 功能特性

- 🔒 **纯前端实现**：无需后端服务器，所有数据存储在客户端
- 🧠 **上下文记忆**：保持对话连贯性，AI能理解之前的对话内容
- ⚙️ **API自定义**：用户可配置自己的API密钥和模型参数
- 📋 **内置剪贴板**：保存和管理重要内容片段
- 📤 **多格式导出**：支持Markdown、PDF和Word格式导出
- 🌓 **深色模式**：支持明暗主题切换
- 📱 **响应式设计**：适配各种设备尺寸

## 开发环境设置

### 前提条件

- Node.js >= 14.0.0
- npm >= 7.0.0

### 安装步骤

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

开发服务器将在 http://localhost:25050 启动（配置在.env文件中）。

```bash
npm start
```

## 项目结构

```
src/
├── components/        # UI组件
│   ├── Chat/          # 聊天相关组件
│   ├── Settings/      # 设置相关组件
│   └── Export/        # 导出功能组件
├── hooks/             # 自定义hooks
├── services/          # API服务
├── store/             # 状态管理
├── utils/             # 工具函数
└── App.tsx            # 应用入口
```

## 许可证

[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)

本项目采用GNU GPL v3.0许可证。这意味着您可以自由地使用、复制、分发和修改本软件，
但任何修改和衍生作品也必须在相同的许可证下分发，并且保持开源。
