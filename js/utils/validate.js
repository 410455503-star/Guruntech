const Validate = {
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
  
  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  isPhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },
  
  isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  isInteger(value) {
    return Number.isInteger(Number(value));
  },
  
  isPositive(value) {
    return this.isNumber(value) && Number(value) > 0;
  },
  
  isNegative(value) {
    return this.isNumber(value) && Number(value) < 0;
  },
  
  isBetween(value, min, max) {
    const num = Number(value);
    return this.isNumber(value) && num >= min && num <= max;
  },
  
  isDate(value) {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  
  isFutureDate(value) {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  },
  
  isPastDate(value) {
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date < today;
  },
  
  isDateRange(startDate, endDate) {
    return this.isDate(startDate) && this.isDate(endDate) && new Date(startDate) <= new Date(endDate);
  },
  
  minLength(value, min) {
    return value && value.length >= min;
  },
  
  maxLength(value, max) {
    return value && value.length <= max;
  },
  
  lengthBetween(value, min, max) {
    return value && value.length >= min && value.length <= max;
  },
  
  isAlphanumeric(value) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(value);
  },
  
  isAlpha(value) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(value);
  },
  
  isChinese(value) {
    const regex = /^[\u4e00-\u9fa5]+$/;
    return regex.test(value);
  },
  
  isIdCard(idCard) {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  },
  
  validateProject(data) {
    const errors = {};
    
    if (this.isEmpty(data.name)) {
      errors.name = '项目名称不能为空';
    } else if (!this.minLength(data.name, 2)) {
      errors.name = '项目名称至少2个字符';
    } else if (!this.maxLength(data.name, 100)) {
      errors.name = '项目名称最多100个字符';
    }
    
    if (this.isEmpty(data.description)) {
      errors.description = '项目描述不能为空';
    } else if (!this.maxLength(data.description, 500)) {
      errors.description = '项目描述最多500个字符';
    }
    
    if (this.isEmpty(data.startDate)) {
      errors.startDate = '开始日期不能为空';
    }
    
    if (this.isEmpty(data.endDate)) {
      errors.endDate = '结束日期不能为空';
    } else if (!this.isEmpty(data.startDate) && !this.isDateRange(data.startDate, data.endDate)) {
      errors.endDate = '结束日期必须晚于开始日期';
    }
    
    if (this.isEmpty(data.priority)) {
      errors.priority = '请选择优先级';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  validateTask(data) {
    const errors = {};
    
    if (this.isEmpty(data.name)) {
      errors.name = '任务名称不能为空';
    } else if (!this.minLength(data.name, 2)) {
      errors.name = '任务名称至少2个字符';
    } else if (!this.maxLength(data.name, 100)) {
      errors.name = '任务名称最多100个字符';
    }
    
    if (this.isEmpty(data.projectId)) {
      errors.projectId = '请选择所属项目';
    }
    
    if (this.isEmpty(data.assigneeId)) {
      errors.assigneeId = '请选择负责人';
    }
    
    if (this.isEmpty(data.dueDate)) {
      errors.dueDate = '截止日期不能为空';
    }
    
    if (this.isEmpty(data.priority)) {
      errors.priority = '请选择优先级';
    }
    
    if (!this.isEmpty(data.progress)) {
      if (!this.isNumber(data.progress) || !this.isBetween(data.progress, 0, 100)) {
        errors.progress = '进度必须在0-100之间';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  validateMember(data) {
    const errors = {};
    
    if (this.isEmpty(data.name)) {
      errors.name = '姓名不能为空';
    } else if (!this.minLength(data.name, 2)) {
      errors.name = '姓名至少2个字符';
    } else if (!this.maxLength(data.name, 50)) {
      errors.name = '姓名最多50个字符';
    }
    
    if (this.isEmpty(data.email)) {
      errors.email = '邮箱不能为空';
    } else if (!this.isEmail(data.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!this.isEmpty(data.phone) && !this.isPhone(data.phone)) {
      errors.phone = '请输入有效的手机号码';
    }
    
    if (this.isEmpty(data.role)) {
      errors.role = '请选择角色';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validate;
}
