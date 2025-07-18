/**
 * Advanced Ad Optimization Framework for Math Help
 * Phase 5: Premium Ad Integration
 * 
 * This script handles:
 * - Viewability optimization
 * - A/B testing framework  
 * - Revenue per visitor tracking
 * - Ad performance monitoring
 * - Premium network integration preparation
 */

class AdOptimizer {
    constructor() {
        this.config = {
            // Ezoic configuration
            ezoicEnabled: false,
            ezoicPublisherId: null,
            
            // A/B testing variants
            adVariants: {
                'header-ad': ['leaderboard', 'banner', 'responsive'],
                'content-ad': ['square', 'rectangle', 'native'],
                'sidebar-ad': ['skyscraper', 'rectangle', 'sticky'],
                'footer-ad': ['leaderboard', 'responsive', 'matched-content']
            },
            
            // Viewability thresholds
            viewabilityThreshold: 0.5, // 50% visible
            viewabilityDuration: 1000,  // 1 second
            
            // Revenue tracking
            revenueTracking: {
                enabled: true,
                currency: 'USD',
                adNetworks: ['adsense', 'ezoic', 'amazon']
            },
            
            // Performance thresholds
            performance: {
                maxCLS: 0.1,        // Cumulative Layout Shift
                maxLCP: 2500,       // Largest Contentful Paint (ms)
                maxFID: 100,        // First Input Delay (ms)
                maxAdLoadTime: 3000 // Ad load timeout (ms)
            }
        };
        
        this.metrics = {
            pageViews: 0,
            adViews: 0,
            adClicks: 0,
            revenue: 0,
            ctr: 0,
            rpm: 0,
            viewabilityRate: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeTracking();
        this.optimizeAdPlacements();
        this.startPerformanceMonitoring();
        
        // Check if Ezoic should be enabled based on traffic
        this.checkEzoicEligibility();
    }
    
    setupEventListeners() {
        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAdTracking();
            } else {
                this.resumeAdTracking();
            }
        });
        
        // Scroll tracking for viewability
        window.addEventListener('scroll', this.throttle(() => {
            this.checkAdViewability();
        }, 100));
        
        // Performance monitoring
        window.addEventListener('load', () => {
            this.measureCoreWebVitals();
        });
    }
    
    initializeTracking() {
        // Initialize Google Analytics 4 enhanced tracking
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-ERGV6WWC21', {
                custom_map: {
                    'custom_parameter_1': 'ad_network',
                    'custom_parameter_2': 'ad_position',
                    'custom_parameter_3': 'ad_size'
                }
            });
        }
        
        // Track page view
        this.trackPageView();
    }
    
    optimizeAdPlacements() {
        const adContainers = document.querySelectorAll('.ad-container');
        
        adContainers.forEach((container, index) => {
            this.optimizeAdContainer(container, index);
        });
    }
    
    optimizeAdContainer(container, index) {
        // Add intersection observer for viewability tracking
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.onAdVisible(entry.target);
                } else {
                    this.onAdHidden(entry.target);
                }
            });
        }, {
            threshold: this.config.viewabilityThreshold
        });
        
        observer.observe(container);
        
        // Add lazy loading for better performance
        if (index > 0) { // Don't lazy load first ad
            this.addLazyLoading(container);
        }
        
        // Add A/B testing variant
        this.applyAdVariant(container);
    }
    
    onAdVisible(adElement) {
        const adId = adElement.id || `ad-${Date.now()}`;
        
        // Start viewability timer
        adElement.viewabilityTimer = setTimeout(() => {
            this.trackAdViewability(adId, true);
        }, this.config.viewabilityDuration);
        
        // Track ad impression
        this.trackAdImpression(adId);
    }
    
    onAdHidden(adElement) {
        // Clear viewability timer
        if (adElement.viewabilityTimer) {
            clearTimeout(adElement.viewabilityTimer);
            adElement.viewabilityTimer = null;
        }
    }
    
    addLazyLoading(container) {
        const adElements = container.querySelectorAll('.adsbygoogle');
        
        adElements.forEach(ad => {
            if (!ad.getAttribute('data-lazy-loaded')) {
                ad.setAttribute('data-lazy-loaded', 'true');
                
                // Only load ad when container is near viewport
                const loadObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadAd(ad);
                            loadObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '200px' // Load 200px before visible
                });
                
                loadObserver.observe(container);
            }
        });
    }
    
    loadAd(adElement) {
        try {
            if (window.adsbygoogle) {
                window.adsbygoogle.push({});
            }
        } catch (error) {
            console.error('Error loading ad:', error);
            this.trackAdError(error);
        }
    }
    
    applyAdVariant(container) {
        const position = this.getAdPosition(container);
        const variants = this.config.adVariants[position];
        
        if (variants && variants.length > 1) {
            const variant = this.getABTestVariant(position, variants);
            container.setAttribute('data-variant', variant);
            
            // Apply variant-specific styling
            container.classList.add(`variant-${variant}`);
        }
    }
    
    getAdPosition(container) {
        if (container.classList.contains('ad-top')) return 'header-ad';
        if (container.classList.contains('ad-sidebar')) return 'sidebar-ad';
        if (container.classList.contains('ad-bottom')) return 'footer-ad';
        return 'content-ad';
    }
    
    getABTestVariant(position, variants) {
        // Simple hash-based A/B testing
        const userId = this.getUserId();
        const hash = this.simpleHash(userId + position);
        const variantIndex = hash % variants.length;
        return variants[variantIndex];
    }
    
    getUserId() {
        let userId = localStorage.getItem('mathhelp_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('mathhelp_user_id', userId);
        }
        return userId;
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    trackPageView() {
        this.metrics.pageViews++;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                content_group1: this.getPageCategory()
            });
        }
    }
    
    trackAdImpression(adId) {
        this.metrics.adViews++;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_impression', {
                event_category: 'Advertising',
                event_label: adId,
                custom_parameter_1: 'adsense', // ad_network
                custom_parameter_2: this.getAdPosition(document.getElementById(adId)), // ad_position
                value: 1
            });
        }
    }
    
    trackAdViewability(adId, isViewable) {
        if (isViewable) {
            this.metrics.viewabilityRate = this.calculateViewabilityRate();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ad_viewable', {
                    event_category: 'Advertising',
                    event_label: adId,
                    custom_parameter_1: 'adsense',
                    value: 1
                });
            }
        }
    }
    
    trackAdError(error) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_error', {
                event_category: 'Advertising',
                event_label: error.message,
                value: 1
            });
        }
    }
    
    calculateViewabilityRate() {
        return this.metrics.adViews > 0 ? 
            (this.metrics.adViews / this.metrics.pageViews) * 100 : 0;
    }
    
    measureCoreWebVitals() {
        // Measure Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcp = lastEntry.startTime;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    event_category: 'Performance',
                    event_label: 'LCP',
                    value: Math.round(lcp)
                });
            }
        }).observe({entryTypes: ['largest-contentful-paint']});
        
        // Measure First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const fid = entry.processingStart - entry.startTime;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'Performance',
                        event_label: 'FID',
                        value: Math.round(fid)
                    });
                }
            });
        }).observe({entryTypes: ['first-input']});
        
        // Measure Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    event_category: 'Performance',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000)
                });
            }
        }).observe({entryTypes: ['layout-shift']});
    }
    
    checkEzoicEligibility() {
        // Check if site meets traffic requirements for Ezoic
        const monthlyPageViews = this.estimateMonthlyPageViews();
        
        if (monthlyPageViews > 10000) { // Ezoic typically wants 10k+ monthly pageviews
            this.enableEzoicIntegration();
        }
    }
    
    enableEzoicIntegration() {
        // This would be activated when ready for Ezoic
        console.log('Site ready for Ezoic integration');
        
        // Placeholder for Ezoic script injection
        // The actual Ezoic script would be added here
        /*
        const ezoicScript = document.createElement('script');
        ezoicScript.src = '//www.ezojs.com/ezoic/ezoic.js';
        ezoicScript.async = true;
        document.head.appendChild(ezoicScript);
        */
    }
    
    estimateMonthlyPageViews() {
        // This would integrate with actual analytics data
        // For now, return a placeholder
        return 25000;
    }
    
    getPageCategory() {
        const path = window.location.pathname;
        if (path.includes('/algebra/')) return 'Algebra';
        if (path.includes('/calculus/')) return 'Calculus';
        if (path.includes('/geometry/')) return 'Geometry';
        if (path.includes('/trigonometry/')) return 'Trigonometry';
        if (path.includes('/statistics/')) return 'Statistics';
        if (path.includes('/tools/')) return 'Tools';
        return 'General';
    }
    
    pauseAdTracking() {
        // Pause tracking when page is hidden
        this.trackingPaused = true;
    }
    
    resumeAdTracking() {
        // Resume tracking when page is visible
        this.trackingPaused = false;
    }
    
    checkAdViewability() {
        if (this.trackingPaused) return;
        
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach(container => {
            const rect = container.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !container.dataset.visible) {
                container.dataset.visible = 'true';
                this.onAdVisible(container);
            } else if (!isVisible && container.dataset.visible) {
                container.dataset.visible = 'false';
                this.onAdHidden(container);
            }
        });
    }
    
    throttle(func, limit) {
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
    }
    
    // Public API for revenue tracking
    trackRevenue(amount, network = 'adsense') {
        this.metrics.revenue += amount;
        this.metrics.rpm = this.metrics.pageViews > 0 ? 
            (this.metrics.revenue / this.metrics.pageViews) * 1000 : 0;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_revenue', {
                event_category: 'Advertising',
                event_label: network,
                value: amount,
                currency: this.config.revenueTracking.currency
            });
        }
    }
    
    // Generate performance report
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            performance: {
                viewabilityRate: this.calculateViewabilityRate(),
                rpm: this.metrics.rpm,
                ctr: this.metrics.adClicks > 0 ? 
                    (this.metrics.adClicks / this.metrics.adViews) * 100 : 0
            },
            recommendations: this.getOptimizationRecommendations()
        };
    }
    
    getOptimizationRecommendations() {
        const recommendations = [];
        
        if (this.calculateViewabilityRate() < 50) {
            recommendations.push('Consider improving ad placement for better viewability');
        }
        
        if (this.metrics.ctr < 1) {
            recommendations.push('A/B test different ad formats to improve CTR');
        }
        
        if (this.metrics.rpm < 5) {
            recommendations.push('Consider applying to premium ad networks');
        }
        
        return recommendations;
    }
}

// Initialize ad optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adOptimizer = new AdOptimizer();
    
    // Export to global scope for debugging
    window.generateAdReport = () => {
        console.log(window.adOptimizer.generateReport());
    };
});

// Enhanced ad loading with error handling
(function() {
    const originalPush = window.adsbygoogle.push;
    window.adsbygoogle.push = function() {
        try {
            return originalPush.apply(this, arguments);
        } catch (error) {
            console.error('AdSense error:', error);
            if (window.adOptimizer) {
                window.adOptimizer.trackAdError(error);
            }
            return null;
        }
    };
})();