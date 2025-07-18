// Viral Growth System for Math.help - Revenue Maximizing Strategy
// Implements viral mechanics, user segmentation, and intelligent ad serving

class ViralGrowthSystem {
    constructor() {
        this.baseUrl = 'https://math.help';
        this.viralCoefficient = 0;
        this.targetKFactor = 1.2;
        this.userId = this.getUserId();
        this.userTier = null;
        this.adLoadConfig = this.getAdLoadConfig();
        this.init();
    }

    init() {
        this.setupAnalytics();
        this.determineUserTier();
        this.setupViralMechanics();
        this.setupRewardedVideoSystem();
        this.trackViralMetrics();
    }

    // User Segmentation System
    getAdLoadConfig() {
        return {
            lightUsers: {
                definition: "< 10 problems/day",
                adFrequency: 600000, // 10 minutes in ms
                targetARPDAU: 0.08,
                adTypes: ["rewarded_video_only"],
                maxAdsPerHour: 2
            },
            regularUsers: {
                definition: "10-30 problems/day",
                adFrequency: 300000, // 5 minutes in ms
                targetARPDAU: 0.15,
                adTypes: ["rewarded_video", "native_ads"],
                maxAdsPerHour: 3
            },
            powerUsers: {
                definition: "> 30 problems/day",
                adFrequency: 180000, // 3 minutes in ms
                targetARPDAU: 0.35,
                adTypes: ["rewarded_video", "interstitial", "native_ads"],
                maxAdsPerHour: 4
            }
        };
    }

    determineUserTier() {
        const dailyProblems = this.getDailyProblemCount();
        
        if (dailyProblems < 10) {
            this.userTier = 'lightUsers';
        } else if (dailyProblems <= 30) {
            this.userTier = 'regularUsers';
        } else {
            this.userTier = 'powerUsers';
        }

        this.trackEvent('user_tier_determined', {
            tier: this.userTier,
            daily_problems: dailyProblems
        });
    }

    // Viral Mechanics Implementation
    setupViralMechanics() {
        this.viralFeatures = {
            mathChallenge: {
                shareIncentive: "Unlock advanced calculator for 24 hours",
                targetConversion: 0.25,
                rewardDuration: 24 * 60 * 60 * 1000, // 24 hours
                trackingMetrics: ["shareRate", "viralCoefficient", "friendActivation"]
            },
            collaborativeSolving: {
                mechanism: "Solve together with friends for 2x points",
                rewardStructure: "Both users get premium features trial",
                trialDuration: 7 * 24 * 60 * 60 * 1000 // 7 days
            },
            sendHint: {
                description: "Help a friend by watching a rewarded video",
                reward: "Both users get bonus points",
                adType: "rewarded_video"
            }
        };
    }

    createMathChallenge(problemData) {
        const challengeId = this.generateUniqueId();
        const challenge = {
            id: challengeId,
            creator: this.userId,
            problem: problemData,
            shareUrl: `${this.baseUrl}/challenge/${challengeId}`,
            reward: this.viralFeatures.mathChallenge.shareIncentive,
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        this.saveChallenge(challenge);
        this.trackEvent('challenge_created', {
            challenge_id: challengeId,
            problem_type: problemData.type
        });

        return challenge;
    }

    shareChallenge(challengeId, method = 'native') {
        const challenge = this.getChallenge(challengeId);
        if (!challenge) return;

        const shareData = {
            title: `Can you solve this ${challenge.problem.type} problem?`,
            text: `I just solved this on Math.help! Think you can do better?`,
            url: challenge.shareUrl
        };

        if (method === 'native' && navigator.share) {
            navigator.share(shareData);
        } else {
            this.showShareModal(shareData);
        }

        this.trackEvent('challenge_shared', {
            challenge_id: challengeId,
            share_method: method
        });

        // Reward user for sharing
        this.rewardUser(challenge.reward);
    }

    // Rewarded Video System
    setupRewardedVideoSystem() {
        this.rewardedVideoConfig = {
            providers: ['google_admob', 'meta_audience_network', 'unity_ads'],
            rewardTypes: {
                hint: { description: 'Get a hint for this problem', reward: 'hint_unlock' },
                solution: { description: 'Unlock step-by-step solution', reward: 'solution_unlock' },
                calculator: { description: 'Use advanced calculator', reward: 'calculator_unlock' },
                practice: { description: 'Get 3 extra practice problems', reward: 'extra_problems' }
            },
            targetECPM: 12.50 // Target $12.50 eCPM
        };
    }

    showRewardedVideoOffer(rewardType, context) {
        const reward = this.rewardedVideoConfig.rewardTypes[rewardType];
        if (!reward) return;

        // Check if user is in ad-free period (first 7 days)
        if (this.isInAdFreeZone()) {
            this.grantReward(reward.reward, context);
            return;
        }

        // Check ad frequency limits
        if (!this.canShowAd()) {
            this.showFrequencyLimitMessage();
            return;
        }

        const modal = this.createRewardedVideoModal(reward, context);
        modal.show();
    }

    createRewardedVideoModal(reward, context) {
        const modal = document.createElement('div');
        modal.className = 'rewarded-video-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎁 Free Reward Available!</h3>
                </div>
                <div class="modal-body">
                    <p>${reward.description}</p>
                    <div class="reward-preview">
                        <span class="reward-icon">🎯</span>
                        <span class="reward-text">${this.getRewardDisplayText(reward.reward)}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.closest('.rewarded-video-modal').loadRewardedVideo()">
                        Watch Ad (30s)
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.rewarded-video-modal').close()">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        modal.loadRewardedVideo = () => {
            this.loadRewardedVideo(reward.reward, context);
            modal.close();
        };

        modal.close = () => {
            document.body.removeChild(modal);
        };

        modal.show = () => {
            document.body.appendChild(modal);
        };

        return modal;
    }

