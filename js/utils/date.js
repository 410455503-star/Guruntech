const DateUtils = {
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  formatDateTime(date) {
    return this.formatDate(date, 'YYYY-MM-DD HH:mm');
  },
  
  formatTime(date) {
    return this.formatDate(date, 'HH:mm');
  },
  
  formatRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    if (weeks < 4) return `${weeks}周前`;
    if (months < 12) return `${months}个月前`;
    return `${years}年前`;
  },
  
  getDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  subtractDays(date, days) {
    return this.addDays(date, -days);
  },
  
  isToday(date) {
    if (!date) return false;
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  },
  
  isPast(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  },
  
  isFuture(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  },
  
  getMonthName(month, short = false) {
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    const shortMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return short ? shortMonths[month] : months[month];
  },
  
  getWeekDayName(day, short = false) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const shortDays = ['日', '一', '二', '三', '四', '五', '六'];
    return short ? shortDays[day] : days[day];
  },
  
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },
  
  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  },
  
  isWeekend(date) {
    if (!date) return false;
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6;
  },
  
  getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  },
  
  parseDate(dateString) {
    const patterns = [
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{4})\/(\d{2})\/(\d{2})$/,
      /^(\d{4})年(\d{2})月(\d{2})日$/
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    return new Date(dateString);
  },
  
  getQuarter(date) {
    const month = new Date(date).getMonth();
    return Math.floor(month / 3) + 1;
  },
  
  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },
  
  getEndOfWeek(date) {
    const startOfWeek = this.getStartOfWeek(date);
    return this.addDays(startOfWeek, 6);
  },
  
  getStartOfMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },
  
  getEndOfMonth(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  },
  
  compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  },
  
  isSameDay(date1, date2) {
    return this.compareDates(date1, date2) === 0;
  },
  
  formatDuration(startDate, endDate) {
    const days = this.getDaysBetween(startDate, endDate);
    if (days === 0) return '1天';
    if (days < 7) return `${days}天`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return remainingDays > 0 ? `${weeks}周${remainingDays}天` : `${weeks}周`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return remainingDays > 0 ? `${months}月${remainingDays}天` : `${months}月`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    return remainingDays > 0 ? `${years}年${Math.floor(remainingDays / 30)}月` : `${years}年`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateUtils;
}
