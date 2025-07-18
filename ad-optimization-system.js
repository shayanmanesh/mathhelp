// Advanced Ad Optimization System for Math Help
// Implements 30/70 ads-to-content ratio, native ads, strategic placements, and revenue optimization

class AdOptimizationSystem {
    constructor() {
        this.config = {
            maxAdDensity: 0.30, // 30% maximum ad density
            minContentHeight: 400, // Minimum content height before showing ads
            viewabilityThreshold: 0.5, // 50% viewability requirement
            refreshInterval: 30000, // 30 seconds minimum between refreshes
            maxRefreshCount: 5, // Maximum refreshes per session
            stickyAdMaxHeight: 250, // Maximum height for sticky ads
            nativeAdRatio: 0.4, // 40% of ads should be native
            
            // Revenue targets
            targetRPM: {
                adsense: { min: 5, max: 10 },
                mediavine: { min: 11, max: 15 }, // 50K sessions requirement
                raptive: { min: 15, max: 20 }, // 100K pageviews requirement
                video: { min: 4, max: 8, premium: 10 }
            },
            
            // Placement priorities
            placements: {
                aboveFold: { priority: 1, ctr: 0.045 },
                contextual: { priority: 2, ctr: 0.038 },
                sticky: { priority: 3, ctr: 0.032 },
                inContent: { priority: 4, ctr: 0.025 },
                belowContent: { priority: 5, ctr: 0.015 }
            }
        };
        
        this.adSlots = new Map();
        this.contentMetrics = {};
        this.viewabilityObserver = null;
        this.refreshTimers = new Map();
        
        this.init();
    }

    init() {
        this.measureContent();
        this.calculateOptimalAdPositions();
        this.setupViewabilityTracking();
        this.initializeNativeAds();
        this.enhanceHeaderBidding();
        this.setupAdRefresh();
        this.monitorPerformance();
    }

    // Measure content and calculate 30/70 ratio
    measureContent() {
        const content = document.querySelector('.main-content, main, article');
        if (!content) return;
        
        const contentHeight = content.scrollHeight;
        const contentArea = content.offsetWidth * contentHeight;
        
        this.contentMetrics = {
            height: contentHeight,
            width: content.offsetWidth,
            area: contentArea,
            maxAdArea: contentArea * this.config.maxAdDensity,
            paragraphs: content.querySelectorAll('p').length,
            headings: content.querySelectorAll('h1, h2, h3, h4').length,
            images: content.querySelectorAll('img').length,
            calculators: content.querySelectorAll('.calculator-widget, .math-tool').length
        };
        
        console.log('Content Metrics:', this.contentMetrics);
    }

    // Calculate optimal ad positions based on content
    calculateOptimalAdPositions() {
        const positions = [];
        const content = document.querySelector('.main-content, main, article');
        if (!content) return positions;
        
        // Above the fold placement
        positions.push({
            type: 'display',
            placement: 'aboveFold',
            selector: 'afterbegin',
            format: 'responsive',
            sizes: [[728, 90], [320, 50]]
        });
        
        // Contextual placements near tools
        const tools = content.querySelectorAll('.calculator-widget, .math-tool, .practice-problem');
        tools.forEach((tool, index) => {
            if (index % 2 === 0) { // Every other tool
                positions.push({
                    type: 'native',
                    placement: 'contextual',
                    element: tool,
                    selector: 'afterend',
                    format: 'in-feed'
                });
            }
        });
        
        // In-content placements
        const paragraphs = content.querySelectorAll('p');
        const adInterval = Math.floor(paragraphs.length / 3); // 3 ads max in content
        
        for (let i = adInterval; i < paragraphs.length; i += adInterval) {
            if (positions.filter(p => p.placement === 'inContent').length < 2) {
                positions.push({
                    type: i % 2 === 0 ? 'native' : 'display',
                    placement: 'inContent',
                    element: paragraphs[i],
                    selector: 'afterend',
                    format: i % 2 === 0 ? 'in-article' : 'responsive'
                });
            }
        }
        
        // Sticky ad (desktop: sidebar, mobile: bottom)
        if (window.innerWidth > 768) {
            positions.push({
                type: 'display',
                placement: 'sticky',
                position: 'sidebar',
                format: 'vertical',
                sizes: [[300, 600], [300, 250], [160, 600]]
            });
        } else {
            positions.push({
                type: 'display',
                placement: 'sticky',
                position: 'bottom',
                format: 'horizontal',
                sizes: [[320, 50], [320, 100]],
                maxHeight: this.config.stickyAdMaxHeight
            });
        }
        
        this.optimalPositions = this.validateAdDensity(positions);
        return this.optimalPositions;
    }