    loadRewardedVideo(rewardType, context) {
        this.trackEvent('rewarded_video_requested', {
            reward_type: rewardType,
            context: context
        });

        // Simulate ad loading (integrate with actual ad SDK)
        this.showLoadingIndicator();

        setTimeout(() => {
            this.hideLoadingIndicator();
            this.showRewardedVideoAd(rewardType, context);
        }, 1500);
    }

    showRewardedVideoAd(rewardType, context) {
        // This would integrate with actual ad SDK
        console.log('Showing rewarded video ad...');
        
        // Simulate ad completion
        setTimeout(() => {
            this.onRewardedVideoCompleted(rewardType, context);
        }, 30000); // 30 second ad
    }

    onRewardedVideoCompleted(rewardType, context) {
        this.trackEvent('rewarded_video_completed', {
            reward_type: rewardType,
            context: context
        });

        this.grantReward(rewardType, context);
        this.updateAdFrequency();
        this.calculateRevenue(rewardType);
    }

    // Ad Frequency and Revenue Management
    canShowAd() {
        const config = this.adLoadConfig[this.userTier];
        const lastAdTime = localStorage.getItem('lastAdTime');
        const adsThisHour = this.getAdsThisHour();

        if (adsThisHour >= config.maxAdsPerHour) {
            return false;
        }

        if (lastAdTime && (Date.now() - lastAdTime) < config.adFrequency) {
            return false;
        }

        return true;
    }

    isInAdFreeZone() {
        const userCreated = localStorage.getItem('userCreatedAt');
        if (!userCreated) return false;

        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return userCreated > sevenDaysAgo;
    }

    updateAdFrequency() {
        localStorage.setItem('lastAdTime', Date.now().toString());
        
        const adsToday = this.getAdsToday();
        localStorage.setItem('adsToday', (adsToday + 1).toString());
    }

    calculateRevenue(rewardType) {
        const config = this.adLoadConfig[this.userTier];
        const estimatedRevenue = config.targetARPDAU / config.maxAdsPerHour;
        
        this.trackEvent('revenue_generated', {
            user_tier: this.userTier,
            reward_type: rewardType,
            estimated_revenue: estimatedRevenue
        });

        // Update daily revenue tracking
        const dailyRevenue = this.getDailyRevenue();
        this.setDailyRevenue(dailyRevenue + estimatedRevenue);
    }

