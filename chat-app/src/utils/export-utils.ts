/**
 * 导出工具函数集
 */

import { ClipboardItem } from '../types';

/**
 * 将剪贴板项转换为Markdown文本
 */
export function clipboardItemsToMarkdown(items: ClipboardItem[]): string {
  if (!items || items.length === 0) return '';
  
  // 生成文档头部
  const header = `# May导出内容\n\n导出时间: ${new Date().toLocaleString()}\n\n---\n\n`;
  
  // 生成各个项目的内容
  const content = items.map((item, index) => {
    const timestamp = new Date(item.timestamp).toLocaleString();
    return `## 内容 ${index + 1}\n\n${item.content}\n\n*添加时间: ${timestamp}*\n\n---\n\n`;
  }).join('');
  
  return header + content;
}

/**
 * 导出Markdown文件
 */
export function exportAsMarkdown(items: ClipboardItem[], filename: string = 'may-export.md') {
  const markdown = clipboardItemsToMarkdown(items);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
}

/**
 * 导出PDF文件 
 * 
 * 注意：这是一个简单实现，使用浏览器打印功能
 * 真实应用中可能需要集成专业PDF库
 */
export function exportAsPDF(items: ClipboardItem[], filename: string = 'may-export.pdf') {
  // 创建一个新的打印窗口
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('无法打开打印窗口，可能被浏览器拦截');
    return false;
  }
  
  // 将Markdown转换为HTML
  const markdown = clipboardItemsToMarkdown(items);
  const htmlContent = markdownToHTML(markdown);
  
  // 写入HTML内容到新窗口
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 30px;
          color: #333;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        h2 {
          color: #34495e;
          margin-top: 30px;
        }
        pre, code {
          background-color: #f7f7f7;
          padding: 2px 5px;
          border-radius: 3px;
        }
        pre {
          padding: 15px;
          overflow: auto;
        }
        blockquote {
          border-left: 4px solid #ccc;
          padding-left: 15px;
          color: #777;
          margin: 0 0 15px;
        }
        hr {
          border: 0;
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
        img {
          max-width: 100%;
        }
        .timestamp {
          color: #777;
          font-style: italic;
          font-size: 0.9em;
        }
        @media print {
          body {
            margin: 0;
            padding: 0 30px;
          }
          @page {
            margin: 1.5cm;
          }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        // 自动打印后关闭
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  return true;
}

/**
 * 将Markdown转换为HTML
 * 这是一个简单实现，实际应用可能需要使用更完善的库如 marked
 */
function markdownToHTML(markdown: string): string {
  // 这里实现一个简单的Markdown解析
  // 在实际应用中，应该使用专业的Markdown解析库，如marked.js
  let html = markdown
    // 标题
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // 强调
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 列表
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    // 链接
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // 代码
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 分隔线
    .replace(/^---$/gm, '<hr>')
    // 段落
    .replace(/^([^<].+)$/gm, '<p>$1</p>');
  
  // 将连续的li合并到ul中
  const liPattern = /<li>(.+?)<\/li>/g;
  let match;
  const lis = [];
  
  while ((match = liPattern.exec(html)) !== null) {
    lis.push(match[0]);
  }
  
  if (lis.length > 0) {
    const ul = `<ul>${lis.join('')}</ul>`;
    html = html.replace(/<li>(.+?)<\/li>/g, '');
    html += ul;
  }
  
  return html;
}
