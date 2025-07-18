// Header Bidding & Ad Optimization System for Math.help
// Implements yield optimization, privacy-compliant tracking, and ML-driven ad serving

class HeaderBiddingSystem {
    constructor() {
        this.prebidConfig = this.initializePrebidConfig();
        this.adUnits = this.defineAdUnits();
        this.firstPartyData = new FirstPartyDataCollector();
        this.yieldOptimizer = new YieldOptimizer();
        this.privacyManager = new PrivacyManager();
        this.init();
    }

    init() {
        this.setupPrebid();
        this.initializeHeaderBidding();
        this.setupYieldOptimization();
        this.startPerformanceMonitoring();
    }

    initializePrebidConfig() {
        return {
            bidders: [
                {
                    bidderCode: 'appnexus',
                    params: {
                        placementId: 13144370
                    }
                },
                {
                    bidderCode: 'rubicon',
                    params: {
                        accountId: 17282,
                        siteId: 162036,
                        zoneId: 776750
                    }
                },
                {
                    bidderCode: 'ix',
                    params: {
                        siteId: '3723',
                        size: [300, 250]
                    }
                },
                {
                    bidderCode: 'sovrn',
                    params: {
                        tagid: '403370'
                    }
                },
                {
                    bidderCode: 'amazon',
                    params: {
                        slotID: 'div-gpt-ad-1460505748561-0'
                    }
                }
            ],
            timeout: 2000,
            priceGranularity: 'dense',
            userSync: {
                filterSettings: {
                    iframe: {
                        bidders: ['*'],
                        filter: 'include'
                    }
                },
                syncDelay: 6000
            },
            targetingControls: {
                deleteUnusedBids: true,
                includeWinners: true,
                includeBidderKeys: false
            }
        };
    }

    defineAdUnits() {
        return [
            {
                code: 'div-gpt-ad-1460505748561-0',
                mediaTypes: {
                    banner: {
                        sizes: [[300, 250], [320, 250]]
                    }
                },
                bids: this.prebidConfig.bidders
            },
            {
                code: 'div-gpt-ad-rewarded-video',
                mediaTypes: {
                    video: {
                        context: 'adpod',
                        playerSize: [640, 480],
                        adPodDurationSec: 30,
                        durationRangeSec: [15, 30],
                        requireExactDuration: false
                    }
                },
                bids: this.prebidConfig.bidders.filter(bidder => 
                    ['appnexus', 'rubicon', 'ix'].includes(bidder.bidderCode)
                )
            },
            {
                code: 'div-gpt-ad-native',
                mediaTypes: {
                    native: {
                        title: {
                            required: true,
                            len: 80
                        },
                        body: {
                            required: true,
                            len: 200
                        },
                        image: {
                            required: true,
                            sizes: [150, 50]
                        },
                        sponsoredBy: {
                            required: true
                        }
                    }
                },
                bids: this.prebidConfig.bidders
            }
        ];
    }

    setupPrebid() {
        // Initialize Prebid.js
        const pbjs = window.pbjs || {};
        pbjs.que = pbjs.que || [];

        pbjs.que.push(() => {
            pbjs.addAdUnits(this.adUnits);
            pbjs.setConfig(this.prebidConfig);
            
            // Set first-party data
            pbjs.setConfig({
                ortb2: {
                    user: {
                        data: this.firstPartyData.getUserData()
                    },
                    site: {
                        data: this.firstPartyData.getSiteData()
                    }
                }
            });
        });

        window.pbjs = pbjs;
    }

    initializeHeaderBidding() {
        const pbjs = window.pbjs;
        
        pbjs.que.push(() => {
            pbjs.requestBids({
                timeout: 2000,
                bidsBackHandler: (bids) => {
                    this.handleBidsBack(bids);
                }
            });
        });
    }

    handleBidsBack(bids) {
        // Process winning bids
        const winningBids = this.selectWinningBids(bids);
        
        // Send to ad server
        this.sendToAdServer(winningBids);
        
        // Track performance
        this.trackBidPerformance(bids, winningBids);
    }

    selectWinningBids(bids) {
        const winningBids = {};
        
        Object.keys(bids).forEach(adUnitCode => {
            const adUnitBids = bids[adUnitCode];
            if (adUnitBids && adUnitBids.length > 0) {
                // Sort by CPM descending
                adUnitBids.sort((a, b) => b.cpm - a.cpm);
                winningBids[adUnitCode] = adUnitBids[0];
            }
        });
        
        return winningBids;
    }