    // Validate that ad density doesn't exceed 30%
    validateAdDensity(positions) {
        let totalAdArea = 0;
        const validPositions = [];
        
        for (const position of positions) {
            const adArea = this.calculateAdArea(position);
            if ((totalAdArea + adArea) / this.contentMetrics.area <= this.config.maxAdDensity) {
                totalAdArea += adArea;
                validPositions.push(position);
            }
        }
        
        console.log(`Ad Density: ${((totalAdArea / this.contentMetrics.area) * 100).toFixed(1)}%`);
        return validPositions;
    }

    // Calculate estimated ad area
    calculateAdArea(position) {
        const sizeMap = {
            [[728, 90]]: 65520,
            [[320, 50]]: 16000,
            [[300, 250]]: 75000,
            [[300, 600]]: 180000,
            [[160, 600]]: 96000,
            [[320, 100]]: 32000,
            'native': 40000, // Estimated average
            'responsive': 50000 // Estimated average
        };
        
        if (position.sizes && position.sizes[0]) {
            return sizeMap[position.sizes[0]] || 50000;
        }
        
        return sizeMap[position.format] || 50000;
    }

    // Initialize native ads with 25-40% better performance
    initializeNativeAds() {
        const nativeAdConfig = {
            style: {
                container: `
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 24px 0;
                    font-family: inherit;
                `,
                title: `
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    line-height: 1.4;
                `,
                body: `
                    font-size: 14px;
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 12px;
                `,
                sponsorship: `
                    font-size: 11px;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                `,
                cta: `
                    display: inline-block;
                    padding: 8px 16px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.3s;
                `
            },
            templates: {
                'in-feed': {
                    layout: 'horizontal',
                    imageSize: 'thumbnail',
                    showDescription: true
                },
                'in-article': {
                    layout: 'fluid',
                    imageSize: 'responsive',
                    showDescription: true
                },
                'recommendation': {
                    layout: 'grid',
                    imageSize: 'square',
                    showDescription: false
                }
            }
        };
        
        // Create native ad slots
        this.optimalPositions.filter(pos => pos.type === 'native').forEach(position => {
            this.createNativeAdSlot(position, nativeAdConfig);
        });
    }

    // Create native ad slot
    createNativeAdSlot(position, config) {
        const adContainer = document.createElement('div');
        adContainer.className = 'native-ad-container';
        adContainer.dataset.adType = 'native';
        adContainer.dataset.format = position.format;
        
        // Apply native ad styling
        const template = config.templates[position.format] || config.templates['in-feed'];
        adContainer.innerHTML = `
            <div class="native-ad" style="${config.style.container}">
                <div class="native-ad-label" style="${config.style.sponsorship}">Sponsored</div>
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="${template.layout}"
                     data-ad-layout-key="-fg+5n+6t-e7+r"
                     data-ad-client="ca-pub-5635114711353420"
                     data-ad-slot="${this.generateAdSlot('native')}"></ins>
            </div>
        `;
        
        // Insert at calculated position
        this.insertAdAtPosition(adContainer, position);
        
        // Track slot
        this.adSlots.set(adContainer.id, {
            element: adContainer,
            type: 'native',
            position: position,
            impressions: 0,
            viewability: 0,
            revenue: 0
        });
    }

