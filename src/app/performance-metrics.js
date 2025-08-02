// Performance monitoring for DNS transition and platform optimization
export const performanceMetrics = {
  // Track DNS resolution timing
  checkDNSResolution: async () => {
    const start = performance.now();
    try {
      await fetch('https://edirne-events.com', { 
        mode: 'no-cors',
        cache: 'no-cache' 
      });
      const duration = performance.now() - start;

      return { resolved: true, duration };
    } catch (error) {
      const duration = performance.now() - start;

      return { resolved: false, duration };
    }
  },

  // Track image loading performance across devices
  trackImageLoading: (eventTitle, imageUrl, loadTime) => {
    if (typeof window !== 'undefined') {

      
      // Store metrics for analysis
      const metrics = JSON.parse(localStorage.getItem('imageMetrics') || '[]');
      metrics.push({
        title: eventTitle,
        url: imageUrl,
        loadTime,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // Keep only last 50 entries
      if (metrics.length > 50) metrics.splice(0, metrics.length - 50);
      localStorage.setItem('imageMetrics', JSON.stringify(metrics));
    }
  },

  // Monitor platform stability during DNS transition
  monitorPlatformHealth: () => {
    const start = Date.now();
    return {
      timestamp: start,
      url: window.location.href,
      ready: document.readyState,
      images: document.images.length,
      loadTime: window.performance?.timing ? 
        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : 0
    };
  }
};