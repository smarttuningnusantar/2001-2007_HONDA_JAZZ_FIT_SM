/**
 * FrameSync.js - Cross-frame Synchronization Manager
 * Handles parent-child frame communication and synchronization
 * Prevents race conditions in frameset-based applications
 */

var FrameSync = {
  timeout: 10000, // 10 seconds max wait
  pollInterval: 100, // Check every 100ms
  debug: true,
  
  /**
   * Parent frame initialization
   * Call this from parent after all initialization is complete
   */
  parentReady: function() {
    console.log("[FrameSync] Parent frame marking as READY");
    
    if (!window.ESM_SYNC) {
      window.ESM_SYNC = {};
    }
    
    window.ESM_SYNC.parentReady = true;
    window.ESM_SYNC.readyTime = new Date().getTime();
    
    // Notify all child frames
    try {
      for (var i = 0; i < window.frames.length; i++) {
        try {
          window.frames[i].ESM_SYNC_PARENT_READY = true;
        } catch(e) {
          // Cross-origin or other access issues
        }
      }
    } catch(e) {
      console.warn("[FrameSync] Could not notify child frames:", e.message);
    }
    
    return true;
  },
  
  /**
   * Check if parent is ready
   */
  isParentReady: function() {
    try {
      if (typeof(parent) === 'undefined') {
        return false;
      }
      
      if (parent.ESM_SYNC && parent.ESM_SYNC.parentReady === true) {
        return true;
      }
      
      if (parent.window && parent.window.ESM_SYNC && parent.window.ESM_SYNC.parentReady === true) {
        return true;
      }
      
      // Check if parent has document.ESM (legacy check)
      if (parent.document && parent.document.ESM && typeof(parent.document.ESM) === 'object') {
        return true;
      }
    } catch(e) {
      // Likely cross-origin issue
    }
    
    return false;
  },
  
  /**
   * Get parent ready time
   */
  getParentReadyTime: function() {
    try {
      if (parent && parent.ESM_SYNC && parent.ESM_SYNC.readyTime) {
        return parent.ESM_SYNC.readyTime;
      }
    } catch(e) {}
    return null;
  },
  
  /**
   * Wait for parent to be ready with polling
   */
  waitForParent: function(callback, options) {
    options = options || {};
    var maxTimeout = options.timeout || FrameSync.timeout;
    var pollInterval = options.pollInterval || FrameSync.pollInterval;
    var startTime = new Date().getTime();
    var attemptCount = 0;
    
    if (FrameSync.debug) {
      console.log("[FrameSync] Waiting for parent frame to be ready...");
    }
    
    function checkParent() {
      attemptCount++;
      var elapsed = new Date().getTime() - startTime;
      
      if (FrameSync.isParentReady()) {
        if (FrameSync.debug) {
          console.log("[FrameSync] Parent is READY after " + elapsed + "ms (" + attemptCount + " checks)");
        }
        if (typeof(callback) === 'function') {
          callback(true, elapsed);
        }
        return;
      }
      
      if (elapsed > maxTimeout) {
        console.error("[FrameSync] Parent readiness timeout after " + maxTimeout + "ms");
        if (typeof(callback) === 'function') {
          callback(false, elapsed);
        }
        return;
      }
      
      // Continue polling
      setTimeout(checkParent, pollInterval);
    }
    
    // Start checking immediately
    checkParent();
  },
  
  /**
   * Setup parent-child communication channel
   */
  setupChannel: function(options) {
    options = options || {};
    
    var channel = {
      messages: [],
      listeners: {},
      
      send: function(messageType, data) {
        if (FrameSync.debug) {
          console.log("[FrameSync] Sending message:", messageType, data);
        }
        
        try {
          if (parent && parent.ESM_SYNC) {
            if (!parent.ESM_SYNC.messages) {
              parent.ESM_SYNC.messages = [];
            }
            parent.ESM_SYNC.messages.push({
              type: messageType,
              data: data,
              timestamp: new Date().getTime(),
              source: 'child'
            });
          }
        } catch(e) {
          console.warn("[FrameSync] Could not send message:", e.message);
        }
      },
      
      on: function(messageType, handler) {
        if (!channel.listeners[messageType]) {
          channel.listeners[messageType] = [];
        }
        channel.listeners[messageType].push(handler);
      },
      
      checkMessages: function() {
        try {
          if (parent && parent.ESM_SYNC && parent.ESM_SYNC.messages) {
            var newMessages = parent.ESM_SYNC.messages.filter(function(msg) {
              return msg.timestamp > (channel.lastCheck || 0);
            });
            
            newMessages.forEach(function(msg) {
              if (channel.listeners[msg.type]) {
                channel.listeners[msg.type].forEach(function(handler) {
                  handler(msg.data);
                });
              }
            });
            
            channel.lastCheck = new Date().getTime();
          }
        } catch(e) {
          // Silently fail for cross-origin
        }
      },
      
      startMessageListener: function(interval) {
        interval = interval || 500;
        setInterval(channel.checkMessages, interval);
      }
    };
    
    return channel;
  },
  
  /**
   * Get parent ESM object with retry
   */
  getParentESM: function(callback) {
    var attempts = 0;
    var maxAttempts = 50; // 50 * 100ms = 5 seconds
    
    function tryGetESM() {
      attempts++;
      
      try {
        if (parent && parent.document && parent.document.ESM && typeof(parent.document.ESM) === 'object') {
          if (FrameSync.debug) {
            console.log("[FrameSync] Got parent ESM after " + attempts + " attempts");
          }
          if (typeof(callback) === 'function') {
            callback(parent.document.ESM, null);
          }
          return;
        }
      } catch(e) {
        // Ignore errors during attempts
      }
      
      if (attempts >= maxAttempts) {
        var error = "Could not access parent ESM object after " + attempts + " attempts";
        console.error("[FrameSync] " + error);
        if (typeof(callback) === 'function') {
          callback(null, error);
        }
        return;
      }
      
      setTimeout(tryGetESM, 100);
    }
    
    tryGetESM();
  },
  
  /**
   * Create fallback ESM object
   */
  createFallbackESM: function() {
    return {
      Lng: [],
      MsgC: [],
      ModelInfo: [],
      SIE: [],
      lngSel: 0,
      mySel: 0,
      mcSel: 0,
      smFlag: -1,
      brmFlag: -1,
      mdlSel: 0,
      Key: "",
      Sct: "",
      Sc: "",
      Sys: "",
      Comp: "",
      Sitq: "",
      Keyword: "",
      fn: {
        GetCookie: function(name) {
          return "";
        },
        SetCookie: function(name, value, path) {
          // No-op
        }
      }
    };
  },
  
  /**
   * Initialize child frame with synchronization
   */
  initializeChild: function(onSuccess, onFailure) {
    if (FrameSync.debug) {
      console.log("[FrameSync] Child frame initializing with synchronization");
    }
    
    var timeoutHandle;
    
    // Wait for parent with timeout
    FrameSync.waitForParent(function(success, elapsed) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      
      if (success) {
        // Parent is ready, get ESM object
        FrameSync.getParentESM(function(esm, error) {
          if (esm) {
            if (FrameSync.debug) {
              console.log("[FrameSync] Successfully initialized with parent ESM");
            }
            if (typeof(onSuccess) === 'function') {
              onSuccess(esm);
            }
          } else {
            console.error("[FrameSync] " + (error || "Unknown error getting parent ESM"));
            if (typeof(onFailure) === 'function') {
              onFailure(error);
            }
          }
        });
      } else {
        var error = "Parent frame readiness timeout";
        console.error("[FrameSync] " + error);
        if (typeof(onFailure) === 'function') {
          onFailure(error);
        }
      }
    }, { timeout: 5000 }); // 5 second timeout for parent readiness
    
    // Extra safety timeout
    timeoutHandle = setTimeout(function() {
      console.error("[FrameSync] Overall initialization timeout");
      if (typeof(onFailure) === 'function') {
        onFailure("Initialization timeout");
      }
    }, 6000);
  },
  
  /**
   * Get diagnostic info
   */
  getDiagnostics: function() {
    var info = {
      isChild: true,
      parentReady: false,
      parentAccessible: false,
      hasESMObject: false,
      parentReadyTime: null,
      errors: []
    };
    
    try {
      info.parentReady = FrameSync.isParentReady();
      info.parentAccessible = typeof(parent) !== 'undefined' && typeof(parent.document) !== 'undefined';
      
      if (info.parentAccessible) {
        try {
          info.hasESMObject = parent.document.ESM && typeof(parent.document.ESM) === 'object';
          info.parentReadyTime = FrameSync.getParentReadyTime();
        } catch(e) {
          info.errors.push(e.message);
        }
      }
    } catch(e) {
      info.errors.push("Could not access parent: " + e.message);
    }
    
    return info;
  }
};

// Export if using as module
if (typeof(module) !== 'undefined' && module.exports) {
  module.exports = FrameSync;
}
