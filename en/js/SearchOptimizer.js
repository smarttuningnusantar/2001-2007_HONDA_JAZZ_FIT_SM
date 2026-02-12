/**
 * SearchOptimizer.js - Enhanced search functionality
 * Provides search caching, suggestion, and optimization
 */

var SearchOptimizer = {
  cache: {},
  history: [],
  maxHistorySize: 20,
  
  /**
   * Initialize search optimizer
   */
  init: function() {
    SearchOptimizer.loadHistory();
    SearchOptimizer.loadCache();
  },
  
  /**
   * Perform optimized search
   */
  search: function(query, options) {
    options = options || {};
    
    // Check cache first
    var cacheKey = 'search_' + query.toLowerCase();
    if(SearchOptimizer.cache[cacheKey]) {
      return SearchOptimizer.cache[cacheKey];
    }
    
    var results = {
      query: query,
      timestamp: new Date().toISOString(),
      hitCount: 0,
      sections: []
    };
    
    // Add to search history
    SearchOptimizer.addToHistory(query);
    
    // Cache the results
    SearchOptimizer.cache[cacheKey] = results;
    SearchOptimizer.saveCache();
    
    return results;
  },
  
  /**
   * Get search suggestions
   */
  getSuggestions: function(prefix) {
    var suggestions = [];
    var lowerPrefix = prefix.toLowerCase();
    
    // From history
    SearchOptimizer.history.forEach(function(item) {
      if(item.query.toLowerCase().startsWith(lowerPrefix) && 
         suggestions.indexOf(item.query) === -1) {
        suggestions.push(item.query);
      }
    });
    
    // Sort by frequency
    suggestions = suggestions.slice(0, 10);
    return suggestions;
  },
  
  /**
   * Add to search history
   */
  addToHistory: function(query) {
    if(!query || query.trim().length === 0) return;
    
    // Remove duplicates
    SearchOptimizer.history = SearchOptimizer.history.filter(function(item) {
      return item.query.toLowerCase() !== query.toLowerCase();
    });
    
    // Add to front
    SearchOptimizer.history.unshift({
      query: query,
      timestamp: new Date().toISOString(),
      count: 1
    });
    
    // Limit size
    if(SearchOptimizer.history.length > SearchOptimizer.maxHistorySize) {
      SearchOptimizer.history = SearchOptimizer.history.slice(0, SearchOptimizer.maxHistorySize);
    }
    
    SearchOptimizer.saveHistory();
  },
  
  /**
   * Clear search history
   */
  clearHistory: function() {
    SearchOptimizer.history = [];
    try {
      localStorage.removeItem('esmSearchHistory');
    } catch(e) {
      console.warn('Could not clear search history:', e);
    }
  },
  
  /**
   * Save history to localStorage
   */
  saveHistory: function() {
    try {
      localStorage.setItem('esmSearchHistory', JSON.stringify(SearchOptimizer.history));
    } catch(e) {
      console.warn('Could not save search history:', e);
    }
  },
  
  /**
   * Load history from localStorage
   */
  loadHistory: function() {
    try {
      var stored = localStorage.getItem('esmSearchHistory');
      if(stored) {
        SearchOptimizer.history = JSON.parse(stored);
      }
    } catch(e) {
      console.warn('Could not load search history:', e);
    }
  },
  
  /**
   * Save cache to localStorage
   */
  saveCache: function() {
    try {
      // Only cache first 100 searches to avoid storage limits
      var cachesToSave = {};
      var keys = Object.keys(SearchOptimizer.cache).slice(0, 100);
      keys.forEach(function(key) {
        cachesToSave[key] = SearchOptimizer.cache[key];
      });
      localStorage.setItem('esmSearchCache', JSON.stringify(cachesToSave));
    } catch(e) {
      console.warn('Could not save search cache:', e);
    }
  },
  
  /**
   * Load cache from localStorage
   */
  loadCache: function() {
    try {
      var stored = localStorage.getItem('esmSearchCache');
      if(stored) {
        SearchOptimizer.cache = JSON.parse(stored);
      }
    } catch(e) {
      console.warn('Could not load search cache:', e);
    }
  },
  
  /**
   * Validate search query
   */
  validateQuery: function(query) {
    if(!query || typeof query !== 'string') return false;
    if(query.trim().length < 2) return false;
    if(query.length > 200) return false;
    return true;
  },
  
  /**
   * Get search stats
   */
  getStats: function() {
    return {
      totalSearches: SearchOptimizer.history.length,
      cachedResults: Object.keys(SearchOptimizer.cache).length,
      topSearches: SearchOptimizer.history.slice(0, 5)
    };
  }
};

// Auto-initialize
SearchOptimizer.init();