    sendToAdServer(winningBids) {
        // Integration with Google Ad Manager or other ad server
        if (window.googletag) {
            window.googletag.cmd.push(() => {
                Object.keys(winningBids).forEach(adUnitCode => {
                    const bid = winningBids[adUnitCode];
                    const slot = window.googletag.defineSlot(
                        `/22639388115/${adUnitCode}`,
                        bid.size,
                        adUnitCode
                    );
                    
                    if (slot) {
                        slot.setTargeting('hb_pb', bid.cpm.toString());
                        slot.setTargeting('hb_bidder', bid.bidderCode);
                        slot.setTargeting('hb_adid', bid.adId);
                    }
                });
                
                window.googletag.pubads().refresh();
            });
        }
    }

    trackBidPerformance(allBids, winningBids) {
        const performance = {
            timestamp: Date.now(),
            totalBids: Object.keys(allBids).length,
            winningBids: Object.keys(winningBids).length,
            averageCPM: this.calculateAverageCPM(winningBids),
            bidderPerformance: this.analyzeBidderPerformance(allBids),
            timeout: this.prebidConfig.timeout
        };
        
        this.yieldOptimizer.recordPerformance(performance);
    }

    calculateAverageCPM(winningBids) {
        const bids = Object.values(winningBids);
        if (bids.length === 0) return 0;
        
        const totalCPM = bids.reduce((sum, bid) => sum + bid.cpm, 0);
        return totalCPM / bids.length;
    }

    analyzeBidderPerformance(allBids) {
        const bidderStats = {};
        
        Object.values(allBids).forEach(adUnitBids => {
            adUnitBids.forEach(bid => {
                if (!bidderStats[bid.bidderCode]) {
                    bidderStats[bid.bidderCode] = {
                        totalBids: 0,
                        totalCPM: 0,
                        wins: 0,
                        timeouts: 0
                    };
                }
                
                bidderStats[bid.bidderCode].totalBids++;
                bidderStats[bid.bidderCode].totalCPM += bid.cpm;
                
                if (bid.timeToRespond > this.prebidConfig.timeout) {
                    bidderStats[bid.bidderCode].timeouts++;
                }
            });
        });
        
        return bidderStats;
    }

    setupYieldOptimization() {
        setInterval(() => {
            this.yieldOptimizer.optimize();
        }, 300000); // Optimize every 5 minutes
    }

    startPerformanceMonitoring() {
        this.performanceMonitor = new PerformanceMonitor();
        this.performanceMonitor.start();
    }
}

class FirstPartyDataCollector {
    constructor() {
        this.dataPoints = this.initializeDataPoints();
        this.consentManager = new ConsentManager();
    }

    initializeDataPoints() {
        return {
            onboarding: [
                'grade_level',
                'favorite_math_topics',
                'learning_goals',
                'preferred_difficulty',
                'study_schedule'
            ],
            behavioral: [
                'problems_solved_per_topic',
                'average_time_per_problem',
                'hint_usage_rate',
                'visualization_interaction_time',
                'session_frequency',
                'preferred_time_of_day'
            ],
            contextual: [
                'device_type',
                'screen_size',
                'connection_speed',
                'time_zone',
                'language_preference'
            ]
        };
    }

