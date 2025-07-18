/**
 * Advanced Analytics & Optimization Framework for Math.help
 * Phase 6: Analytics & Optimization
 * 
 * This script provides comprehensive tracking and optimization including:
 * - Core Web Vitals monitoring
 * - Revenue per visitor tracking
 * - User engagement analysis
 * - Tool usage tracking
 * - Conversion funnel analysis
 * - Performance optimization recommendations
 */

class AdvancedAnalytics {
    constructor() {
        this.config = {
            // Performance thresholds
            webVitals: {
                lcp: { good: 2500, needsImprovement: 4000 },
                fid: { good: 100, needsImprovement: 300 },
                cls: { good: 0.1, needsImprovement: 0.25 },
                fcp: { good: 1800, needsImprovement: 3000 },
                ttfb: { good: 800, needsImprovement: 1800 }
            },
            
            // Revenue tracking
            revenue: {
                sessionValue: 0.058, // Target revenue per session
                conversionGoals: ['calculator_use', 'page_depth_3', 'return_visit'],
                revenueGoals: { daily: 45, weekly: 315, monthly: 1350 }
            },
            
            // Engagement thresholds
            engagement: {
                minSessionTime: 30, // seconds
                qualitySessionTime: 120, // 2 minutes
                excellentSessionTime: 300, // 5 minutes
                bounceThreshold: 15, // seconds
                toolEngagementGoal: 0.35 // 35% tool usage rate
            },
            
            // Conversion funnel stages
            funnelStages: [
                'page_view',
                'content_engagement', // 30+ seconds
                'tool_interaction',
                'problem_solution', // completed calculation
                'return_visit'
            ]
        };
        
        this.metrics = {
            performance: {},
            revenue: { total: 0, sessions: 0, perVisitor: 0 },
            engagement: {},
            conversions: {},
            tools: {},
            funnel: {}
        };
        
        this.init();
    }
    
    init() {
        this.setupWebVitalsTracking();
        this.setupEngagementTracking();
        this.setupToolUsageTracking();
        this.setupRevenueTracking();
        this.setupConversionFunnels();
        this.setupPerformanceMonitoring();
        this.startRealtimeAnalytics();
        
        console.log('🚀 Advanced Analytics & Optimization System Initialized');
    }
    
    // ===== CORE WEB VITALS TRACKING =====
    
    setupWebVitalsTracking() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcp = lastEntry.startTime;
            
