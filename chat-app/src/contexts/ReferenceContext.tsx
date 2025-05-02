import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ReferenceItem } from '../types';
import { createReferenceItem, buildFullPrompt } from '../utils/reference-utils';

// 引用Context接口定义
interface ReferenceContextType {
  references: ReferenceItem[];
  addReference: (content: string) => void;
  deleteReference: (id: string) => void;
  clearAllReferences: () => void;
  getFullPrompt: (userInput: string) => string;
}

// 创建默认值
const defaultContextValue: ReferenceContextType = {
  references: [],
  addReference: () => {},
  deleteReference: () => {},
  clearAllReferences: () => {},
  getFullPrompt: (userInput) => userInput
};

// 创建Context
const ReferenceContext = createContext<ReferenceContextType>(defaultContextValue);

// 使用自定义Hook获取引用上下文
export const useReference = () => useContext(ReferenceContext);

// Provider Props接口
interface ReferenceProviderProps {
  children: ReactNode;
}

/**
 * 引用功能Provider组件
 * 提供全局引用状态和方法
 */
export const ReferenceProvider: React.FC<ReferenceProviderProps> = ({ children }) => {
  // 引用项状态
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  
  // 添加引用
  const addReference = useCallback((content: string) => {
    if (!content.trim()) return; // 忽略空内容
    
    const newReference = createReferenceItem(content);
    setReferences(prev => [...prev, newReference]);
    
    // 此处可以添加通知InputArea组件的逻辑
    // 例如通过事件发布/订阅模式
    
    console.log('添加引用:', newReference.previewText);
  }, []);
  
  // 删除引用
  const deleteReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  }, []);
  
  // 清除所有引用
  const clearAllReferences = useCallback(() => {
    setReferences([]);
  }, []);
  
  // 获取完整提示语
  const getFullPrompt = useCallback((userInput: string) => {
    return buildFullPrompt(references, userInput);
  }, [references]);
  
  // 提供上下文值
  const contextValue: ReferenceContextType = {
    references,
    addReference,
    deleteReference,
    clearAllReferences,
    getFullPrompt
  };
  
  return (
    <ReferenceContext.Provider value={contextValue}>
      {children}
    </ReferenceContext.Provider>
  );
};

export default ReferenceContext;