    getUserData() {
        if (!this.consentManager.hasConsent()) {
            return this.getAnonymousUserData();
        }

        return {
            grade_level: this.getGradeLevel(),
            favorite_topics: this.getFavoriteTopics(),
            learning_goals: this.getLearningGoals(),
            difficulty_preference: this.getDifficultyPreference(),
            study_schedule: this.getStudySchedule(),
            engagement_score: this.calculateEngagementScore(),
            session_frequency: this.getSessionFrequency(),
            device_type: this.getDeviceType(),
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getSiteData() {
        return {
            topic_category: this.getCurrentTopicCategory(),
            page_type: this.getPageType(),
            difficulty_level: this.getCurrentDifficultyLevel(),
            content_type: this.getContentType(),
            session_depth: this.getSessionDepth(),
            time_on_site: this.getTimeOnSite()
        };
    }

    getAnonymousUserData() {
        return {
            device_type: this.getDeviceType(),
            screen_size: this.getScreenSize(),
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            connection_type: this.getConnectionType()
        };
    }

    // Implementation methods
    getGradeLevel() {
        return localStorage.getItem('grade_level') || 'unknown';
    }

    getFavoriteTopics() {
        return JSON.parse(localStorage.getItem('favorite_topics') || '[]');
    }

    getLearningGoals() {
        return JSON.parse(localStorage.getItem('learning_goals') || '[]');
    }

    getDifficultyPreference() {
        return localStorage.getItem('difficulty_preference') || 'intermediate';
    }

    getStudySchedule() {
        return JSON.parse(localStorage.getItem('study_schedule') || '{}');
    }

    calculateEngagementScore() {
        const problemsSolved = this.getProblemsSolvedToday();
        const timeSpent = this.getTimeSpentToday();
        const hintUsage = this.getHintUsageRate();
        
        return (problemsSolved * 2) + (timeSpent / 1000 / 60) + (hintUsage * 5);
    }

    getSessionFrequency() {
        const sessions = JSON.parse(localStorage.getItem('session_dates') || '[]');
        const lastWeek = sessions.filter(date => 
            Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000
        );
        return lastWeek.length;
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }

    getScreenSize() {
        return {
            width: window.screen.width,
            height: window.screen.height
        };
    }

    getConnectionType() {
        return navigator.connection ? navigator.connection.effectiveType : 'unknown';
    }

    getCurrentTopicCategory() {
        const path = window.location.pathname;
        if (path.includes('algebra')) return 'algebra';
        if (path.includes('calculus')) return 'calculus';
        if (path.includes('geometry')) return 'geometry';
        if (path.includes('statistics')) return 'statistics';
        return 'general';
    }

    getPageType() {
        const path = window.location.pathname;
        if (path.includes('solve')) return 'problem_solving';
        if (path.includes('practice')) return 'practice';
        if (path.includes('tools')) return 'calculator';
        return 'learning';
    }

    getCurrentDifficultyLevel() {
        const difficulty = document.body.getAttribute('data-difficulty');
        return difficulty || 'intermediate';
    }

    getContentType() {
        const type = document.body.getAttribute('data-content-type');
        return type || 'interactive';
    }

    getSessionDepth() {
        return parseInt(sessionStorage.getItem('session_depth') || '0');
    }

    getTimeOnSite() {
        const startTime = sessionStorage.getItem('session_start_time');
        if (startTime) {
            return Date.now() - parseInt(startTime);
        }
        return 0;
    }

    getProblemsSolvedToday() {
        const today = new Date().toDateString();
        const problems = JSON.parse(localStorage.getItem('dailyProblems') || '{}');
        return problems[today] || 0;
    }

    getTimeSpentToday() {
        const today = new Date().toDateString();
        const timeSpent = JSON.parse(localStorage.getItem('dailyTimeSpent') || '{}');
        return timeSpent[today] || 0;
    }

    getHintUsageRate() {
        const hintsUsed = parseInt(localStorage.getItem('hints_used') || '0');
        const problemsSolved = parseInt(localStorage.getItem('total_problems_solved') || '1');
        return hintsUsed / problemsSolved;
    }
}

class YieldOptimizer {
    constructor() {
        this.performanceHistory = [];
        this.optimizationRules = this.initializeOptimizationRules();
        this.mlModel = new MLYieldModel();
    }

    initializeOptimizationRules() {
        return {
            timeout: {
                min: 1000,
                max: 3000,
                optimal: 2000,
                adjustmentFactor: 0.1
            },
            bidders: {
                minActive: 3,
                maxActive: 8,
                performanceThreshold: 0.1
            },
            priceGranularity: {
                options: ['low', 'medium', 'high', 'auto', 'dense'],
                current: 'dense'
            }
        };
    }

    recordPerformance(performance) {
        this.performanceHistory.push(performance);
        
        // Keep only last 100 records
        if (this.performanceHistory.length > 100) {
            this.performanceHistory.shift();
        }
        
        // Train ML model with new data
        this.mlModel.train(this.performanceHistory);
    }

    optimize() {
        const currentPerformance = this.getCurrentPerformance();
        const recommendations = this.mlModel.getRecommendations(currentPerformance);
        
        this.applyOptimizations(recommendations);
    }

    getCurrentPerformance() {
        if (this.performanceHistory.length === 0) return null;
        
        const recent = this.performanceHistory.slice(-10);
        return {
            averageCPM: recent.reduce((sum, p) => sum + p.averageCPM, 0) / recent.length,
            fillRate: recent.reduce((sum, p) => sum + p.winningBids, 0) / recent.reduce((sum, p) => sum + p.totalBids, 0),
            averageTimeout: recent.reduce((sum, p) => sum + p.timeout, 0) / recent.length,
            bidderPerformance: this.aggregateBidderPerformance(recent)
        };
    }

    aggregateBidderPerformance(performances) {
        const aggregated = {};
        
        performances.forEach(performance => {
            Object.keys(performance.bidderPerformance).forEach(bidder => {
                if (!aggregated[bidder]) {
                    aggregated[bidder] = {
                        totalBids: 0,
                        totalCPM: 0,
                        wins: 0,
                        timeouts: 0
                    };
                }
                
                const bidderPerf = performance.bidderPerformance[bidder];
                aggregated[bidder].totalBids += bidderPerf.totalBids;
                aggregated[bidder].totalCPM += bidderPerf.totalCPM;
                aggregated[bidder].wins += bidderPerf.wins;
                aggregated[bidder].timeouts += bidderPerf.timeouts;
            });
        });
        
        return aggregated;
    }

    applyOptimizations(recommendations) {
        if (recommendations.adjustTimeout) {
            this.adjustTimeout(recommendations.newTimeout);
        }
        
        if (recommendations.adjustBidders) {
            this.adjustBidders(recommendations.bidderChanges);
        }
        
        if (recommendations.adjustPriceGranularity) {
            this.adjustPriceGranularity(recommendations.newPriceGranularity);
        }
    }

    adjustTimeout(newTimeout) {
        const pbjs = window.pbjs;
        pbjs.que.push(() => {
            pbjs.setConfig({ bidderTimeout: newTimeout });
        });
    }

    adjustBidders(bidderChanges) {
        // Implementation for adding/removing bidders
        console.log('Adjusting bidders:', bidderChanges);
    }

    adjustPriceGranularity(newPriceGranularity) {
        const pbjs = window.pbjs;
        pbjs.que.push(() => {
            pbjs.setConfig({ priceGranularity: newPriceGranularity });
        });
    }
}

class MLYieldModel {
    constructor() {
        this.model = null;
        this.trainingData = [];
    }

    train(data) {
        this.trainingData = data;
        // Simple heuristic-based model (replace with actual ML implementation)
        this.model = this.buildHeuristicModel();
    }

    buildHeuristicModel() {
        return {
            optimalTimeout: this.calculateOptimalTimeout(),
            bestBidders: this.identifyBestBidders(),
            optimalPriceGranularity: this.selectOptimalPriceGranularity()
        };
    }

    calculateOptimalTimeout() {
        const avgCPMs = this.trainingData.map(d => d.averageCPM);
        const timeouts = this.trainingData.map(d => d.timeout);
        
        // Find timeout that maximizes CPM
        let bestTimeout = 2000;
        let bestCPM = 0;
        
        for (let i = 0; i < timeouts.length; i++) {
            if (avgCPMs[i] > bestCPM) {
                bestCPM = avgCPMs[i];
                bestTimeout = timeouts[i];
            }
        }
        
        return bestTimeout;
    }

    identifyBestBidders() {
        const bidderScores = {};
        
        this.trainingData.forEach(data => {
            Object.keys(data.bidderPerformance).forEach(bidder => {
                const perf = data.bidderPerformance[bidder];
                const score = (perf.totalCPM / perf.totalBids) * (perf.wins / perf.totalBids);
                
                if (!bidderScores[bidder]) {
                    bidderScores[bidder] = [];
                }
                bidderScores[bidder].push(score);
            });
        });
        
        // Calculate average scores
        const avgScores = {};
        Object.keys(bidderScores).forEach(bidder => {
            avgScores[bidder] = bidderScores[bidder].reduce((sum, score) => sum + score, 0) / bidderScores[bidder].length;
        });
        
        return Object.keys(avgScores).sort((a, b) => avgScores[b] - avgScores[a]);
    }

    selectOptimalPriceGranularity() {
        // Simple heuristic: use dense for better granularity
        return 'dense';
    }

    getRecommendations(currentPerformance) {
        if (!this.model || !currentPerformance) {
            return {};
        }
        
        const recommendations = {};
        
        // Timeout recommendations
        if (Math.abs(currentPerformance.averageTimeout - this.model.optimalTimeout) > 200) {
            recommendations.adjustTimeout = true;
            recommendations.newTimeout = this.model.optimalTimeout;
        }
        
        // Bidder recommendations
        const currentBidders = Object.keys(currentPerformance.bidderPerformance);
        const recommendedBidders = this.model.bestBidders.slice(0, 5);
        
        if (JSON.stringify(currentBidders.sort()) !== JSON.stringify(recommendedBidders.sort())) {
            recommendations.adjustBidders = true;
            recommendations.bidderChanges = {
                add: recommendedBidders.filter(b => !currentBidders.includes(b)),
                remove: currentBidders.filter(b => !recommendedBidders.includes(b))
            };
        }
        
        return recommendations;
    }
}

class ConsentManager {
    constructor() {
        this.consentStatus = this.checkConsentStatus();
        this.setupATTPrompt();
    }

    checkConsentStatus() {
        return localStorage.getItem('user_consent') === 'granted';
    }

    setupATTPrompt() {
        this.attPromptConfig = {
            trigger: 'user_completed_3_sessions',
            customMessage: 'Get personalized practice problems! Allow tracking to see content matched to your learning style.',
            expectedOptIn: 0.44
        };
    }

    hasConsent() {
        return this.consentStatus;
    }

    requestConsent() {
        // Show consent dialog
        this.showConsentDialog();
    }

    showConsentDialog() {
        const modal = document.createElement('div');
        modal.className = 'consent-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Personalize Your Learning Experience</h3>
                <p>${this.attPromptConfig.customMessage}</p>
                <div class="consent-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.consent-modal').grantConsent()">
                        Allow Personalization
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.consent-modal').denyConsent()">
                        Continue Without
                    </button>
                </div>
            </div>
        `;

        modal.grantConsent = () => {
            localStorage.setItem('user_consent', 'granted');
            this.consentStatus = true;
            document.body.removeChild(modal);
            this.trackConsentEvent('granted');
        };

        modal.denyConsent = () => {
            localStorage.setItem('user_consent', 'denied');
            this.consentStatus = false;
            document.body.removeChild(modal);
            this.trackConsentEvent('denied');
        };

        document.body.appendChild(modal);
    }

    trackConsentEvent(status) {
        // Track consent decision
        console.log('Consent status:', status);
    }
}

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            core_web_vitals: {},
            ad_performance: {},
            user_experience: {}
        };
    }

    start() {
        this.monitorCoreWebVitals();
        this.monitorAdPerformance();
        this.monitorUserExperience();
    }

    monitorCoreWebVitals() {
        // Monitor LCP, FID, CLS
        if ('web-vital' in window) {
            window.webVitals.getLCP(this.recordLCP.bind(this));
            window.webVitals.getFID(this.recordFID.bind(this));
            window.webVitals.getCLS(this.recordCLS.bind(this));
        }
    }

    recordLCP(metric) {
        this.metrics.core_web_vitals.lcp = metric.value;
        if (metric.value > 2500) {
            this.alertPerformanceIssue('LCP', metric.value);
        }
    }

    recordFID(metric) {
        this.metrics.core_web_vitals.fid = metric.value;
        if (metric.value > 100) {
            this.alertPerformanceIssue('FID', metric.value);
        }
    }

    recordCLS(metric) {
        this.metrics.core_web_vitals.cls = metric.value;
        if (metric.value > 0.1) {
            this.alertPerformanceIssue('CLS', metric.value);
        }
    }

    monitorAdPerformance() {
        // Monitor ad loading times, viewability, etc.
        setInterval(() => {
            this.measureAdPerformance();
        }, 30000);
    }

    measureAdPerformance() {
        const adElements = document.querySelectorAll('[data-ad-unit]');
        adElements.forEach(ad => {
            const loadTime = ad.getAttribute('data-load-time');
            const viewability = this.calculateViewability(ad);
            
            this.metrics.ad_performance[ad.id] = {
                loadTime: loadTime,
                viewability: viewability,
                timestamp: Date.now()
            };
        });
    }

    calculateViewability(element) {
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        const viewWidth = window.innerWidth;
        
        const visibleHeight = Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, viewWidth) - Math.max(rect.left, 0);
        
        if (visibleHeight <= 0 || visibleWidth <= 0) {
            return 0;
        }
        
        const visibleArea = visibleHeight * visibleWidth;
        const totalArea = rect.height * rect.width;
        
        return visibleArea / totalArea;
    }

    monitorUserExperience() {
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.trackInteractionEvents();
    }

    trackScrollDepth() {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            this.metrics.user_experience.max_scroll = maxScroll;
        });
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.metrics.user_experience.time_on_page = Date.now() - startTime;
        });
    }

    trackInteractionEvents() {
        ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.metrics.user_experience.interactions = (this.metrics.user_experience.interactions || 0) + 1;
            });
        });
    }

    alertPerformanceIssue(metric, value) {
        console.warn(`Performance issue detected: ${metric} = ${value}`);
        // Send alert to monitoring service
    }
}

// Initialize header bidding system
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure all dependencies are loaded
    setTimeout(() => {
        window.headerBiddingSystem = new HeaderBiddingSystem();
    }, 1000);
});

// Export for use in other modules
window.HeaderBiddingSystem = HeaderBiddingSystem;
window.FirstPartyDataCollector = FirstPartyDataCollector;
window.YieldOptimizer = YieldOptimizer;
window.MLYieldModel = MLYieldModel;
window.ConsentManager = ConsentManager;
window.PerformanceMonitor = PerformanceMonitor;