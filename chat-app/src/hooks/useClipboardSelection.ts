import { useState, useCallback } from 'react';
import { ClipboardItem } from '../types';

/**
 * 剪贴板选择状态管理Hook
 * 
 * 该Hook负责管理剪贴板多选功能相关的状态和逻辑
 */
export function useClipboardSelection(items: ClipboardItem[]) {
  // 多选模式状态
  const [selectMode, setSelectMode] = useState(false);
  // 已选中项目ID列表
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 进入选择模式
  const enterSelectMode = useCallback(() => {
    setSelectMode(true);
    setSelectedItems([]);
  }, []);
  
  // 取消选择模式
  const cancelSelection = useCallback(() => {
    setSelectMode(false);
    setSelectedItems([]);
  }, []);
  
  // 选择所有项目
  const selectAll = useCallback(() => {
    if (items.length === selectedItems.length) {
      // 如果已经全选，则清空
      setSelectedItems([]);
    } else {
      // 否则全选
      setSelectedItems(items.map(item => item.id));
    }
  }, [items, selectedItems]);
  
  // 判断是否已全选
  const isAllSelected = items.length > 0 && items.length === selectedItems.length;
  
  // 处理单个项目选择
  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);
  
  return {
    selectMode,
    selectedItems,
    enterSelectMode,
    cancelSelection,
    selectAll,
    isAllSelected,
    handleItemSelect
  };
}
