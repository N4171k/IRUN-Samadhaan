// Performance optimization utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Performance monitor for development
export const measurePerformance = (name, fn) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
  return fn();
};

// Optimize image loading
export const optimizeImage = (src, callback) => {
  const img = new Image();
  img.onload = () => callback(img);
  img.src = src;
};

// Memory cleanup utility
export const cleanupEventListeners = (element, events) => {
  events.forEach(({ event, handler }) => {
    element.removeEventListener(event, handler);
  });
};