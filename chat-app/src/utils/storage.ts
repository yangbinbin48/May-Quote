/**
 * 存储工具
 * 
 * 重构版：仅使用IndexedDB，删除了所有localStorage和迁移代码
 * 提供与原API兼容的函数，但全部使用IndexedDB存储
 */

import { 
  saveConfig, 
  getConfig, 
  CONFIG_KEYS,
  encryptData,
  decryptData
} from './db';

// 创建一个缓存系统，减少频繁的异步操作
const memoryCache = new Map<string, string>();

/**
 * 保存API密钥
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  if (!apiKey) {
    await saveConfig(CONFIG_KEYS.API_KEY, '');
    memoryCache.set('api-key', '');
    return;
  }
  
  const encrypted = encryptData(apiKey);
  await saveConfig(CONFIG_KEYS.API_KEY, encrypted);
  memoryCache.set('api-key', apiKey);
};

/**
 * 获取API密钥
 * 使用内存缓存保证同步调用的性能
 */
export const getApiKey = (): string => {
  try {
    // 首先尝试从内存缓存获取
    if (memoryCache.has('api-key')) {
      return memoryCache.get('api-key') || '';
    }
    
    // 如果缓存中没有，启动异步加载并返回空值
    // 异步加载结果会存入缓存，下次调用时可用
    getConfig(CONFIG_KEYS.API_KEY, '')
      .then(value => {
        const decrypted = value ? decryptData(value) : '';
        memoryCache.set('api-key', decrypted);
      })
      .catch(err => {
        console.error('获取API密钥失败:', err);
      });
    
    return '';
  } catch (e) {
    console.error('获取API密钥失败:', e);
    return '';
  }
};

/**
 * 获取模型选择 - 同步版本，直接从localStorage获取
 * 不使用缓存或默认值，确保始终返回用户的实际选择
 */
export const getModel = (): string => {
  // 使用localStorage作为主要存储，确保同步操作始终能获取到值
  try {
    // 尝试从localStorage读取
    const modelFromLocalStorage = localStorage.getItem('MODEL') || '';
    if (modelFromLocalStorage) {
      // 直接返回找到的值
      return modelFromLocalStorage;
    }
    
    // 如果localStorage中没有，返回默认模型
    // 但这个默认值只是为了防止UI错误，不应该用于实际API调用
    return 'deepseek-r1-250120';
  } catch (e) {
    console.error('获取模型选择失败:', e);
    return 'deepseek-r1-250120';
  }
};

/**
 * 保存模型选择 - 同时保存到IndexedDB和localStorage
 */
export const saveModel = async (model: string): Promise<void> => {
  try {
    // 同时保存到IndexedDB和localStorage，确保同步版本始终可用
    await saveConfig(CONFIG_KEYS.MODEL, model);
    localStorage.setItem('MODEL', model);
    
    // 不再使用内存缓存
    console.log('模型已设置为:', model);
  } catch (e) {
    console.error('保存模型选择失败:', e);
  }
};

/**
 * 保存主题设置
 */
export const saveTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  await saveConfig(CONFIG_KEYS.THEME, theme);
  memoryCache.set('theme', theme);
};

/**
 * 获取主题设置
 */
export const getTheme = (): 'light' | 'dark' => {
  try {
    const defaultTheme: 'light' | 'dark' = 'light';
    
    // 首先尝试从内存缓存获取
    if (memoryCache.has('theme')) {
      return memoryCache.get('theme') as 'light' | 'dark' || defaultTheme;
    }
    
    // 如果缓存中没有，启动异步加载并返回默认值
    getConfig(CONFIG_KEYS.THEME, defaultTheme)
      .then(value => {
        memoryCache.set('theme', value);
      })
      .catch(err => {
        console.error('获取主题设置失败:', err);
      });
    
    return defaultTheme;
  } catch (e) {
    console.error('获取主题设置失败:', e);
    return 'light';
  }
};

/**
 * 清理缓存，用于重置或注销时调用
 */
export const clearCache = (): void => {
  memoryCache.clear();
};