    // Analytics and Tracking
    setupAnalytics() {
        this.analytics = {
            events: [],
            viralMetrics: {
                k_factor: 0,
                shares_per_user: 0,
                activation_rate: 0,
                retention_day_30: 0
            },
            revenueMetrics: {
                arpdau: 0,
                ltv: 0,
                cac: 0,
                ltv_cac_ratio: 0
            }
        };
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                user_id: this.userId,
                user_tier: this.userTier,
                timestamp: Date.now(),
                session_id: this.getSessionId(),
                page_url: window.location.href
            }
        };

        this.analytics.events.push(event);
        
        // Send to analytics service (Amplitude, Mixpanel, etc.)
        this.sendToAnalytics(event);
    }

    trackViralMetrics() {
        setInterval(() => {
            this.calculateViralCoefficient();
            this.updateViralMetrics();
        }, 60000); // Update every minute
    }

    calculateViralCoefficient() {
        const totalUsers = this.getTotalUsers();
        const newUsersFromSharing = this.getNewUsersFromSharing();
        const sharingUsers = this.getSharingUsers();

        if (sharingUsers > 0) {
            this.viralCoefficient = newUsersFromSharing / sharingUsers;
        }

        // Alert if k-factor drops below threshold
        if (this.viralCoefficient < this.targetKFactor) {
            this.alertLowViralCoefficient();
        }
    }

    alertLowViralCoefficient() {
        console.warn(`Viral coefficient (${this.viralCoefficient}) below target (${this.targetKFactor})`);
        
        // Implement emergency measures
        this.pauseAdsIfNeeded();
        this.boostViralIncentives();
    }

    pauseAdsIfNeeded() {
        const retentionDrop = this.getRetentionDrop();
        if (retentionDrop > 0.05) { // 5% retention drop
            this.pauseAllAds();
            this.trackEvent('ads_paused_emergency', {
                reason: 'retention_drop',
                retention_drop: retentionDrop
            });
        }
    }

    // Utility Methods
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = this.generateUniqueId();
            localStorage.setItem('userId', userId);
            localStorage.setItem('userCreatedAt', Date.now().toString());
        }
        return userId;
    }

    generateUniqueId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    getDailyProblemCount() {
        const today = new Date().toDateString();
        const problems = JSON.parse(localStorage.getItem('dailyProblems') || '{}');
        return problems[today] || 0;
    }

    incrementDailyProblemCount() {
        const today = new Date().toDateString();
        const problems = JSON.parse(localStorage.getItem('dailyProblems') || '{}');
        problems[today] = (problems[today] || 0) + 1;
        localStorage.setItem('dailyProblems', JSON.stringify(problems));
    }

    getAdsThisHour() {
        const hourKey = new Date().getHours();
        const adsThisHour = JSON.parse(localStorage.getItem('adsThisHour') || '{}');
        return adsThisHour[hourKey] || 0;
    }

    getAdsToday() {
        return parseInt(localStorage.getItem('adsToday') || '0');
    }

    getDailyRevenue() {
        return parseFloat(localStorage.getItem('dailyRevenue') || '0');
    }

    setDailyRevenue(revenue) {
        localStorage.setItem('dailyRevenue', revenue.toString());
    }

    // Integration Methods (to be implemented with actual services)
    sendToAnalytics(event) {
        // Integrate with Amplitude, Mixpanel, etc.
        console.log('Analytics Event:', event);
    }

    saveChallenge(challenge) {
        // Save to backend
        console.log('Saving challenge:', challenge);
    }

    getChallenge(challengeId) {
        // Retrieve from backend
        return null;
    }

    rewardUser(reward) {
        // Grant reward to user
        console.log('Rewarding user:', reward);
    }

    grantReward(rewardType, context) {
        // Grant specific reward
        console.log('Granting reward:', rewardType, context);
    }

    getTotalUsers() {
        // Get from analytics
        return 1000;
    }

    getNewUsersFromSharing() {
        // Get from analytics
        return 50;
    }

    getSharingUsers() {
        // Get from analytics
        return 45;
    }

    getRetentionDrop() {
        // Calculate retention drop
        return 0.02;
    }

    pauseAllAds() {
        // Pause all ad serving
        console.log('Pausing all ads');
    }

    boostViralIncentives() {
        // Increase viral incentives
        console.log('Boosting viral incentives');
    }

    showLoadingIndicator() {
        // Show loading
    }

    hideLoadingIndicator() {
        // Hide loading
    }

    showFrequencyLimitMessage() {
        // Show message about ad frequency
    }

    showShareModal(shareData) {
        // Show share modal
    }

    getRewardDisplayText(reward) {
        const displayTexts = {
            hint_unlock: 'Get a helpful hint',
            solution_unlock: 'See step-by-step solution',
            calculator_unlock: 'Use advanced calculator',
            extra_problems: 'Get 3 bonus problems'
        };
        return displayTexts[reward] || 'Get reward';
    }
}

// Initialize viral growth system
document.addEventListener('DOMContentLoaded', function() {
    window.viralGrowthSystem = new ViralGrowthSystem();
});

// Export for use in other modules
window.ViralGrowthSystem = ViralGrowthSystem;