// Page Speed Optimization System - Mobile and Desktop Performance
// Implements lazy loading, resource hints, critical CSS, and performance monitoring

class PageSpeedOptimization {
    constructor() {
        this.config = {
            lazyLoadOffset: 50,
            criticalCSS: true,
            preconnectDomains: [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://www.googletagmanager.com',
                'https://pagead2.googlesyndication.com'
            ],
            dnsPrefetchDomains: [
                'https://www.google-analytics.com',
                'https://stats.g.doubleclick.net'
            ]
        };
        
        this.init();
    }

    init() {
        this.addResourceHints();
        this.implementLazyLoading();
        this.optimizeImages();
        this.deferNonCriticalCSS();
        this.optimizeJavaScript();
        this.implementServiceWorker();
        this.monitorPerformance();
    }

    // Add resource hints for faster connections
    addResourceHints() {
        const head = document.head;
        
        // Preconnect to required origins
        this.config.preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            head.appendChild(link);
        });
        
        // DNS prefetch for other domains
        this.config.dnsPrefetchDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            head.appendChild(link);
        });
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/styles.css', as: 'style' },
            { href: '/fonts/math-symbols.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.type) link.type = resource.type;
            if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
            document.head.appendChild(link);
        });
    }

    // Implement lazy loading for images and iframes
    implementLazyLoading() {
        // Check for native lazy loading support
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.loading = 'lazy';
                img.src = img.dataset.src;
                delete img.dataset.src;
            });
            
            document.querySelectorAll('iframe[data-src]').forEach(iframe => {
                iframe.loading = 'lazy';
                iframe.src = iframe.dataset.src;
                delete iframe.dataset.src;
            });
        } else {
            // Fallback to Intersection Observer
            this.setupIntersectionObserver();
        }
    }

    // Setup Intersection Observer for lazy loading
    setupIntersectionObserver() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                        element.classList.add('loaded');
                    } else if (element.tagName === 'IFRAME') {
                        element.src = element.dataset.src;
                    }
                    
                    if (element.dataset.srcset) {
                        element.srcset = element.dataset.srcset;
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: `${this.config.lazyLoadOffset}px`
        });
        
        // Observe all lazy elements
        document.querySelectorAll('img[data-src], iframe[data-src]').forEach(element => {
            imageObserver.observe(element);
        });
    }

    // Optimize images
    optimizeImages() {
        // Add loading="lazy" to all images below the fold
        const images = document.querySelectorAll('img:not([loading])');
        const windowHeight = window.innerHeight;
        
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top > windowHeight) {
                img.loading = 'lazy';
            }
            
            // Add width and height to prevent layout shift
            if (!img.width && img.naturalWidth) {
                img.width = img.naturalWidth;
            }
            if (!img.height && img.naturalHeight) {
                img.height = img.naturalHeight;
            }
        });
        
        // Convert images to WebP format with fallback
        this.implementWebPWithFallback();
    }

    // Implement WebP with fallback
    implementWebPWithFallback() {
        const supportsWebP = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
        };
        
        if (supportsWebP()) {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
        }
    }

    // Defer non-critical CSS
    deferNonCriticalCSS() {
        // Extract critical CSS (above-the-fold styles)
        const criticalCSS = `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .site-header { background: #3498db; color: white; padding: 1rem; }
            .main-nav { background: #2c3e50; }
            .hero { padding: 2rem; text-align: center; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            
            /* Prevent layout shift */
            img { max-width: 100%; height: auto; }
            .ad-container { min-height: 280px; }
        `;
        
        // Inject critical CSS inline
        const criticalStyle = document.createElement('style');
        criticalStyle.id = 'critical-css';
        criticalStyle.textContent = criticalCSS;
        document.head.appendChild(criticalStyle);
        
        // Load non-critical CSS asynchronously
        const nonCriticalStyles = [
            'enhanced-styles.css',
            'tooltip-styles.css',
            'animations.css'
        ];
        
        nonCriticalStyles.forEach(stylesheet => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = stylesheet;
            link.onload = function() {
                this.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    // Optimize JavaScript loading
    optimizeJavaScript() {
        // Defer non-critical scripts
        document.querySelectorAll('script:not([async]):not([defer])').forEach(script => {
            if (!script.src.includes('critical') && !script.src.includes('adsbygoogle')) {
                script.defer = true;
            }
        });
        
        // Implement script loading priorities
        this.implementScriptLoadingStrategy();
    }

    // Implement intelligent script loading
    implementScriptLoadingStrategy() {
        const scriptLoader = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };
        
        // Categorize scripts
        document.querySelectorAll('script[data-priority]').forEach(script => {
            const priority = script.dataset.priority;
            if (scriptLoader[priority]) {
                scriptLoader[priority].push(script.src);
                script.remove(); // Remove from DOM to reload with strategy
            }
        });
        
        // Load scripts based on priority
        const loadScripts = (urls, callback) => {
            let loaded = 0;
            urls.forEach(url => {
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = () => {
                    loaded++;
                    if (loaded === urls.length && callback) {
                        callback();
                    }
                };
                document.body.appendChild(script);
            });
        };
        
        // Execute loading strategy
        loadScripts(scriptLoader.critical, () => {
            loadScripts(scriptLoader.high, () => {
                requestIdleCallback(() => {
                    loadScripts(scriptLoader.medium, () => {
                        requestIdleCallback(() => {
                            loadScripts(scriptLoader.low);
                        });
                    });
                });
            });
        });
    }

    // Implement Service Worker for caching
    implementServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Create service worker file content
            const swContent = `
// Service Worker for Math Help
const CACHE_NAME = 'math-help-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/enhanced-styles.css',
    '/algebra/',
    '/calculus/',
    '/geometry/',
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
    );
});`;
            
            // Register service worker
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered:', registration))
                .catch(err => console.error('SW registration failed:', err));
        }
    }

    // Monitor and report performance metrics
    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.error('LCP Observer error:', e);
            }
            
            // Monitor First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.error('FID Observer error:', e);
            }
            
            // Monitor Cumulative Layout Shift
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    console.log('CLS:', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.error('CLS Observer error:', e);
            }
        }
        
        // Log page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Metrics:', {
                    'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                    'TCP Connection': perfData.connectEnd - perfData.connectStart,
                    'Request/Response': perfData.responseEnd - perfData.requestStart,
                    'DOM Processing': perfData.domComplete - perfData.domLoading,
                    'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
                });
            }, 0);
        });
    }

    // Optimize for Core Web Vitals
    optimizeForCoreWebVitals() {
        // Optimize Largest Contentful Paint (LCP)
        this.optimizeLCP();
        
        // Optimize First Input Delay (FID)
        this.optimizeFID();
        
        // Optimize Cumulative Layout Shift (CLS)
        this.optimizeCLS();
    }

    optimizeLCP() {
        // Preload hero images
        const heroImage = document.querySelector('.hero img, .hero-bg');
        if (heroImage) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImage.src || heroImage.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            document.head.appendChild(link);
        }
        
        // Preload fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.href = '/fonts/main-font.woff2';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);
    }

    optimizeFID() {
        // Break up long tasks
        const breakUpLongTask = (tasks) => {
            if (tasks.length === 0) return;
            
            const task = tasks.shift();
            
            requestIdleCallback((deadline) => {
                while (deadline.timeRemaining() > 0 && tasks.length > 0) {
                    tasks.shift()();
                }
                
                if (tasks.length > 0) {
                    breakUpLongTask(tasks);
                }
            });
            
            task();
        };
        
        // Defer non-critical initialization
        window.addEventListener('load', () => {
            breakUpLongTask([
                () => this.initializeAnalytics(),
                () => this.initializeAds(),
                () => this.initializeTracking()
            ]);
        });
    }

    optimizeCLS() {
        // Set explicit dimensions for all media
        document.querySelectorAll('img, video, iframe').forEach(element => {
            if (!element.getAttribute('width') || !element.getAttribute('height')) {
                const aspectRatio = element.naturalWidth / element.naturalHeight || 16/9;
                element.style.aspectRatio = aspectRatio;
            }
        });
        
        // Reserve space for ads
        document.querySelectorAll('.ad-container').forEach(container => {
            container.style.minHeight = '280px';
        });
        
        // Prevent font loading layout shifts
        document.documentElement.style.fontDisplay = 'optional';
    }

    // Initialize third-party scripts efficiently
    initializeAnalytics() {
        // Load Google Analytics asynchronously
        if (window.gtag) return;
        
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    }

    initializeAds() {
        // AdSense is already loaded, just ensure optimal loading
        if (window.adsbygoogle) {
            (adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0;
        }
    }

    initializeTracking() {
        // Initialize any additional tracking
        console.log('Additional tracking initialized');
    }
}

// Initialize page speed optimization
document.addEventListener('DOMContentLoaded', function() {
    window.pageSpeedOptimization = new PageSpeedOptimization();
});

// Export for use
window.PageSpeedOptimization = PageSpeedOptimization;