            this.metrics.performance.lcp = lcp;
            this.trackWebVital('LCP', lcp, this.config.webVitals.lcp);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    event_category: 'Performance',
                    event_label: 'LCP',
                    value: Math.round(lcp),
                    custom_parameters: {
                        performance_rating: this.getRating(lcp, this.config.webVitals.lcp)
                    }
                });
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const fid = entry.processingStart - entry.startTime;
                
                this.metrics.performance.fid = fid;
                this.trackWebVital('FID', fid, this.config.webVitals.fid);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'Performance',
                        event_label: 'FID',
                        value: Math.round(fid),
                        custom_parameters: {
                            performance_rating: this.getRating(fid, this.config.webVitals.fid)
                        }
                    });
                }
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            this.metrics.performance.cls = clsValue;
            this.trackWebVital('CLS', clsValue, this.config.webVitals.cls);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    event_category: 'Performance',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000),
                    custom_parameters: {
                        performance_rating: this.getRating(clsValue, this.config.webVitals.cls)
                    }
                });
            }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Contentful Paint (FCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const fcp = entry.startTime;
                
                this.metrics.performance.fcp = fcp;
                this.trackWebVital('FCP', fcp, this.config.webVitals.fcp);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'Performance',
                        event_label: 'FCP',
                        value: Math.round(fcp)
                    });
                }
            });
        }).observe({ entryTypes: ['paint'] });
        
        // Time to First Byte (TTFB)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const ttfb = entry.responseStart - entry.requestStart;
                
                this.metrics.performance.ttfb = ttfb;
                this.trackWebVital('TTFB', ttfb, this.config.webVitals.ttfb);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'Performance',
                        event_label: 'TTFB',
                        value: Math.round(ttfb)
                    });
                }
            });
        }).observe({ entryTypes: ['navigation'] });
    }
    
    trackWebVital(metric, value, thresholds) {
        const rating = this.getRating(value, thresholds);
        
        // Store in local metrics
        this.metrics.performance[metric.toLowerCase()] = {
            value: value,
            rating: rating,
            timestamp: Date.now()
        };
        
        // Send to performance monitoring
        this.sendPerformanceData(metric, value, rating);
    }
    
    getRating(value, thresholds) {
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }
    
    // ===== USER ENGAGEMENT TRACKING =====
    
    setupEngagementTracking() {
        this.sessionStart = Date.now();
        this.scrollDepth = 0;
        this.interactionCount = 0;
        this.timeOnPage = 0;
        
        // Scroll depth tracking
        let maxScroll = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.scrollDepth = scrollPercent;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    this.trackEngagementMilestone('scroll_depth', scrollPercent);
                }
            }
        }, 250));
        
        // Click and interaction tracking
        document.addEventListener('click', (e) => {
            this.interactionCount++;
            this.trackInteraction(e.target);
        });
        
        // Time on page tracking
        setInterval(() => {
            if (!document.hidden) {
                this.timeOnPage = Date.now() - this.sessionStart;
                this.updateEngagementMetrics();
            }
        }, 5000); // Update every 5 seconds
        
        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEngagementSession();
            }
        });
        
        // Beforeunload tracking
        window.addEventListener('beforeunload', () => {
            this.trackEngagementSession();
        });
    }
    
    trackEngagementMilestone(type, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'engagement_milestone', {
                event_category: 'Engagement',
                event_label: type,
                value: value,
                custom_parameters: {
                    session_duration: Math.round(this.timeOnPage / 1000),
                    interaction_count: this.interactionCount
                }
            });
        }
    }
    
    trackInteraction(element) {
        const elementType = element.tagName.toLowerCase();
        const elementClass = element.className;
        const elementId = element.id;
        
        // Track specific high-value interactions
        if (elementClass.includes('calculator') || elementClass.includes('solver')) {
            this.trackToolInteraction(element);
        }
        
        if (elementType === 'a' && element.href) {
            this.trackLinkClick(element);
        }
        
        if (elementType === 'button') {
            this.trackButtonClick(element);
        }
    }
    
    updateEngagementMetrics() {
        const sessionSeconds = Math.round(this.timeOnPage / 1000);
        
        this.metrics.engagement = {
            sessionDuration: sessionSeconds,
            scrollDepth: this.scrollDepth,
            interactionCount: this.interactionCount,
            engagementScore: this.calculateEngagementScore(),
            qualitySession: sessionSeconds >= this.config.engagement.qualitySessionTime
        };
    }
    
    calculateEngagementScore() {
        const sessionSeconds = Math.round(this.timeOnPage / 1000);
        let score = 0;
        
        // Time-based scoring (40% of score)
        if (sessionSeconds >= this.config.engagement.excellentSessionTime) score += 40;
        else if (sessionSeconds >= this.config.engagement.qualitySessionTime) score += 25;
        else if (sessionSeconds >= this.config.engagement.minSessionTime) score += 10;
        
        // Scroll depth scoring (30% of score)
        if (this.scrollDepth >= 90) score += 30;
        else if (this.scrollDepth >= 75) score += 20;
        else if (this.scrollDepth >= 50) score += 15;
        else if (this.scrollDepth >= 25) score += 10;
        
        // Interaction scoring (30% of score)
        if (this.interactionCount >= 10) score += 30;
        else if (this.interactionCount >= 5) score += 20;
        else if (this.interactionCount >= 3) score += 15;
        else if (this.interactionCount >= 1) score += 10;
        
        return Math.min(score, 100);
    }
    
    trackEngagementSession() {
        const sessionData = {
            duration: Math.round(this.timeOnPage / 1000),
            scrollDepth: this.scrollDepth,
            interactions: this.interactionCount,
            engagementScore: this.calculateEngagementScore(),
            pageCategory: this.getPageCategory(),
            isBounce: this.timeOnPage < (this.config.engagement.bounceThreshold * 1000)
        };
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'session_engagement', {
                event_category: 'Engagement',
                event_label: sessionData.pageCategory,
                value: sessionData.engagementScore,
                custom_parameters: sessionData
            });
        }
        
        this.metrics.engagement.sessionData = sessionData;
    }
    
    // ===== TOOL USAGE TRACKING =====
    
    setupToolUsageTracking() {
        this.toolUsage = {
            calculatorsUsed: [],
            solversUsed: [],
            totalUsage: 0,
            successfulSolutions: 0
        };
        
        // Track calculator interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.calculator button, .solver button, [onclick*="solve"], [onclick*="calculate"]')) {
                this.trackCalculatorUsage(e.target);
            }
        });
        
        // Track form submissions (equation solvers)
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form.calculator, form.solver')) {
                this.trackSolverSubmission(e.target);
            }
        });
        
        // Track input focus (engagement with tools)
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input[type="text"], input[type="number"], textarea')) {
                this.trackInputEngagement(e.target);
            }
        }, true);
    }
    
    trackCalculatorUsage(element) {
        const calculatorType = this.identifyCalculatorType(element);
        
        this.toolUsage.calculatorsUsed.push({
            type: calculatorType,
            timestamp: Date.now(),
            element: element.className
        });
        
        this.toolUsage.totalUsage++;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_use', {
                event_category: 'Tools',
                event_label: calculatorType,
                value: 1,
                custom_parameters: {
                    page_category: this.getPageCategory(),
                    user_session_tools: this.toolUsage.totalUsage
                }
            });
        }
        
        // Track conversion milestone
        this.trackConversionMilestone('tool_interaction');
    }
    
    trackSolverSubmission(form) {
        const solverType = this.identifySolverType(form);
        
        this.toolUsage.solversUsed.push({
            type: solverType,
            timestamp: Date.now(),
            hasInput: this.hasValidInput(form)
        });
        
        if (this.hasValidInput(form)) {
            this.toolUsage.successfulSolutions++;
            this.trackConversionMilestone('problem_solution');
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'solver_use', {
                event_category: 'Tools',
                event_label: solverType,
                value: this.hasValidInput(form) ? 10 : 1,
                custom_parameters: {
                    successful_solution: this.hasValidInput(form),
                    total_solutions: this.toolUsage.successfulSolutions
                }
            });
        }
    }
    
    trackInputEngagement(input) {
        const toolContext = this.getToolContext(input);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_engagement', {
                event_category: 'Tools',
                event_label: toolContext,
                value: 1
            });
        }
    }
    
    identifyCalculatorType(element) {
        const classes = element.className.toLowerCase();
        const parent = element.closest('[class*="calculator"], [class*="solver"]');
        
        if (parent) {
            const parentClass = parent.className.toLowerCase();
            if (parentClass.includes('quadratic')) return 'quadratic_solver';
            if (parentClass.includes('linear')) return 'linear_solver';
            if (parentClass.includes('derivative')) return 'derivative_calculator';
            if (parentClass.includes('integral')) return 'integral_calculator';
            if (parentClass.includes('factoring')) return 'factoring_calculator';
        }
        
        return 'basic_calculator';
    }
    
    identifySolverType(form) {
        const action = form.action || '';
        const classes = form.className.toLowerCase();
        
        if (classes.includes('quadratic') || action.includes('quadratic')) return 'quadratic_solver';
        if (classes.includes('linear') || action.includes('linear')) return 'linear_solver';
        if (classes.includes('derivative') || action.includes('derivative')) return 'derivative_solver';
        
        return 'general_solver';
    }
    
    hasValidInput(form) {
        const inputs = form.querySelectorAll('input[type="text"], input[type="number"], textarea');
        return Array.from(inputs).some(input => input.value.trim().length > 0);
    }
    
    getToolContext(input) {
        const form = input.closest('form');
        const calculator = input.closest('[class*="calculator"]');
        
        if (form) return this.identifySolverType(form);
        if (calculator) return this.identifyCalculatorType(calculator);
        
        return 'general_input';
    }
    
    // ===== REVENUE TRACKING =====
    
    setupRevenueTracking() {
        this.revenueTracking = {
            sessionValue: 0,
            estimatedValue: 0,
            conversionEvents: 0,
            qualityScore: 0
        };
        
        // Calculate estimated session value based on engagement
        setInterval(() => {
            this.updateRevenueEstimates();
        }, 10000); // Update every 10 seconds
    }
    
    updateRevenueEstimates() {
        const engagementScore = this.calculateEngagementScore();
        const sessionSeconds = Math.round(this.timeOnPage / 1000);
        const toolUsageBonus = this.toolUsage.totalUsage > 0 ? 1.5 : 1.0;
        
        // Base value calculation
        let sessionValue = this.config.revenue.sessionValue;
        
        // Engagement multiplier
        if (engagementScore >= 80) sessionValue *= 2.0;
        else if (engagementScore >= 60) sessionValue *= 1.5;
        else if (engagementScore >= 40) sessionValue *= 1.2;
        
        // Time multiplier
        if (sessionSeconds >= this.config.engagement.excellentSessionTime) sessionValue *= 1.8;
        else if (sessionSeconds >= this.config.engagement.qualitySessionTime) sessionValue *= 1.4;
        
        // Tool usage multiplier
        sessionValue *= toolUsageBonus;
        
        this.revenueTracking.estimatedValue = sessionValue;
        this.metrics.revenue.perVisitor = sessionValue;
        
        // Track high-value sessions
        if (sessionValue > (this.config.revenue.sessionValue * 2)) {
            this.trackHighValueSession(sessionValue);
        }
    }
    
    trackHighValueSession(value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'high_value_session', {
                event_category: 'Revenue',
                event_label: 'Premium Engagement',
                value: Math.round(value * 100), // Convert to cents
                custom_parameters: {
                    engagement_score: this.calculateEngagementScore(),
                    tool_usage: this.toolUsage.totalUsage,
                    session_duration: Math.round(this.timeOnPage / 1000)
                }
            });
        }
    }
    
    // ===== CONVERSION FUNNEL ANALYSIS =====
    
    setupConversionFunnels() {
        this.conversionData = {
            stage: 0,
            milestones: {},
            funnelPosition: 'page_view'
        };
        
        // Initialize first stage
        this.trackConversionMilestone('page_view');
        
        // Set up automatic progression tracking
        setTimeout(() => {
            if (this.timeOnPage >= 30000) { // 30 seconds
                this.trackConversionMilestone('content_engagement');
            }
        }, 30000);
    }
    
    trackConversionMilestone(milestone) {
        if (this.conversionData.milestones[milestone]) return; // Already tracked
        
        this.conversionData.milestones[milestone] = {
            timestamp: Date.now(),
            sessionTime: Math.round(this.timeOnPage / 1000)
        };
        
        // Update funnel position
        const stageIndex = this.config.funnelStages.indexOf(milestone);
        if (stageIndex > this.conversionData.stage) {
            this.conversionData.stage = stageIndex;
            this.conversionData.funnelPosition = milestone;
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion_milestone', {
                event_category: 'Funnel',
                event_label: milestone,
                value: stageIndex + 1,
                custom_parameters: {
                    funnel_stage: stageIndex + 1,
                    total_stages: this.config.funnelStages.length,
                    page_category: this.getPageCategory()
                }
            });
        }
        
        // Track funnel completion
        if (milestone === 'return_visit' || this.conversionData.stage >= 3) {
            this.trackFunnelCompletion();
        }
    }
    
    trackFunnelCompletion() {
        const completionRate = (this.conversionData.stage + 1) / this.config.funnelStages.length;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'funnel_completion', {
                event_category: 'Conversion',
                event_label: 'User Journey Complete',
                value: Math.round(completionRate * 100),
                custom_parameters: {
                    stages_completed: this.conversionData.stage + 1,
                    completion_rate: completionRate,
                    total_session_value: this.revenueTracking.estimatedValue
                }
            });
        }
    }
    
    // ===== PERFORMANCE MONITORING =====
    
    setupPerformanceMonitoring() {
        // Monitor resource loading performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.analyzeResourcePerformance();
                this.generateOptimizationRecommendations();
            }, 1000);
        });
        
        // Monitor errors
        window.addEventListener('error', (e) => {
            this.trackError(e);
        });
        
        // Monitor unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e);
        });
    }
    
    analyzeResourcePerformance() {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 2000);
        
        if (slowResources.length > 0) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'slow_resources', {
                    event_category: 'Performance',
                    event_label: 'Resource Loading',
                    value: slowResources.length,
                    custom_parameters: {
                        slowest_resource: slowResources[0].name,
                        slowest_duration: Math.round(slowResources[0].duration)
                    }
                });
            }
        }
    }
    
    generateOptimizationRecommendations() {
        const recommendations = [];
        
        // Performance recommendations
        if (this.metrics.performance.lcp?.value > 2500) {
            recommendations.push('Optimize Largest Contentful Paint - consider image optimization');
        }
        
        if (this.metrics.performance.cls?.value > 0.1) {
            recommendations.push('Reduce Cumulative Layout Shift - reserve space for dynamic content');
        }
        
        if (this.metrics.performance.fid?.value > 100) {
            recommendations.push('Improve First Input Delay - optimize JavaScript execution');
        }
        
        // Engagement recommendations
        const engagementScore = this.calculateEngagementScore();
        if (engagementScore < 40) {
            recommendations.push('Improve content engagement - consider more interactive elements');
        }
        
        // Revenue recommendations
        if (this.toolUsage.totalUsage === 0 && this.timeOnPage > 60000) {
            recommendations.push('Promote calculator usage - user spent time but didn\'t use tools');
        }
        
        this.metrics.recommendations = recommendations;
        return recommendations;
    }
    
    trackError(error) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'javascript_error', {
                event_category: 'Error',
                event_label: error.message || 'Unknown Error',
                value: 1
            });
        }
    }
    
    // ===== REAL-TIME ANALYTICS =====
    
    startRealtimeAnalytics() {
        // Update analytics every 15 seconds
        setInterval(() => {
            this.updateAllMetrics();
            this.sendAnalyticsHeartbeat();
        }, 15000);
    }
    
    updateAllMetrics() {
        this.updateEngagementMetrics();
        this.updateRevenueEstimates();
        
        // Update overall metrics object
        this.metrics.timestamp = Date.now();
        this.metrics.tools = this.toolUsage;
        this.metrics.conversions = this.conversionData;
    }
    
    sendAnalyticsHeartbeat() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'analytics_heartbeat', {
                event_category: 'System',
                event_label: 'Real-time Analytics',
                value: 1,
                custom_parameters: {
                    session_duration: Math.round(this.timeOnPage / 1000),
                    engagement_score: this.calculateEngagementScore(),
                    tools_used: this.toolUsage.totalUsage,
                    estimated_value: Math.round(this.revenueTracking.estimatedValue * 100)
                }
            });
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    getPageCategory() {
        const path = window.location.pathname;
        if (path.includes('/algebra/')) return 'Algebra';
        if (path.includes('/calculus/')) return 'Calculus';
        if (path.includes('/geometry/')) return 'Geometry';
        if (path.includes('/trigonometry/')) return 'Trigonometry';
        if (path.includes('/statistics/')) return 'Statistics';
        if (path.includes('/tools/')) return 'Tools';
        if (path.includes('/faq/')) return 'FAQ';
        if (path.includes('/examples/')) return 'Examples';
        if (path.includes('/formulas/')) return 'Formulas';
        if (path.includes('/glossary/')) return 'Glossary';
        return 'Homepage';
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
    
    sendPerformanceData(metric, value, rating) {
        // This would integrate with external monitoring services
        // For now, just store locally and send to GA
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                event_category: 'Performance',
                event_label: metric,
                value: Math.round(value),
                custom_parameters: {
                    rating: rating,
                    page_category: this.getPageCategory()
                }
            });
        }
    }
    
    // ===== PUBLIC API =====
    
    getMetrics() {
        return {
            ...this.metrics,
            performance: this.metrics.performance,
            engagement: this.metrics.engagement,
            revenue: this.metrics.revenue,
            tools: this.toolUsage,
            conversions: this.conversionData,
            recommendations: this.generateOptimizationRecommendations()
        };
    }
    
    getPerformanceScore() {
        const scores = [];
        
        if (this.metrics.performance.lcp) {
            scores.push(this.metrics.performance.lcp.rating === 'good' ? 100 : 
                       this.metrics.performance.lcp.rating === 'needs-improvement' ? 60 : 30);
        }
        
        if (this.metrics.performance.fid) {
            scores.push(this.metrics.performance.fid.rating === 'good' ? 100 : 
                       this.metrics.performance.fid.rating === 'needs-improvement' ? 60 : 30);
        }
        
        if (this.metrics.performance.cls) {
            scores.push(this.metrics.performance.cls.rating === 'good' ? 100 : 
                       this.metrics.performance.cls.rating === 'needs-improvement' ? 60 : 30);
        }
        
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
    }
    
    exportAnalyticsReport() {
        return {
            timestamp: new Date().toISOString(),
            session: {
                duration: Math.round(this.timeOnPage / 1000),
                pageViews: 1,
                pageCategory: this.getPageCategory()
            },
            performance: this.metrics.performance,
            engagement: {
                score: this.calculateEngagementScore(),
                scrollDepth: this.scrollDepth,
                interactions: this.interactionCount,
                qualitySession: this.timeOnPage >= this.config.engagement.qualitySessionTime * 1000
            },
            tools: {
                totalUsage: this.toolUsage.totalUsage,
                calculatorsUsed: this.toolUsage.calculatorsUsed.length,
                successfulSolutions: this.toolUsage.successfulSolutions
            },
            revenue: {
                estimatedValue: this.revenueTracking.estimatedValue,
                sessionRating: this.revenueTracking.estimatedValue > this.config.revenue.sessionValue ? 'high' : 'normal'
            },
            conversion: {
                funnelStage: this.conversionData.funnelPosition,
                completionRate: (this.conversionData.stage + 1) / this.config.funnelStages.length
            },
            recommendations: this.generateOptimizationRecommendations()
        };
    }
}

// Initialize advanced analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.advancedAnalytics = new AdvancedAnalytics();
    
    // Export functions to global scope for debugging and external access
    window.getAnalyticsMetrics = () => window.advancedAnalytics.getMetrics();
    window.getPerformanceScore = () => window.advancedAnalytics.getPerformanceScore();
    window.exportAnalyticsReport = () => window.advancedAnalytics.exportAnalyticsReport();
    
    // Console logging for development
    console.log('📊 Advanced Analytics System Ready');
    console.log('💡 Use window.getAnalyticsMetrics() to view current metrics');
    console.log('📈 Use window.exportAnalyticsReport() to export full report');
});