    // Enhanced header bidding implementation
    enhanceHeaderBidding() {
        // Add more bidders for competitive bidding
        const additionalBidders = [
            {
                bidder: 'rubicon',
                params: {
                    accountId: '21150',
                    siteId: '355126',
                    zoneId: '1859484'
                }
            },
            {
                bidder: 'appnexus',
                params: {
                    placementId: '19395224'
                }
            },
            {
                bidder: 'pubmatic',
                params: {
                    publisherId: '159448',
                    adSlot: 'math_help_header'
                }
            },
            {
                bidder: 'openx',
                params: {
                    unit: '543211234',
                    delDomain: 'math-help-d.openx.net'
                }
            },
            {
                bidder: 'sovrn',
                params: {
                    tagid: '736478'
                }
            }
        ];
        
        // Configure price granularity for better competition
        const priceGranularity = {
            buckets: [
                { precision: 2, min: 0, max: 5, increment: 0.01 },
                { precision: 2, min: 5, max: 10, increment: 0.05 },
                { precision: 2, min: 10, max: 20, increment: 0.50 }
            ]
        };
        
        // Update header bidding configuration
        if (window.pbjs) {
            window.pbjs.que.push(() => {
                // Add new bidders
                const adUnits = window.pbjs.getAdUnits();
                adUnits.forEach(adUnit => {
                    additionalBidders.forEach(bidder => {
                        adUnit.bids.push(bidder);
                    });
                });
                
                // Set price granularity
                window.pbjs.setConfig({
                    priceGranularity: priceGranularity,
                    enableSendAllBids: true,
                    bidderTimeout: 2000, // Increased timeout
                    userSync: {
                        iframeEnabled: true,
                        syncsPerBidder: 5,
                        syncDelay: 3000
                    }
                });
                
                // Enable bid caching
                window.pbjs.setConfig({
                    cache: {
                        url: 'https://prebid.adnxs.com/pbc/v1/cache'
                    }
                });
            });
        }
    }

