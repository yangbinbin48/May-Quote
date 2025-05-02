import { useState } from 'react';
import { ClipboardItem } from '../types';

/**
 * 排序模式自定义Hook
 * 
 * 用于管理剪贴板排序模式状态和相关逻辑
 * 使用上下按钮移动项目，退出时保存最终排序结果
 */
export function useSortMode(items: ClipboardItem[], onReorder?: (items: ClipboardItem[]) => void) {
  // 排序模式状态
  const [sortMode, setSortMode] = useState<boolean>(false);
  
  // 临时排序状态 - 只在本地跟踪排序变化，不立即保存
  const [tempSortedItems, setTempSortedItems] = useState<ClipboardItem[]>([]);
  
  // 进入排序模式 - 初始化临时排序状态
  const enterSortMode = () => {
    // 复制当前项目作为初始排序状态
    setTempSortedItems([...(items || [])]);
    setSortMode(true);
  };
  
  // 退出排序模式 - 保存最终排序结果
  const exitSortMode = () => {
    // 如果有临时排序数据，保存最终结果
    if (tempSortedItems.length > 0) {
      // 更新order字段
      const updatedItems = tempSortedItems.map((item, index) => ({
        ...item, 
        order: index
      }));
      
      // 保存最终结果
      if (onReorder) {
        onReorder(updatedItems);
      }
    }
    
    // 清空临时排序状态
    setTempSortedItems([]);
    setSortMode(false);
  };
  
  // 将项目向上移动一位
  const moveItemUp = (itemId: string) => {
    // 找到项目的索引
    const index = tempSortedItems.findIndex(item => item.id === itemId);
    
    // 如果已经是第一项或者找不到项目，不做任何操作
    if (index <= 0) return null;
    
    // 创建新的数组并交换位置
    const newItems = [...tempSortedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    
    // 更新临时排序状态
    setTempSortedItems(newItems);
    
    // 返回新数组供外部组件立即使用
    return newItems;
  };
  
  // 将项目向下移动一位
  const moveItemDown = (itemId: string) => {
    // 找到项目的索引
    const index = tempSortedItems.findIndex(item => item.id === itemId);
    
    // 如果已经是最后一项或者找不到项目，不做任何操作
    if (index === -1 || index >= tempSortedItems.length - 1) return null;
    
    // 创建新的数组并交换位置
    const newItems = [...tempSortedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    
    // 更新临时排序状态
    setTempSortedItems(newItems);
    
    // 返回新数组供外部组件立即使用
    return newItems;
  };
  
  return {
    sortMode,
    tempSortedItems,
    enterSortMode,
    exitSortMode,
    moveItemUp,
    moveItemDown
  };
}
