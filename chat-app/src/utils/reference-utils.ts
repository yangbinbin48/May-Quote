import { ReferenceItem } from '../types';
import { generateId } from './db';

/**
 * 根据内容生成预览文本（中文10个字，英文字符算两个）
 * @param content 完整内容
 * @returns 预览文本
 */
export function generatePreviewText(content: string): string {
  // 移除Markdown格式并清理空白字符
  const cleanContent = content
    .replace(/#+\s+/g, '') // 移除标题格式
    .replace(/\*\*/g, '')  // 移除加粗
    .replace(/\*/g, '')    // 移除斜体
    .replace(/`/g, '')     // 移除行内代码
    .replace(/\n/g, ' ')   // 换行替换为空格
    .replace(/\s+/g, ' ')  // 多个空格替换为单个空格
    .trim();
  
  // 如果内容为空，返回空字符串
  if (!cleanContent) return '';
  
  // 中文字符计为1，英文及其他字符计为0.5
  const maxLength = 10; // 最大长度为10个中文字符
  let currentLength = 0;
  let result = '';
  
  // 判断字符是否为中文的正则表达式
  const isChineseChar = /[\u4e00-\u9fa5]/;
  
  // 逐字符遍历，计算累计长度
  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    // 中文字符长度为1，其他字符长度为0.5
    const charLength = isChineseChar.test(char) ? 1 : 0.5;
    
    // 判断是否超出长度限制
    if (currentLength + charLength <= maxLength) {
      result += char;
      currentLength += charLength;
    } else {
      break;
    }
  }
  
  // 如果结果与原始内容不同，添加省略号
  return result === cleanContent ? result : result + '...';
}

/**
 * 截断显示内容（最大500字符）并清理空行
 * @param content 原始内容
 * @returns 截断后的显示内容
 */
export function truncateForDisplay(content: string): string {
  // 处理空内容
  if (!content) return '';
  
  // 清理内容：去除开头的空行，将多个连续空行减少为一个
  let cleanedContent = content
    .replace(/^\s*\n+/g, '') // 移除开头的空行
    .replace(/\n{3,}/g, '\n\n'); // 将3个及以上连续空行减少为2个
  
  // 截断过长的内容
  if (cleanedContent.length > 500) {
    cleanedContent = cleanedContent.substring(0, 500) + '...';
  }
  
  return cleanedContent;
}

/**
 * 创建新的引用项
 * @param content 引用内容
 * @returns 引用项对象
 */
export function createReferenceItem(content: string): ReferenceItem {
  return {
    id: generateId(),
    content,
    previewText: generatePreviewText(content),
    timestamp: Date.now()
  };
}

/**
 * 合并多个内容成为单个引用
 * @param contents 内容数组
 * @returns 合并后的内容
 */
export function combineContents(contents: string[]): string {
  return contents.join('\n\n');
}

/**
 * 构建完整的提示语，包含引用和用户输入
 * @param references 引用项数组
 * @param userInput 用户输入
 * @returns 完整提示语
 */
export function buildFullPrompt(references: ReferenceItem[], userInput: string): string {
  if (references.length === 0) return userInput;
  
  const referencesText = references.map(ref => ref.content).join('\n\n');
  
  if (!userInput) return referencesText;
  
  return `${referencesText}\n\n${userInput}`;
}