    // Setup viewability tracking
    setupViewabilityTracking() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 0.9, 1.0]
        };
        
        this.viewabilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const slotId = entry.target.id;
                const slot = this.adSlots.get(slotId);
                
                if (slot) {
                    slot.viewability = entry.intersectionRatio;
                    
                    // Track 50% viewability for video ads
                    if (entry.intersectionRatio >= this.config.viewabilityThreshold) {
                        slot.viewableTime = (slot.viewableTime || 0) + 1;
                        
                        // Enable refresh after viewability requirements met
                        if (slot.viewableTime > 5 && !slot.refreshEnabled) {
                            this.enableAdRefresh(slotId);
                            slot.refreshEnabled = true;
                        }
                    }
                }
            });
        }, options);
        
        // Observe all ad slots
        this.adSlots.forEach((slot, id) => {
            const element = document.getElementById(id);
            if (element) {
                this.viewabilityObserver.observe(element);
            }
        });
    }

    // Smart ad refresh implementation
    setupAdRefresh() {
        this.adSlots.forEach((slot, slotId) => {
            // Only refresh display ads, not native
            if (slot.type === 'display' && slot.position.placement !== 'sticky') {
                const refreshConfig = {
                    minInterval: this.config.refreshInterval,
                    maxRefreshes: this.config.maxRefreshCount,
                    viewabilityRequired: true,
                    userEngagementRequired: true
                };
                
                this.configureSlotRefresh(slotId, refreshConfig);
            }
        });
    }

    // Configure refresh for specific slot
    configureSlotRefresh(slotId, config) {
        const slot = this.adSlots.get(slotId);
        if (!slot) return;
        
        slot.refreshConfig = config;
        slot.refreshCount = 0;
        
        // Monitor user engagement
        this.monitorUserEngagement(slotId);
    }

    // Enable refresh for a slot
    enableAdRefresh(slotId) {
        const slot = this.adSlots.get(slotId);
        if (!slot || !slot.refreshConfig) return;
        
        const refreshAd = () => {
            if (slot.refreshCount >= slot.refreshConfig.maxRefreshes) {
                return;
            }
            
            // Check viewability and engagement
            if (slot.viewability >= this.config.viewabilityThreshold && slot.userEngaged) {
                // Refresh the ad
                if (window.googletag && window.googletag.pubads) {
                    window.googletag.pubads().refresh([slot.gptSlot]);
                    slot.refreshCount++;
                    slot.lastRefresh = Date.now();
                    
                    console.log(`Refreshed ad slot ${slotId} (${slot.refreshCount}/${slot.refreshConfig.maxRefreshes})`);
                }
            }
            
            // Schedule next refresh
            if (slot.refreshCount < slot.refreshConfig.maxRefreshes) {
                this.refreshTimers.set(slotId, setTimeout(refreshAd, slot.refreshConfig.minInterval));
            }
        };
        
        // Initial refresh timer
        this.refreshTimers.set(slotId, setTimeout(refreshAd, slot.refreshConfig.minInterval));
    }

    // Monitor user engagement for refresh
    monitorUserEngagement(slotId) {
        const slot = this.adSlots.get(slotId);
        if (!slot) return;
        
        // Track scroll, click, and time on page
        let lastActivity = Date.now();
        slot.userEngaged = false;
        
        const engagementEvents = ['scroll', 'click', 'mousemove', 'touchstart'];
        
        const updateEngagement = () => {
            lastActivity = Date.now();
            slot.userEngaged = true;
        };
        
        engagementEvents.forEach(event => {
            window.addEventListener(event, updateEngagement, { passive: true });
        });
        
        // Check engagement periodically
        setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivity;
            slot.userEngaged = timeSinceActivity < 30000; // 30 seconds of inactivity
        }, 5000);
    }

    // Insert ad at calculated position
    insertAdAtPosition(adElement, position) {
        let targetElement;
        
        if (position.element) {
            targetElement = position.element;
        } else if (position.placement === 'aboveFold') {
            targetElement = document.querySelector('.main-content, main, article');
        } else if (position.placement === 'sticky') {
            return this.createStickyAd(adElement, position);
        }
        
        if (targetElement) {
            if (position.selector === 'afterbegin') {
                targetElement.insertAdjacentElement('afterbegin', adElement);
            } else {
                targetElement.insertAdjacentElement('afterend', adElement);
            }
        }
    }

    // Create sticky ad
    createStickyAd(adElement, position) {
        const stickyContainer = document.createElement('div');
        stickyContainer.className = `sticky-ad-container sticky-${position.position}`;
        
        // Apply sticky positioning
        if (position.position === 'sidebar') {
            stickyContainer.style.cssText = `
                position: sticky;
                top: 100px;
                width: 300px;
                max-height: 600px;
                z-index: 100;
            `;
            
            const sidebar = document.querySelector('.sidebar, aside');
            if (sidebar) {
                sidebar.appendChild(stickyContainer);
            }
        } else if (position.position === 'bottom') {
            stickyContainer.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                max-height: ${position.maxHeight}px;
                background: white;
                border-top: 1px solid #e0e0e0;
                z-index: 1000;
                text-align: center;
                padding: 10px;
            `;
            
            // Add close button for mobile sticky
            const closeBtn = document.createElement('button');
            closeBtn.className = 'sticky-ad-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => stickyContainer.remove();
            stickyContainer.appendChild(closeBtn);
            
            document.body.appendChild(stickyContainer);
        }
        
        stickyContainer.appendChild(adElement);
        return stickyContainer;
    }

    // Generate unique ad slot IDs
    generateAdSlot(type) {
        const slotMap = {
            'display': '1234567890',
            'native': '1234567891',
            'video': '1234567892',
            'sticky': '1234567893'
        };
        
        return slotMap[type] || '1234567890';
    }

    // Monitor and report performance
    monitorPerformance() {
        setInterval(() => {
            const metrics = this.calculateMetrics();
            this.reportMetrics(metrics);
            this.optimizeBasedOnPerformance(metrics);
        }, 60000); // Every minute
    }

    // Calculate performance metrics
    calculateMetrics() {
        let totalImpressions = 0;
        let totalRevenue = 0;
        let viewableImpressions = 0;
        
        this.adSlots.forEach(slot => {
            totalImpressions += slot.impressions;
            totalRevenue += slot.revenue;
            if (slot.viewability >= this.config.viewabilityThreshold) {
                viewableImpressions++;
            }
        });
        
        const rpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
        const viewabilityRate = totalImpressions > 0 ? viewableImpressions / totalImpressions : 0;
        
        return {
            rpm,
            viewabilityRate,
            totalImpressions,
            totalRevenue,
            adDensity: this.calculateCurrentAdDensity(),
            nativeAdPercentage: this.calculateNativeAdPercentage()
        };
    }

    // Calculate current ad density
    calculateCurrentAdDensity() {
        const adElements = document.querySelectorAll('.adsbygoogle, .native-ad-container');
        let totalAdArea = 0;
        
        adElements.forEach(ad => {
            totalAdArea += ad.offsetWidth * ad.offsetHeight;
        });
        
        return totalAdArea / this.contentMetrics.area;
    }

    // Calculate native ad percentage
    calculateNativeAdPercentage() {
        let nativeCount = 0;
        let totalCount = 0;
        
        this.adSlots.forEach(slot => {
            totalCount++;
            if (slot.type === 'native') {
                nativeCount++;
            }
        });
        
        return totalCount > 0 ? nativeCount / totalCount : 0;
    }

    // Report metrics
    reportMetrics(metrics) {
        console.log('Ad Performance Metrics:', {
            RPM: `$${metrics.rpm.toFixed(2)}`,
            Viewability: `${(metrics.viewabilityRate * 100).toFixed(1)}%`,
            'Ad Density': `${(metrics.adDensity * 100).toFixed(1)}%`,
            'Native Ads': `${(metrics.nativeAdPercentage * 100).toFixed(1)}%`
        });
        
        // Send to analytics
        if (window.gtag) {
            window.gtag('event', 'ad_performance', {
                'event_category': 'monetization',
                'rpm': metrics.rpm,
                'viewability_rate': metrics.viewabilityRate,
                'ad_density': metrics.adDensity
            });
        }
    }

    // Optimize based on performance
    optimizeBasedOnPerformance(metrics) {
        // Increase native ads if performing well
        if (metrics.rpm > this.config.targetRPM.adsense.min && metrics.nativeAdPercentage < 0.4) {
            this.increaseNativeAds();
        }
        
        // Adjust refresh rates based on viewability
        if (metrics.viewabilityRate < 0.5) {
            this.adjustRefreshRates(1.5); // Slow down refresh
        } else if (metrics.viewabilityRate > 0.7) {
            this.adjustRefreshRates(0.8); // Speed up refresh
        }
        
        // Remove poor performing placements
        this.adSlots.forEach((slot, slotId) => {
            if (slot.impressions > 1000 && slot.revenue / slot.impressions < 0.001) {
                this.removeAdSlot(slotId);
            }
        });
    }

    // Increase native ad percentage
    increaseNativeAds() {
        const displaySlots = Array.from(this.adSlots.entries())
            .filter(([_, slot]) => slot.type === 'display' && slot.position.placement === 'inContent');
        
        if (displaySlots.length > 0) {
            const [slotId, slot] = displaySlots[0];
            // Convert to native ad
            this.convertToNativeAd(slotId);
        }
    }

    // Adjust refresh rates
    adjustRefreshRates(multiplier) {
        this.adSlots.forEach(slot => {
            if (slot.refreshConfig) {
                slot.refreshConfig.minInterval = Math.round(slot.refreshConfig.minInterval * multiplier);
            }
        });
    }

    // Remove underperforming ad slot
    removeAdSlot(slotId) {
        const slot = this.adSlots.get(slotId);
        if (slot && slot.element) {
            slot.element.remove();
            this.adSlots.delete(slotId);
            
            // Clear refresh timer
            if (this.refreshTimers.has(slotId)) {
                clearTimeout(this.refreshTimers.get(slotId));
                this.refreshTimers.delete(slotId);
            }
        }
    }

    // Convert display ad to native
    convertToNativeAd(slotId) {
        const slot = this.adSlots.get(slotId);
        if (!slot) return;
        
        // Remove old ad
        this.removeAdSlot(slotId);
        
        // Create new native ad in same position
        const nativePosition = {
            ...slot.position,
            type: 'native',
            format: 'in-article'
        };
        
        this.createNativeAdSlot(nativePosition, {
            templates: {
                'in-article': {
                    layout: 'fluid',
                    imageSize: 'responsive',
                    showDescription: true
                }
            }
        });
    }
}

// Video Ad Integration System
class VideoAdIntegration {
    constructor() {
        this.config = {
            preRoll: {
                enabled: true,
                skipAfter: 5, // seconds
                maxDuration: 15 // seconds
            },
            midRoll: {
                enabled: true,
                minVideoLength: 480, // 8 minutes in seconds
                interval: 600 // Every 10 minutes
            },
            targetRPM: {
                standard: { min: 4, max: 8 },
                mathNiche: { min: 8, max: 10 }
            }
        };
        
        this.videoPlayers = new Map();
        this.init();
    }

    init() {
        this.setupVideoAdPlayers();
        this.integrateYouTubeAds();
        this.trackVideoMetrics();
    }

    // Setup video ad players
    setupVideoAdPlayers() {
        const videos = document.querySelectorAll('video, .video-tutorial');
        
        videos.forEach((video, index) => {
            const playerId = `video-player-${index}`;
            video.id = playerId;
            
            const duration = video.duration || 0;
            const playerConfig = {
                id: playerId,
                element: video,
                duration: duration,
                preRollShown: false,
                midRollCount: 0,
                revenue: 0,
                impressions: 0
            };
            
            this.videoPlayers.set(playerId, playerConfig);
            
            // Setup pre-roll
            if (this.config.preRoll.enabled) {
                this.setupPreRoll(playerId);
            }
            
            // Setup mid-roll for long videos
            if (duration > this.config.midRoll.minVideoLength && this.config.midRoll.enabled) {
                this.setupMidRoll(playerId);
            }
        });
    }

    // Setup pre-roll ads
    setupPreRoll(playerId) {
        const player = this.videoPlayers.get(playerId);
        if (!player) return;
        
        player.element.addEventListener('play', (e) => {
            if (!player.preRollShown) {
                e.preventDefault();
                this.showPreRollAd(playerId);
                player.preRollShown = true;
            }
        }, { once: true });
    }

    // Show pre-roll ad
    showPreRollAd(playerId) {
        const player = this.videoPlayers.get(playerId);
        if (!player) return;
        
        // Create ad overlay
        const adOverlay = document.createElement('div');
        adOverlay.className = 'video-ad-overlay preroll';
        adOverlay.innerHTML = `
            <div class="video-ad-container">
                <div class="ad-label">Ad</div>
                <div class="skip-button" style="display: none;">Skip Ad →</div>
                <div class="ad-countdown">Ad will play in <span id="countdown">5</span> seconds</div>
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="fluid"
                     data-ad-layout="in-article"
                     data-ad-client="ca-pub-5635114711353420"
                     data-ad-slot="1234567894"></ins>
            </div>
        `;
        
        player.element.parentNode.insertBefore(adOverlay, player.element);
        
        // Initialize ad
        if (window.adsbygoogle) {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
        
        // Setup skip functionality
        let skipTimer = this.config.preRoll.skipAfter;
        const countdownElement = adOverlay.querySelector('#countdown');
        const skipButton = adOverlay.querySelector('.skip-button');
        
        const countdownInterval = setInterval(() => {
            skipTimer--;
            countdownElement.textContent = skipTimer;
            
            if (skipTimer <= 0) {
                clearInterval(countdownInterval);
                skipButton.style.display = 'block';
                adOverlay.querySelector('.ad-countdown').style.display = 'none';
            }
        }, 1000);
        
        skipButton.addEventListener('click', () => {
            adOverlay.remove();
            player.element.play();
        });
        
        // Track impression
        player.impressions++;
    }

    // Setup mid-roll ads
    setupMidRoll(playerId) {
        const player = this.videoPlayers.get(playerId);
        if (!player) return;
        
        const midRollPoints = [];
        const numMidRolls = Math.floor(player.duration / this.config.midRoll.interval);
        
        for (let i = 1; i <= numMidRolls; i++) {
            midRollPoints.push(i * this.config.midRoll.interval);
        }
        
        player.element.addEventListener('timeupdate', () => {
            const currentTime = player.element.currentTime;
            
            midRollPoints.forEach((point, index) => {
                if (currentTime >= point && currentTime < point + 1 && !player[`midRoll${index}Shown`]) {
                    this.showMidRollAd(playerId, index);
                    player[`midRoll${index}Shown`] = true;
                    player.midRollCount++;
                }
            });
        });
    }

    // Show mid-roll ad
    showMidRollAd(playerId, index) {
        const player = this.videoPlayers.get(playerId);
        if (!player) return;
        
        player.element.pause();
        
        // Create mid-roll overlay
        const adOverlay = document.createElement('div');
        adOverlay.className = 'video-ad-overlay midroll';
        adOverlay.innerHTML = `
            <div class="video-ad-container">
                <div class="ad-label">Ad ${index + 1}</div>
                <div class="ad-progress">Your video will resume in <span id="ad-duration">10</span> seconds</div>
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-5635114711353420"
                     data-ad-slot="1234567895"></ins>
            </div>
        `;
        
        player.element.parentNode.insertBefore(adOverlay, player.element);
        
        // Initialize ad
        if (window.adsbygoogle) {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
        
        // Auto-resume after ad
        let adDuration = 10;
        const durationElement = adOverlay.querySelector('#ad-duration');
        
        const durationInterval = setInterval(() => {
            adDuration--;
            durationElement.textContent = adDuration;
            
            if (adDuration <= 0) {
                clearInterval(durationInterval);
                adOverlay.remove();
                player.element.play();
            }
        }, 1000);
        
        // Track impression
        player.impressions++;
    }

    // Integrate YouTube ads
    integrateYouTubeAds() {
        const youtubeEmbeds = document.querySelectorAll('iframe[src*="youtube.com"]');
        
        youtubeEmbeds.forEach(embed => {
            // Enable monetization parameters
            const src = new URL(embed.src);
            src.searchParams.set('enablejsapi', '1');
            src.searchParams.set('modestbranding', '1');
            src.searchParams.set('rel', '0');
            embed.src = src.toString();
            
            // Track YouTube video performance
            this.trackYouTubeVideo(embed);
        });
    }

    // Track YouTube video metrics
    trackYouTubeVideo(iframe) {
        // Implement YouTube API tracking
        if (window.YT && window.YT.Player) {
            const player = new YT.Player(iframe, {
                events: {
                    'onStateChange': (event) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            this.trackVideoEvent('youtube_play', iframe.src);
                        }
                    }
                }
            });
        }
    }

    // Track video metrics
    trackVideoMetrics() {
        setInterval(() => {
            const metrics = this.calculateVideoMetrics();
            this.reportVideoMetrics(metrics);
        }, 60000); // Every minute
    }

    // Calculate video metrics
    calculateVideoMetrics() {
        let totalImpressions = 0;
        let totalRevenue = 0;
        let preRollCount = 0;
        let midRollCount = 0;
        
        this.videoPlayers.forEach(player => {
            totalImpressions += player.impressions;
            totalRevenue += player.revenue;
            if (player.preRollShown) preRollCount++;
            midRollCount += player.midRollCount;
        });
        
        const videoRPM = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
        
        return {
            videoRPM,
            totalImpressions,
            preRollCount,
            midRollCount,
            averageRPM: videoRPM
        };
    }

    // Report video metrics
    reportVideoMetrics(metrics) {
        console.log('Video Ad Metrics:', {
            'Video RPM': `$${metrics.videoRPM.toFixed(2)}`,
            'Pre-roll Ads': metrics.preRollCount,
            'Mid-roll Ads': metrics.midRollCount,
            'Total Impressions': metrics.totalImpressions
        });
        
        // Send to analytics
        if (window.gtag) {
            window.gtag('event', 'video_ad_performance', {
                'event_category': 'video_monetization',
                'video_rpm': metrics.videoRPM,
                'impressions': metrics.totalImpressions
            });
        }
    }

    // Track video events
    trackVideoEvent(eventName, videoId) {
        if (window.gtag) {
            window.gtag('event', eventName, {
                'event_category': 'video',
                'video_id': videoId
            });
        }
    }
}

// Initialize systems
document.addEventListener('DOMContentLoaded', function() {
    window.adOptimizationSystem = new AdOptimizationSystem();
    window.videoAdIntegration = new VideoAdIntegration();
});

// Export for use
window.AdOptimizationSystem = AdOptimizationSystem;
window.VideoAdIntegration = VideoAdIntegration;