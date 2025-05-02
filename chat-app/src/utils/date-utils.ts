/**
 * 日期和时间处理工具函数
 */

/**
 * 格式化时间戳为智能显示的时间文本
 * 规则：
 * - 今天的消息：只显示时间（13:45）
 * - 昨天的消息：显示"昨天 13:45"
 * - 本周内的消息：显示"周一 13:45"
 * - 更早的消息：显示完整日期"2025年4月25日 13:45"
 * 
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间文本
 */
export function formatSmartTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // 获取时间部分（时:分）
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // 计算日期差异
  const isToday = isSameDay(date, now);
  const isYesterday = checkIsYesterday(timestamp); // 使用更准确的昨天检测函数
  
  // 是否是本周
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay()); // 设置为本周日（周首日）
  const isThisWeek = date >= startOfWeek;
  
  if (isToday) {
    return time; // 今天只显示时间
  } else if (isYesterday) {
    return `昨天 ${time}`; // 昨天
  } else if (isThisWeek) {
    // 本周内显示周几
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    return `${weekday} ${time}`;
  } else {
    // 更早的消息显示完整日期
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
  }
}

/**
 * 判断两个日期是否是同一天
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 检查给定的时间戳是否为昨天
 * 这个函数更准确地检测"昨天"，避免时区和夏令时问题
 */
function checkIsYesterday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  
  // 复制当前日期，并设置为昨天的同一时刻
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  return isSameDay(date, yesterday);
}
