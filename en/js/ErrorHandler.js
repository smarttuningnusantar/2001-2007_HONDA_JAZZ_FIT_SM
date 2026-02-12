/**
 * ErrorHandler.js - Centralized error handling and logging
 * Manages frame loading errors and provides fallback mechanisms
 */

var ErrorHandler = {
  maxRetries: 3,
  retryDelay: 500,
  errors: [],
  
  /**
   * Initialize error handler
   */
  init: function() {
    window.onerror = ErrorHandler.handleError;
    setInterval(ErrorHandler.checkFrameHealth, 3000);
  },
  
  /**
   * Handle global errors
   */
  handleError: function(msg, url, line, col, error) {
    var errorObj = {
      message: msg,
      source: url,
      lineno: line,
      colno: col,
      stack: error ? error.stack : '',
      timestamp: new Date().toISOString()
    };
    
    ErrorHandler.log(errorObj);
    
    // Don't suppress normal error handling
    return false;
  },
  
  /**
   * Log error to local storage and console
   */
  log: function(errorObj) {
    ErrorHandler.errors.push(errorObj);
    
    // Keep only last 50 errors
    if(ErrorHandler.errors.length > 50) {
      ErrorHandler.errors.shift();
    }
    
    // Log to console
    console.error('[ESM Error]', errorObj.message, {
      source: errorObj.source,
      line: errorObj.lineno,
      column: errorObj.colno
    });
    
    // Save to localStorage for debugging
    try {
      localStorage.setItem('esmErrors', JSON.stringify(ErrorHandler.errors));
    } catch(e) {
      console.warn('Could not save errors to localStorage:', e);
    }
  },
  
  /**
   * Check frame health and connectivity
   */
  checkFrameHealth: function() {
    try {
      var frames = window.frames;
      var healthCheck = {
        timestamp: new Date().toISOString(),
        frames: []
      };
      
      for(var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var frameHealth = {
          name: frame.name || 'frame' + i,
          ready: false,
          error: null
        };
        
        try {
          if(frame.document && frame.document.body) {
            frameHealth.ready = true;
          }
        } catch(e) {
          frameHealth.error = 'XSS protected or not loaded';
        }
        
        healthCheck.frames.push(frameHealth);
      }
      
      // Save health check
      try {
        localStorage.setItem('esmFrameHealth', JSON.stringify(healthCheck));
      } catch(e) {
        console.warn('Could not save frame health:', e);
      }
    } catch(e) {
      console.error('Frame health check failed:', e);
    }
  },
  
  /**
   * Retry loading with exponential backoff
   */
  retryWithBackoff: function(callback, attempt) {
    attempt = attempt || 0;
    
    if(attempt >= ErrorHandler.maxRetries) {
      console.error('Max retries reached');
      return false;
    }
    
    var delay = ErrorHandler.retryDelay * Math.pow(2, attempt);
    
    setTimeout(function() {
      try {
        callback();
      } catch(e) {
        ErrorHandler.log({
          message: 'Retry attempt ' + (attempt + 1) + ' failed: ' + e.message,
          source: 'ErrorHandler.retryWithBackoff',
          lineno: 0,
          colno: 0,
          stack: e.stack,
          timestamp: new Date().toISOString()
        });
        ErrorHandler.retryWithBackoff(callback, attempt + 1);
      }
    }, delay);
  },
  
  /**
   * Get error logs
   */
  getLogs: function() {
    try {
      return JSON.parse(localStorage.getItem('esmErrors') || '[]');
    } catch(e) {
      return ErrorHandler.errors;
    }
  },
  
  /**
   * Clear error logs
   */
  clearLogs: function() {
    ErrorHandler.errors = [];
    try {
      localStorage.removeItem('esmErrors');
      localStorage.removeItem('esmFrameHealth');
    } catch(e) {
      console.warn('Could not clear logs:', e);
    }
  }
};

// Auto-initialize on load
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ErrorHandler.init);
} else {
  ErrorHandler.init();
}
