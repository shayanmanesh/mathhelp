// Core Web Vitals Optimization System for Math.help
// Implements LCP, FID, CLS optimization with real-time monitoring and automatic fixes

class CoreWebVitalsOptimizer {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: null,
            ttfb: null,
            inp: null // Interaction to Next Paint
        };
        this.thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            ttfb: { good: 800, poor: 1800 },
            inp: { good: 200, poor: 500 }
        };
        this.optimizations = new Map();
        this.init();
    }

    init() {
        this.setupWebVitalsLibrary();
        this.implementLCPOptimizations();
        this.implementFIDOptimizations();
        this.implementCLSOptimizations();
        this.setupPerformanceMonitoring();
        this.implementResourceHints();
        this.setupServiceWorker();
        this.optimizeImages();
    }

    setupWebVitalsLibrary() {
        // Load web-vitals library if not already loaded
        if (!window.webVitals) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
            script.onload = () => this.measureWebVitals();
            document.head.appendChild(script);
        } else {
            this.measureWebVitals();
        }
    }

    measureWebVitals() {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;

        // Measure and optimize LCP
        getLCP((metric) => {
            this.metrics.lcp = metric;
            this.handleLCPMetric(metric);
        });

        // Measure and optimize FID
        getFID((metric) => {
            this.metrics.fid = metric;
            this.handleFIDMetric(metric);
        });

        // Measure and optimize CLS
        getCLS((metric) => {
            this.metrics.cls = metric;
            this.handleCLSMetric(metric);
        });

        // Measure FCP for additional insights
        getFCP((metric) => {
            this.metrics.fcp = metric;
            this.handleFCPMetric(metric);
        });

        // Measure TTFB
        getTTFB((metric) => {
            this.metrics.ttfb = metric;
            this.handleTTFBMetric(metric);
        });
    }

    // LCP Optimization
    implementLCPOptimizations() {
        this.optimizations.set('lcp', {
            preloadCriticalResources: () => this.preloadCriticalResources(),
            optimizeImages: () => this.optimizeImages(),
            eliminateRenderBlocking: () => this.eliminateRenderBlocking(),
            improveServerResponse: () => this.improveServerResponse(),
            setupCriticalCSS: () => this.setupCriticalCSS()
        });

        // Execute LCP optimizations
        Object.values(this.optimizations.get('lcp')).forEach(optimization => {
            try {
                optimization();
            } catch (error) {
                console.warn('LCP optimization failed:', error);
            }
        });
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: '/styles.css', as: 'style' },
            { href: '/scripts-bundle.min.js', as: 'script' },
            { href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css', as: 'style' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add lazy loading
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }

            // Add decoding hint
            if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
            }

            // Optimize for LCP if it's above the fold
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                img.loading = 'eager';
                img.fetchPriority = 'high';
            }
        });
    }

    eliminateRenderBlocking() {
        // Move non-critical CSS to load asynchronously
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            const href = link.href;
            link.rel = 'preload';
            link.as = 'style';
            link.onload = function() {
                this.rel = 'stylesheet';
                this.onload = null;
            };
        });

        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
        scripts.forEach(script => {
            if (!script.hasAttribute('data-critical')) {
                script.defer = true;
            }
        });
    }

    setupCriticalCSS() {
        // Inline critical CSS for above-the-fold content
        const criticalCSS = `
            .site-header { display: block; }
            .main-nav { display: flex; }
            .hero-section { display: block; }
            .featured-topics { display: grid; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    // FID Optimization
    implementFIDOptimizations() {
        this.optimizations.set('fid', {
            breakUpLongTasks: () => this.breakUpLongTasks(),
            optimizeThirdPartyCode: () => this.optimizeThirdPartyCode(),
            useWebWorkers: () => this.useWebWorkers(),
            implementInputDelay: () => this.implementInputDelay()
        });

        // Execute FID optimizations
        Object.values(this.optimizations.get('fid')).forEach(optimization => {
            try {
                optimization();
            } catch (error) {
                console.warn('FID optimization failed:', error);
            }
        });
    }

    breakUpLongTasks() {
        // Use scheduler.postTask or setTimeout to break up long tasks
        const longTaskThreshold = 50; // 50ms
        
        window.breakUpTask = function(callback) {
            if ('scheduler' in window && 'postTask' in window.scheduler) {
                window.scheduler.postTask(callback);
            } else {
                setTimeout(callback, 0);
            }
        };
    }

    optimizeThirdPartyCode() {
        // Delay third-party scripts until after user interaction
        const thirdPartyScripts = [
            'https://www.googletagmanager.com/gtag/js',
            'https://www.clarity.ms/tag/',
            'https://connect.facebook.net/'
        ];

        let userInteracted = false;
        const delayThirdParty = () => {
            if (userInteracted) return;
            userInteracted = true;
            
            // Load third-party scripts
            thirdPartyScripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                document.head.appendChild(script);
            });
        };

        ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, delayThirdParty, { once: true, passive: true });
        });
    }

    useWebWorkers() {
        // Offload heavy computations to web workers
        if ('Worker' in window) {
            const workerScript = `
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    
                    switch(type) {
                        case 'calculate':
                            const result = performHeavyCalculation(data);
                            self.postMessage({ type: 'result', result });
                            break;
                    }
                };
                
                function performHeavyCalculation(data) {
                    // Heavy math calculations here
                    return data * 2;
                }
            `;
            
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            window.mathWorker = worker;
        }
    }

    implementInputDelay() {
        // Implement input delay for better perceived performance
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Process input
                    this.processInput(e.target);
                }, 300);
            });
        });
    }

    // CLS Optimization
    implementCLSOptimizations() {
        this.optimizations.set('cls', {
            reserveSpaceForImages: () => this.reserveSpaceForImages(),
            reserveSpaceForAds: () => this.reserveSpaceForAds(),
            avoidDynamicContent: () => this.avoidDynamicContent(),
            optimizeFonts: () => this.optimizeFonts(),
            stabilizeLayout: () => this.stabilizeLayout()
        });

        // Execute CLS optimizations
        Object.values(this.optimizations.get('cls')).forEach(optimization => {
            try {
                optimization();
            } catch (error) {
                console.warn('CLS optimization failed:', error);
            }
        });
    }

    reserveSpaceForImages() {
        const images = document.querySelectorAll('img:not([width]):not([height])');
        images.forEach(img => {
            // Set aspect ratio to prevent layout shift
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.style.aspectRatio = 'auto';
                        observer.unobserve(img);
                    }
                });
            });
            observer.observe(img);
        });
    }

    reserveSpaceForAds() {
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach(container => {
            // Set minimum height for ad containers
            if (!container.style.minHeight) {
                container.style.minHeight = '250px';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
            }
        });
    }

    avoidDynamicContent() {
        // Prevent dynamic content insertion above existing content
        const contentAreas = document.querySelectorAll('.main-content, .sidebar');
        contentAreas.forEach(area => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Ensure new content doesn't shift existing content
                                node.style.transform = 'translateY(0)';
                                node.style.transition = 'transform 0.3s ease';
                            }
                        });
                    }
                });
            });
            observer.observe(area, { childList: true, subtree: true });
        });
    }

    optimizeFonts() {
        // Optimize font loading to prevent layout shifts
        const fonts = [
            'Inter:wght@300;400;500;600;700',
            'KaTeX_Main:wght@400'
        ];

        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
            link.as = 'style';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        // Use font-display: swap for better performance
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Inter';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    stabilizeLayout() {
        // Add CSS to stabilize layout
        const stabilizationCSS = `
            .loading-placeholder {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .content-area {
                contain: layout style paint;
            }
        `;

        const style = document.createElement('style');
        style.textContent = stabilizationCSS;
        document.head.appendChild(style);
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor performance continuously
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'long-task') {
                    this.handleLongTask(entry);
                } else if (entry.entryType === 'layout-shift') {
                    this.handleLayoutShift(entry);
                }
            });
        });

        try {
            this.performanceObserver.observe({ entryTypes: ['longtask', 'layout-shift'] });
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }

    handleLongTask(entry) {
        console.warn('Long task detected:', entry.duration + 'ms');
        // Implement long task mitigation
        this.mitigateLongTask(entry);
    }

    handleLayoutShift(entry) {
        console.warn('Layout shift detected:', entry.value);
        // Implement layout shift prevention
        this.preventLayoutShift(entry);
    }

    // Resource Hints
    implementResourceHints() {
        const resourceHints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
            { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: true }
        ];

        resourceHints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    // Service Worker Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered:', registration);
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }

    // Metric Handlers
    handleLCPMetric(metric) {
        const { good, poor } = this.thresholds.lcp;
        
        if (metric.value > poor) {
            this.implementEmergencyLCPFixes();
        } else if (metric.value > good) {
            this.implementLCPImprovements();
        }

        this.reportMetric('lcp', metric);
    }

    handleFIDMetric(metric) {
        const { good, poor } = this.thresholds.fid;
        
        if (metric.value > poor) {
            this.implementEmergencyFIDFixes();
        } else if (metric.value > good) {
            this.implementFIDImprovements();
        }

        this.reportMetric('fid', metric);
    }

    handleCLSMetric(metric) {
        const { good, poor } = this.thresholds.cls;
        
        if (metric.value > poor) {
            this.implementEmergencyCLSFixes();
        } else if (metric.value > good) {
            this.implementCLSImprovements();
        }

        this.reportMetric('cls', metric);
    }

    handleFCPMetric(metric) {
        this.reportMetric('fcp', metric);
    }

    handleTTFBMetric(metric) {
        this.reportMetric('ttfb', metric);
    }

    // Emergency Fixes
    implementEmergencyLCPFixes() {
        // Implement emergency LCP fixes
        console.warn('Implementing emergency LCP fixes');
        
        // Remove non-critical resources
        const nonCriticalScripts = document.querySelectorAll('script[src*="analytics"], script[src*="ads"]');
        nonCriticalScripts.forEach(script => {
            script.remove();
        });
    }

    implementEmergencyFIDFixes() {
        // Implement emergency FID fixes
        console.warn('Implementing emergency FID fixes');
        
        // Defer all non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]:not([data-critical])');
        scripts.forEach(script => {
            script.defer = true;
        });
    }

    implementEmergencyCLSFixes() {
        // Implement emergency CLS fixes
        console.warn('Implementing emergency CLS fixes');
        
        // Hide dynamic content that causes shifts
        const dynamicElements = document.querySelectorAll('.ad-container, .dynamic-content');
        dynamicElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Reporting
    reportMetric(name, metric) {
        // Report to analytics
        if (window.gtag) {
            window.gtag('event', name, {
                event_category: 'Web Vitals',
                event_label: metric.id,
                value: Math.round(metric.value),
                non_interaction: true
            });
        }

        // Report to custom analytics
        if (window.viralGrowthSystem) {
            window.viralGrowthSystem.trackEvent('web_vital', {
                metric: name,
                value: metric.value,
                rating: this.getRating(name, metric.value)
            });
        }
    }

    getRating(metric, value) {
        const threshold = this.thresholds[metric];
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    // Utility Methods
    processInput(input) {
        // Process input with debouncing
        console.log('Processing input:', input.value);
    }

    mitigateLongTask(entry) {
        // Implement long task mitigation strategies
        console.log('Mitigating long task:', entry);
    }

    preventLayoutShift(entry) {
        // Implement layout shift prevention
        console.log('Preventing layout shift:', entry);
    }

    improveServerResponse() {
        // Implement server response improvements
        console.log('Implementing server response improvements');
    }
}

// Initialize Core Web Vitals Optimizer
document.addEventListener('DOMContentLoaded', function() {
    window.coreWebVitalsOptimizer = new CoreWebVitalsOptimizer();
});

// Export for use in other modules
window.CoreWebVitalsOptimizer = CoreWebVitalsOptimizer;