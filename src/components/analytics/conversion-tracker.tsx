'use client';

import { useEffect } from 'react';
import { useABTest } from '@/components/providers/ab-test-provider';

// Remove unused interface for now
// interface ConversionEvent {
//   event: string;
//   timestamp: string;
//   userId?: string;
//   sessionId: string;
//   page: string;
//   variant: string;
//   value?: number;
//   properties?: Record<string, unknown>;
// }

export function ConversionTracker() {
  const { currentVariant, trackEvent } = useABTest();

  useEffect(() => {
    // Track page view
    const pageData = {
      page: window.location.pathname,
      variant: currentVariant,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };

    trackEvent('page_view', pageData);

    // Track session start
    if (!sessionStorage.getItem('session_started')) {
      trackEvent('session_start', pageData);
      sessionStorage.setItem('session_started', 'true');
    }

    // Track scroll depth
    const scrollDepthThresholds = [25, 50, 75, 90, 100];
    const trackedScrollDepths = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      scrollDepthThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedScrollDepths.has(threshold)) {
          trackedScrollDepths.add(threshold);
          trackEvent('scroll_depth', {
            depth_percent: threshold,
            variant: currentVariant,
            page: window.location.pathname
          });
        }
      });
    };

    // Track time on page
    const startTime = Date.now();
    const timeThresholds = [10, 30, 60, 120, 300]; // seconds
    const trackedTimeThresholds = new Set<number>();

    const timeTracker = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      timeThresholds.forEach(threshold => {
        if (timeOnPage >= threshold && !trackedTimeThresholds.has(threshold)) {
          trackedTimeThresholds.add(threshold);
          trackEvent('time_on_page', {
            time_seconds: threshold,
            variant: currentVariant,
            page: window.location.pathname
          });
        }
      });
    }, 1000);

    // Track form interactions
    const trackFormInteraction = (formElement: HTMLFormElement) => {
      const formName = formElement.name || formElement.id || 'unknown';
      
      // Track form start (first interaction)
      const inputs = formElement.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (!input.dataset.tracked) {
            input.dataset.tracked = 'true';
            trackEvent('form_start', {
              form_name: formName,
              field_name: (input as HTMLInputElement).name || (input as HTMLInputElement).id,
              variant: currentVariant
            });
          }
        });
      });

      // Track form submission
      formElement.addEventListener('submit', () => {
        trackEvent('form_submit', {
          form_name: formName,
          variant: currentVariant
        });
      });
    };

    // Track button clicks
    const trackButtonClick = (button: HTMLButtonElement | HTMLAnchorElement) => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent?.trim() || '';
        const buttonId = button.id || '';
        const buttonClass = button.className || '';
        
        trackEvent('button_click', {
          button_text: buttonText,
          button_id: buttonId,
          button_class: buttonClass,
          variant: currentVariant,
          page: window.location.pathname
        });
      });
    };

    // Track outbound links
    const trackOutboundLink = (link: HTMLAnchorElement) => {
      const href = link.href;
      const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
      
      if (isExternal) {
        link.addEventListener('click', () => {
          trackEvent('outbound_link_click', {
            url: href,
            link_text: link.textContent?.trim() || '',
            variant: currentVariant
          });
        });
      }
    };

    // Track video interactions
    const trackVideoInteraction = (video: HTMLVideoElement) => {
      const videoSrc = video.src || video.currentSrc || '';
      
      video.addEventListener('play', () => {
        trackEvent('video_play', {
          video_src: videoSrc,
          variant: currentVariant
        });
      });

      video.addEventListener('pause', () => {
        trackEvent('video_pause', {
          video_src: videoSrc,
          current_time: video.currentTime,
          variant: currentVariant
        });
      });

      video.addEventListener('ended', () => {
        trackEvent('video_complete', {
          video_src: videoSrc,
          duration: video.duration,
          variant: currentVariant
        });
      });
    };

    // Track file downloads
    const trackDownload = (link: HTMLAnchorElement) => {
      const href = link.href;
      const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.mp4', '.mp3'];
      
      if (downloadExtensions.some(ext => href.toLowerCase().includes(ext))) {
        link.addEventListener('click', () => {
          trackEvent('file_download', {
            file_url: href,
            file_name: link.download || href.split('/').pop() || '',
            variant: currentVariant
          });
        });
      }
    };

    // Track error events
    const trackError = (error: ErrorEvent) => {
      trackEvent('javascript_error', {
        error_message: error.message,
        error_filename: error.filename,
        error_line: error.lineno,
        error_column: error.colno,
        variant: currentVariant,
        page: window.location.pathname
      });
    };

    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('error', trackError);

    // Track existing elements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => trackFormInteraction(form as HTMLFormElement));

    const buttons = document.querySelectorAll('button, a[role="button"]');
    buttons.forEach(button => trackButtonClick(button as HTMLButtonElement));

    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      trackOutboundLink(link as HTMLAnchorElement);
      trackDownload(link as HTMLAnchorElement);
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(video => trackVideoInteraction(video as HTMLVideoElement));

    // Track visibility change (tab switching)
    const handleVisibilityChange = () => {
      trackEvent('visibility_change', {
        visibility_state: document.visibilityState,
        variant: currentVariant,
        page: window.location.pathname
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track page unload
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      // Use sendBeacon for reliable delivery
      const unloadData = {
        event: 'page_unload',
        time_on_page: timeOnPage,
        variant: currentVariant,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/beacon', JSON.stringify(unloadData));
      } else {
        trackEvent('page_unload', unloadData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(timeTracker);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('error', trackError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentVariant, trackEvent]);

  // Track rage clicks (multiple rapid clicks)
  useEffect(() => {
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    const handleRageClick = (event: MouseEvent) => {
      clickCount++;
      
      if (clickTimer) {
        clearTimeout(clickTimer);
      }

      clickTimer = setTimeout(() => {
        if (clickCount >= 3) {
          const target = event.target as HTMLElement;
          trackEvent('rage_click', {
            element_tag: target.tagName.toLowerCase(),
            element_id: target.id || '',
            element_class: target.className || '',
            click_count: clickCount,
            variant: currentVariant,
            page: window.location.pathname
          });
        }
        clickCount = 0;
      }, 1000);
    };

    document.addEventListener('click', handleRageClick);

    return () => {
      document.removeEventListener('click', handleRageClick);
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [currentVariant, trackEvent]);

  // Track performance metrics
  useEffect(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            trackEvent('performance_metrics', {
              dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              load_complete: navEntry.loadEventEnd - navEntry.loadEventStart,
              first_paint: navEntry.responseEnd - navEntry.requestStart,
              variant: currentVariant,
              page: window.location.pathname
            });
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            trackEvent('core_web_vitals', {
              metric: 'LCP',
              value: entry.startTime,
              variant: currentVariant,
              page: window.location.pathname
            });
          }

          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            trackEvent('core_web_vitals', {
              metric: 'FID',
              value: fidEntry.processingStart - fidEntry.startTime,
              variant: currentVariant,
              page: window.location.pathname
            });
          }
        }
      });

      // Observe performance entries
      try {
        observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        observer.observe({ entryTypes: ['navigation'] });
      }

      return () => observer.disconnect();
    }
  }, [currentVariant, trackEvent]);

  // Track heatmap data (simplified version)
  useEffect(() => {
    const heatmapData: Array<{ x: number; y: number; timestamp: number }> = [];
    
    const recordMousePosition = (event: MouseEvent) => {
      heatmapData.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      });
    };

    const sendHeatmapData = () => {
      if (heatmapData.length > 0) {
        trackEvent('heatmap_data', {
          positions: heatmapData.slice(-100), // Send last 100 positions
          variant: currentVariant,
          page: window.location.pathname
        });
        heatmapData.length = 0; // Clear array
      }
    };

    // Sample mouse positions every 5 seconds
    const mouseMoveHandler = (event: MouseEvent) => {
      if (Math.random() < 0.1) { // 10% sampling rate
        recordMousePosition(event);
      }
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    
    // Send heatmap data every 30 seconds
    const heatmapInterval = setInterval(sendHeatmapData, 30000);

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      clearInterval(heatmapInterval);
      sendHeatmapData(); // Send any remaining data
    };
  }, [currentVariant, trackEvent]);

  // This component doesn't render anything
  return null;
}