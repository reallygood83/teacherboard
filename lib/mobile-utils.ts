// Mobile optimization utilities for 학급 홈페이지
// SuperClaude Framework Mobile Enhancement

// Device detection utilities
export const deviceUtils = {
  // Check if device is mobile
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device is iOS
  isIOS: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  // Check if device is Android
  isAndroid: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  },

  // Check if device is tablet
  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPad|Android(?!.*Mobile)/.test(navigator.userAgent) || 
           (window.innerWidth >= 768 && window.innerWidth <= 1024);
  },

  // Get device info
  getDeviceInfo: () => {
    if (typeof window === 'undefined') return null;
    
    return {
      isMobile: deviceUtils.isMobile(),
      isIOS: deviceUtils.isIOS(),
      isAndroid: deviceUtils.isAndroid(),
      isTablet: deviceUtils.isTablet(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
    };
  },

  // Check for PWA mode
  isPWA: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },
};

// Touch and gesture utilities
export const touchUtils = {
  // Add touch event listeners with proper passive handling
  addTouchListener: (
    element: HTMLElement,
    eventType: 'touchstart' | 'touchmove' | 'touchend',
    handler: (event: TouchEvent) => void,
    options: { passive?: boolean; capture?: boolean } = {}
  ) => {
    element.addEventListener(eventType, handler, {
      passive: options.passive ?? true,
      capture: options.capture ?? false,
    });
  },

  // Prevent scroll during touch interactions
  preventScrollDuringTouch: (element: HTMLElement) => {
    let startY: number;
    
    element.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Prevent scroll if moving vertically
      if (Math.abs(deltaY) > 10) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  // Haptic feedback simulation
  simulateHaptic: (type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Use native haptic feedback on iOS
    if (deviceUtils.isIOS() && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
    
    // Fallback: add haptic CSS class for visual feedback
    document.body.classList.add(`haptic-${type}`);
    setTimeout(() => {
      document.body.classList.remove(`haptic-${type}`);
    }, 100);
  },

  // Debounced touch handler
  createDebouncedTouchHandler: (handler: Function, delay: number = 300) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handler(...args), delay);
    };
  },
};

// Performance optimization utilities
export const performanceUtils = {
  // Lazy load images with modern browser APIs
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      img.loading = 'lazy';
      img.src = src;
    } else if ('IntersectionObserver' in window) {
      // Intersection Observer fallback
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
      // Basic fallback
      img.src = src;
    }
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      '/styles/mobile-optimized.css',
      '/icons/icon-192x192.png',
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'image';
      document.head.appendChild(link);
    });
  },

  // Memory-efficient component rendering
  createVirtualizedList: (items: any[], itemHeight: number, containerHeight: number) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.floor(visibleCount / 2);
    
    return {
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const endIndex = Math.min(items.length - 1, startIndex + visibleCount + buffer * 2);
        
        return {
          startIndex,
          endIndex,
          items: items.slice(startIndex, endIndex + 1),
          totalHeight: items.length * itemHeight,
          offsetY: startIndex * itemHeight,
        };
      },
    };
  },

  // Bundle size optimization
  loadChunkOnDemand: async (chunkName: string) => {
    try {
      const module = await import(/* webpackChunkName: "[request]" */ `../chunks/${chunkName}`);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load chunk: ${chunkName}`, error);
      return null;
    }
  },
};

// Network and connectivity utilities
export const networkUtils = {
  // Check network status
  getNetworkStatus: () => {
    if (typeof navigator === 'undefined') return null;
    
    const connection = (navigator as any).connection;
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // Round-trip time in ms
      saveData: connection.saveData, // Data saver mode
    };
  },

  // Adapt content based on network speed
  adaptToNetworkSpeed: () => {
    const network = networkUtils.getNetworkStatus();
    if (!network) return 'high';
    
    if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
      return 'low';
    } else if (network.effectiveType === '3g') {
      return 'medium';
    } else {
      return 'high';
    }
  },

  // Offline data management
  storeOfflineData: (key: string, data: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  },

  getOfflineData: (key: string, maxAge: number = 24 * 60 * 60 * 1000) => {
    try {
      const item = localStorage.getItem(`offline_${key}`);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  },
};

// Accessibility utilities for mobile
export const a11yUtils = {
  // Announce to screen readers
  announce: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus management for mobile
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
};

// Viewport and safe area utilities
export const viewportUtils = {
  // Get safe area insets
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
      right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
    };
  },

  // Handle dynamic viewport height (mobile browsers)
  setDynamicViewportHeight: () => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateVH();
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);
    
    return () => {
      window.removeEventListener('resize', updateVH);
      window.removeEventListener('orientationchange', updateVH);
    };
  },

  // Detect keyboard visibility on mobile
  detectVirtualKeyboard: (callback: (isVisible: boolean) => void) => {
    if (!deviceUtils.isMobile()) return;
    
    const initialHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      const isKeyboardVisible = heightDifference > 150; // Threshold for keyboard
      
      callback(isKeyboardVisible);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },
};

// Export all utilities
export const mobileUtils = {
  device: deviceUtils,
  touch: touchUtils,
  performance: performanceUtils,
  network: networkUtils,
  a11y: a11yUtils,
  viewport: viewportUtils,
};