'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      console.log(`${metric.name}: ${metric.value}`);
      
      // Send to analytics or monitoring service
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Google Analytics 4 example
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // Core Web Vitals
    const observeWebVitals = () => {
      // First Contentful Paint (FCP)
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              reportWebVitals({
                name: 'FCP',
                value: entry.startTime,
                id: `fcp-${Date.now()}`,
              });
            }
          }
        });
        
        try {
          observer.observe({ type: 'paint', buffered: true });
        } catch (e) {
          console.warn('Performance Observer not supported');
        }
      }

      // Time to First Byte (TTFB)
      if (typeof performance !== 'undefined' && performance.timing) {
        const ttfb = performance.timing.responseStart - performance.timing.requestStart;
        reportWebVitals({
          name: 'TTFB',
          value: ttfb,
          id: `ttfb-${Date.now()}`,
        });
      }
    };

    // Mobile-specific performance monitoring
    const monitorMobilePerformance = () => {
      // Memory usage (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }

      // Network information
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        console.log('Network info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      }

      // Battery status (deprecated but still useful for debugging)
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          console.log('Battery status:', {
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        });
      }
    };

    // Start monitoring
    observeWebVitals();
    monitorMobilePerformance();

    // Monitor long tasks
    if (typeof PerformanceObserver !== 'undefined') {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long task detected:', entry.duration, 'ms');
        }
      });

      try {
        longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }

    // Cleanup function
    return () => {
      // Clean up observers if needed
    };
  }, []);

  return null; // This component doesn't render anything
}

// Hook for component-level performance monitoring
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // Longer than one frame (60fps)
        console.warn(`Component ${componentName} render took ${duration}ms`);
      }
      
      // Mark for performance measurement
      performance.mark(`${componentName}-end`);
      performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
    };
  });

  useEffect(() => {
    performance.mark(`${componentName}-start`);
  }, [componentName]);
}

// Mobile performance utilities
export const mobilePerformanceUtils = {
  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Lazy load images with Intersection Observer
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      observer.observe(img);
    } else {
      // Fallback for older browsers
      img.src = src;
    }
  },

  // Measure First Input Delay (FID)
  measureFID: () => {
    let firstInputDelay: number;
    
    function onFirstInput(event: Event) {
      firstInputDelay = performance.now() - (event as any).timeStamp;
      console.log('First Input Delay:', firstInputDelay);
      
      // Clean up
      document.removeEventListener('mousedown', onFirstInput);
      document.removeEventListener('touchstart', onFirstInput);
    }
    
    document.addEventListener('mousedown', onFirstInput);
    document.addEventListener('touchstart', onFirstInput);
  },

  // Measure Cumulative Layout Shift (CLS)
  measureCLS: () => {
    let clsScore = 0;
    
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
        console.log('Cumulative Layout Shift:', clsScore);
      });
      
      try {
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }
    }
  },
};