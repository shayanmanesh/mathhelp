/* Math Help A/B Testing Framework for Content Optimization */

class ABTestingFramework {
    constructor() {
        this.config = {
            tests: {
                maxConcurrent: 5,
                minSampleSize: 100,
                confidenceLevel: 0.95,
                defaultDuration: 14 // days
            },
            
            variations: {
                maxPerTest: 4,
                trafficSplitTolerance: 0.02 // 2% tolerance
            },
            
            metrics: {
                primary: ['conversion_rate', 'engagement_score', 'revenue_per_visitor'],
                secondary: ['bounce_rate', 'time_on_site', 'pages_per_session']
            },
            
            storage: {
                prefix: 'abtest_',
                cookieDuration: 30 // days
            }
        };
        
        this.activeTests = new Map();
        this.testResults = new Map();
        this.userAssignments = new Map();
        
        this.init();
    }
    
    init() {
        this.loadActiveTests();
        this.loadTestResults();
        this.initializeUserTracking();
        this.setupEventListeners();
        
        console.log('🧪 A/B Testing Framework Initialized');
    }
    
    // ===== TEST CREATION =====
    
    createTest(testConfig) {
        const test = {
            id: this.generateTestId(),
            name: testConfig.name,
            description: testConfig.description,
            status: 'draft',
            created: new Date().toISOString(),
            
            variations: this.validateVariations(testConfig.variations),
            
            targeting: {
                audience: testConfig.audience || 'all',
                conditions: testConfig.conditions || [],
                percentage: testConfig.percentage || 100
            },
            
            metrics: {
                primary: testConfig.primaryMetric,
                secondary: testConfig.secondaryMetrics || [],
                goals: testConfig.goals || {}
            },
            
            schedule: {
                startDate: testConfig.startDate || new Date().toISOString(),
                endDate: testConfig.endDate || this.calculateEndDate(testConfig.duration),
                duration: testConfig.duration || this.config.tests.defaultDuration
            },
            
            allocation: this.generateTrafficAllocation(testConfig.variations)
        };
        
        this.validateTest(test);
        this.activeTests.set(test.id, test);
        this.saveTests();
        
        return test;
    }
    
    validateVariations(variations) {
        if (!variations || variations.length < 2) {
            throw new Error('A/B test must have at least 2 variations');
        }
        
        if (variations.length > this.config.variations.maxPerTest) {
            throw new Error(`Maximum ${this.config.variations.maxPerTest} variations allowed`);
        }
        
        return variations.map((variation, index) => ({
            id: `var_${index}`,
            name: variation.name || `Variation ${index}`,
            description: variation.description,
            changes: variation.changes || {},
            isControl: index === 0,
            weight: variation.weight || (100 / variations.length)
        }));
    }
    
    generateTrafficAllocation(variations) {
        const totalWeight = variations.reduce((sum, v) => sum + (v.weight || 100 / variations.length), 0);
        
        let cumulativeWeight = 0;
        return variations.map((variation, index) => {
            const weight = (variation.weight || 100 / variations.length) / totalWeight;
            const range = {
                min: cumulativeWeight,
                max: cumulativeWeight + weight
            };
            cumulativeWeight += weight;
            
            return {
                variationId: `var_${index}`,
                weight: weight,
                range: range
            };
        });
    }
    
    // ===== TEST MANAGEMENT =====
    
    startTest(testId) {
        const test = this.activeTests.get(testId);
        if (!test) {
            throw new Error(`Test ${testId} not found`);
        }
        
        if (test.status === 'running') {
            throw new Error(`Test ${testId} is already running`);
        }
        
        test.status = 'running';
        test.startedAt = new Date().toISOString();
        
        this.initializeTestTracking(test);
        this.saveTests();
        
        console.log(`🚀 Started A/B test: ${test.name}`);
        return test;
    }
    
    pauseTest(testId) {
        const test = this.activeTests.get(testId);
        if (!test || test.status !== 'running') {
            throw new Error(`Cannot pause test ${testId}`);
        }
        
        test.status = 'paused';
        test.pausedAt = new Date().toISOString();
        
        this.saveTests();
        console.log(`⏸️  Paused A/B test: ${test.name}`);
        return test;
    }
    
    stopTest(testId, reason = 'manual') {
        const test = this.activeTests.get(testId);
        if (!test) {
            throw new Error(`Test ${testId} not found`);
        }
        
        test.status = 'completed';
        test.completedAt = new Date().toISOString();
        test.completionReason = reason;
        
        // Calculate final results
        const results = this.calculateTestResults(testId);
        test.results = results;
        
        // Move to results storage
        this.testResults.set(testId, test);
        this.activeTests.delete(testId);
        
        this.saveTests();
        this.saveResults();
        
        console.log(`🏁 Completed A/B test: ${test.name}`);
        return results;
    }
    
    // ===== USER ASSIGNMENT =====
    
    assignUserToVariation(userId, testId) {
        const test = this.activeTests.get(testId);
        if (!test || test.status !== 'running') {
            return null;
        }
        
        // Check if user already assigned
        const existingAssignment = this.getUserAssignment(userId, testId);
        if (existingAssignment) {
            return existingAssignment;
        }
        
        // Check targeting conditions
        if (!this.checkTargeting(userId, test.targeting)) {
            return null;
        }
        
        // Random assignment based on traffic allocation
        const random = this.hashUserId(userId + testId);
        const variation = this.selectVariation(test.allocation, random);
        
        // Store assignment
        this.storeAssignment(userId, testId, variation.variationId);
        
        return variation;
    }
    
    getUserAssignment(userId, testId) {
        const key = `${userId}_${testId}`;
        return this.userAssignments.get(key);
    }
    
    storeAssignment(userId, testId, variationId) {
        const key = `${userId}_${testId}`;
        const assignment = {
            userId: userId,
            testId: testId,
            variationId: variationId,
            assignedAt: new Date().toISOString()
        };
        
        this.userAssignments.set(key, assignment);
        
        // Also store in cookie for persistence
        this.setCookie(`${this.config.storage.prefix}${testId}`, variationId, this.config.storage.cookieDuration);
        
        // Track assignment event
        this.trackEvent('assignment', testId, variationId, { userId });
    }
    
    selectVariation(allocation, random) {
        for (const alloc of allocation) {
            if (random >= alloc.range.min && random < alloc.range.max) {
                return alloc;
            }
        }
        // Fallback to first variation
        return allocation[0];
    }
    
    hashUserId(userId) {
        // Simple hash function for consistent assignment
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash) / 2147483647; // Normalize to 0-1
    }
    
    // ===== TRACKING & METRICS =====
    
    trackEvent(eventType, testId, variationId, data = {}) {
        const test = this.activeTests.get(testId);
        if (!test) return;
        
        const event = {
            type: eventType,
            testId: testId,
            variationId: variationId,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        // Store event
        this.storeEvent(event);
        
        // Update metrics
        this.updateMetrics(test, variationId, eventType, data);
        
        // Check for statistical significance
        if (this.shouldCheckSignificance(test)) {
            this.checkStatisticalSignificance(test);
        }
    }
    
    updateMetrics(test, variationId, eventType, data) {
        if (!test.metrics.data) {
            test.metrics.data = {};
        }
        
        if (!test.metrics.data[variationId]) {
            test.metrics.data[variationId] = {
                impressions: 0,
                conversions: 0,
                revenue: 0,
                engagement: 0,
                bounces: 0,
                timeOnSite: 0,
                pagesViewed: 0
            };
        }
        
        const metrics = test.metrics.data[variationId];
        
        switch (eventType) {
            case 'assignment':
                metrics.impressions++;
                break;
                
            case 'conversion':
                metrics.conversions++;
                if (data.value) metrics.revenue += data.value;
                break;
                
            case 'engagement':
                metrics.engagement++;
                if (data.timeOnSite) metrics.timeOnSite += data.timeOnSite;
                if (data.pagesViewed) metrics.pagesViewed += data.pagesViewed;
                break;
                
            case 'bounce':
                metrics.bounces++;
                break;
        }
        
        // Calculate derived metrics
        metrics.conversionRate = metrics.conversions / (metrics.impressions || 1);
        metrics.engagementRate = metrics.engagement / (metrics.impressions || 1);
        metrics.bounceRate = metrics.bounces / (metrics.impressions || 1);
        metrics.avgTimeOnSite = metrics.timeOnSite / (metrics.engagement || 1);
        metrics.avgPagesViewed = metrics.pagesViewed / (metrics.engagement || 1);
        metrics.revenuePerVisitor = metrics.revenue / (metrics.impressions || 1);
    }
    
    // ===== STATISTICAL ANALYSIS =====
    
    calculateTestResults(testId) {
        const test = this.activeTests.get(testId) || this.testResults.get(testId);
        if (!test || !test.metrics.data) return null;
        
        const results = {
            testId: testId,
            testName: test.name,
            status: test.status,
            duration: this.calculateDuration(test),
            variations: []
        };
        
        // Get control variation
        const control = test.variations.find(v => v.isControl);
        const controlData = test.metrics.data[control.id];
        
        // Calculate results for each variation
        for (const variation of test.variations) {
            const data = test.metrics.data[variation.id] || {};
            
            const varResult = {
                id: variation.id,
                name: variation.name,
                isControl: variation.isControl,
                
                metrics: {
                    impressions: data.impressions || 0,
                    conversions: data.conversions || 0,
                    conversionRate: data.conversionRate || 0,
                    revenue: data.revenue || 0,
                    revenuePerVisitor: data.revenuePerVisitor || 0,
                    engagementRate: data.engagementRate || 0,
                    bounceRate: data.bounceRate || 0
                },
                
                comparison: variation.isControl ? null : this.compareToControl(data, controlData),
                
                confidence: variation.isControl ? null : this.calculateConfidence(data, controlData)
            };
            
            results.variations.push(varResult);
        }
        
        // Determine winner
        results.winner = this.determineWinner(results.variations);
        results.recommendation = this.generateRecommendation(results);
        
        return results;
    }
    
    compareToControl(variationData, controlData) {
        const comparison = {};
        
        // Conversion rate lift
        const controlCR = controlData.conversionRate || 0;
        const variationCR = variationData.conversionRate || 0;
        comparison.conversionLift = controlCR > 0 ? ((variationCR - controlCR) / controlCR) : 0;
        
        // Revenue lift
        const controlRPV = controlData.revenuePerVisitor || 0;
        const variationRPV = variationData.revenuePerVisitor || 0;
        comparison.revenueLift = controlRPV > 0 ? ((variationRPV - controlRPV) / controlRPV) : 0;
        
        // Engagement lift
        const controlER = controlData.engagementRate || 0;
        const variationER = variationData.engagementRate || 0;
        comparison.engagementLift = controlER > 0 ? ((variationER - controlER) / controlER) : 0;
        
        return comparison;
    }
    
    calculateConfidence(variationData, controlData) {
        // Z-test for conversion rate difference
        const n1 = controlData.impressions || 1;
        const n2 = variationData.impressions || 1;
        const p1 = controlData.conversionRate || 0;
        const p2 = variationData.conversionRate || 0;
        
        const pooledP = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
        const se = Math.sqrt(pooledP * (1 - pooledP) * ((1/n1) + (1/n2)));
        
        if (se === 0) return 0;
        
        const z = (p2 - p1) / se;
        const confidence = this.normalCDF(Math.abs(z)) * 2 - 1;
        
        return confidence;
    }
    
    normalCDF(z) {
        // Approximation of normal cumulative distribution function
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        
        const sign = z < 0 ? -1 : 1;
        z = Math.abs(z) / Math.sqrt(2);
        
        const t = 1.0 / (1.0 + p * z);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
        
        return 0.5 * (1.0 + sign * y);
    }
    
    determineWinner(variations) {
        const nonControlVariations = variations.filter(v => !v.isControl);
        
        let winner = null;
        let maxLift = 0;
        
        for (const variation of nonControlVariations) {
            if (variation.confidence >= this.config.tests.confidenceLevel && 
                variation.comparison.conversionLift > maxLift) {
                winner = variation;
                maxLift = variation.comparison.conversionLift;
            }
        }
        
        return winner;
    }
    
    generateRecommendation(results) {
        if (!results.winner) {
            return {
                action: 'continue',
                message: 'No significant winner yet. Continue testing to gather more data.'
            };
        }
        
        const lift = results.winner.comparison.conversionLift;
        const confidence = results.winner.confidence;
        
        return {
            action: 'implement',
            message: `Implement ${results.winner.name}. It shows a ${(lift * 100).toFixed(1)}% conversion lift with ${(confidence * 100).toFixed(1)}% confidence.`,
            expectedImpact: {
                conversions: `+${(lift * 100).toFixed(1)}%`,
                revenue: `+${(results.winner.comparison.revenueLift * 100).toFixed(1)}%`
            }
        };
    }
    
    // ===== CONTENT OPTIMIZATION TESTS =====
    
    createContentTest(config) {
        return this.createTest({
            name: config.name,
            description: config.description,
            primaryMetric: 'engagement_rate',
            secondaryMetrics: ['time_on_site', 'bounce_rate'],
            
            variations: config.variations.map(v => ({
                name: v.name,
                changes: {
                    content: v.content,
                    style: v.style,
                    layout: v.layout
                }
            })),
            
            audience: config.audience || 'all',
            duration: config.duration || 14
        });
    }
    
    createHeadlineTest(headlines) {
        return this.createTest({
            name: 'Headline Optimization Test',
            description: 'Testing different headline variations for engagement',
            primaryMetric: 'engagement_rate',
            
            variations: headlines.map((headline, index) => ({
                name: `Headline ${index + 1}`,
                changes: {
                    headline: headline,
                    selector: 'h1.site-title'
                }
            }))
        });
    }
    
    createCTATest(buttons) {
        return this.createTest({
            name: 'CTA Button Test',
            description: 'Testing different call-to-action button variations',
            primaryMetric: 'conversion_rate',
            
            variations: buttons.map((button, index) => ({
                name: `CTA ${index + 1}`,
                changes: {
                    text: button.text,
                    color: button.color,
                    size: button.size,
                    selector: '.cta-button'
                }
            }))
        });
    }
    
    createLayoutTest(layouts) {
        return this.createTest({
            name: 'Layout Optimization Test',
            description: 'Testing different page layout variations',
            primaryMetric: 'engagement_rate',
            secondaryMetrics: ['conversion_rate', 'time_on_site'],
            
            variations: layouts.map((layout, index) => ({
                name: layout.name,
                changes: {
                    layout: layout.structure,
                    css: layout.styles
                }
            }))
        });
    }
    
    // ===== RENDERING & APPLICATION =====
    
    applyVariation(variationId, testId) {
        const test = this.activeTests.get(testId);
        if (!test) return;
        
        const variation = test.variations.find(v => v.id === variationId);
        if (!variation || variation.isControl) return;
        
        // Apply content changes
        if (variation.changes.content) {
            this.applyContentChanges(variation.changes.content);
        }
        
        // Apply style changes
        if (variation.changes.style) {
            this.applyStyleChanges(variation.changes.style);
        }
        
        // Apply layout changes
        if (variation.changes.layout) {
            this.applyLayoutChanges(variation.changes.layout);
        }
        
        // Apply specific element changes
        if (variation.changes.selector && variation.changes.text) {
            const element = document.querySelector(variation.changes.selector);
            if (element) {
                element.textContent = variation.changes.text;
            }
        }
    }
    
    applyContentChanges(content) {
        if (content.headline) {
            const headline = document.querySelector('h1');
            if (headline) headline.textContent = content.headline;
        }
        
        if (content.description) {
            const description = document.querySelector('.tagline');
            if (description) description.textContent = content.description;
        }
        
        if (content.features) {
            // Apply feature content changes
            content.features.forEach((feature, index) => {
                const featureEl = document.querySelector(`.feature-${index}`);
                if (featureEl) {
                    featureEl.querySelector('h3').textContent = feature.title;
                    featureEl.querySelector('p').textContent = feature.description;
                }
            });
        }
    }
    
    applyStyleChanges(styles) {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-abtest', 'true');
        
        let css = '';
        for (const [selector, rules] of Object.entries(styles)) {
            css += `${selector} { ${rules} }\n`;
        }
        
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    applyLayoutChanges(layout) {
        // Apply layout-specific changes
        if (layout.gridTemplate) {
            const container = document.querySelector('.container');
            if (container) {
                container.style.gridTemplate = layout.gridTemplate;
            }
        }
        
        if (layout.componentOrder) {
            // Reorder components
            layout.componentOrder.forEach((componentId, index) => {
                const component = document.getElementById(componentId);
                if (component) {
                    component.style.order = index;
                }
            });
        }
    }
    
    // ===== UTILITIES =====
    
    generateTestId() {
        return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    calculateEndDate(duration) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (duration || this.config.tests.defaultDuration));
        return endDate.toISOString();
    }
    
    calculateDuration(test) {
        const start = new Date(test.startedAt || test.created);
        const end = new Date(test.completedAt || Date.now());
        return Math.floor((end - start) / (1000 * 60 * 60 * 24)); // Days
    }
    
    validateTest(test) {
        if (!test.name || !test.variations || test.variations.length < 2) {
            throw new Error('Invalid test configuration');
        }
        
        const totalWeight = test.allocation.reduce((sum, a) => sum + a.weight, 0);
        if (Math.abs(totalWeight - 1) > this.config.variations.trafficSplitTolerance) {
            throw new Error('Traffic allocation weights must sum to 100%');
        }
    }
    
    checkTargeting(userId, targeting) {
        if (targeting.audience === 'all') return true;
        
        // Check custom conditions
        for (const condition of targeting.conditions) {
            if (!this.evaluateCondition(userId, condition)) {
                return false;
            }
        }
        
        // Check percentage targeting
        if (targeting.percentage < 100) {
            const hash = this.hashUserId(userId);
            return hash < (targeting.percentage / 100);
        }
        
        return true;
    }
    
    evaluateCondition(userId, condition) {
        // Placeholder for custom condition evaluation
        // Would integrate with user data/analytics
        return true;
    }
    
    shouldCheckSignificance(test) {
        // Check every 100 impressions or daily
        const totalImpressions = Object.values(test.metrics.data || {})
            .reduce((sum, data) => sum + (data.impressions || 0), 0);
        
        return totalImpressions % 100 === 0;
    }
    
    checkStatisticalSignificance(test) {
        const results = this.calculateTestResults(test.id);
        
        if (results.winner) {
            console.log(`🎯 Statistical significance reached for test: ${test.name}`);
            console.log(`Winner: ${results.winner.name} with ${(results.winner.comparison.conversionLift * 100).toFixed(1)}% lift`);
            
            // Optionally auto-stop test
            if (test.autoStop) {
                this.stopTest(test.id, 'significance_reached');
            }
        }
    }
    
    // ===== PERSISTENCE =====
    
    saveTests() {
        const tests = Array.from(this.activeTests.values());
        localStorage.setItem('ab_active_tests', JSON.stringify(tests));
    }
    
    saveResults() {
        const results = Array.from(this.testResults.values());
        localStorage.setItem('ab_test_results', JSON.stringify(results));
    }
    
    loadActiveTests() {
        try {
            const stored = localStorage.getItem('ab_active_tests');
            if (stored) {
                const tests = JSON.parse(stored);
                tests.forEach(test => this.activeTests.set(test.id, test));
            }
        } catch (e) {
            console.error('Error loading active tests:', e);
        }
    }
    
    loadTestResults() {
        try {
            const stored = localStorage.getItem('ab_test_results');
            if (stored) {
                const results = JSON.parse(stored);
                results.forEach(result => this.testResults.set(result.id, result));
            }
        } catch (e) {
            console.error('Error loading test results:', e);
        }
    }
    
    storeEvent(event) {
        // In production, would send to analytics backend
        const events = JSON.parse(localStorage.getItem('ab_events') || '[]');
        events.push(event);
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        localStorage.setItem('ab_events', JSON.stringify(events));
    }
    
    // ===== USER TRACKING =====
    
    initializeUserTracking() {
        // Get or create user ID
        this.userId = this.getUserId();
        
        // Apply any active test variations
        this.applyActiveTests();
    }
    
    getUserId() {
        let userId = this.getCookie('ab_user_id');
        
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.setCookie('ab_user_id', userId, 365);
        }
        
        return userId;
    }
    
    applyActiveTests() {
        for (const [testId, test] of this.activeTests) {
            if (test.status === 'running') {
                const variation = this.assignUserToVariation(this.userId, testId);
                if (variation) {
                    this.applyVariation(variation.variationId, testId);
                }
            }
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    setupEventListeners() {
        // Track conversions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cta-button, .calculator-button, .tool-link')) {
                this.trackConversion();
            }
        });
        
        // Track engagement
        let engagementTimer = null;
        let startTime = Date.now();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEngagement(Date.now() - startTime);
            } else {
                startTime = Date.now();
            }
        });
        
        // Track bounces
        let interacted = false;
        ['click', 'scroll', 'keypress'].forEach(event => {
            document.addEventListener(event, () => {
                interacted = true;
            }, { once: true });
        });
        
        window.addEventListener('beforeunload', () => {
            if (!interacted) {
                this.trackBounce();
            }
        });
    }
    
    trackConversion(value = 0) {
        for (const [testId, test] of this.activeTests) {
            if (test.status === 'running') {
                const assignment = this.getUserAssignment(this.userId, testId);
                if (assignment) {
                    this.trackEvent('conversion', testId, assignment.variationId, { value });
                }
            }
        }
    }
    
    trackEngagement(timeOnSite) {
        for (const [testId, test] of this.activeTests) {
            if (test.status === 'running') {
                const assignment = this.getUserAssignment(this.userId, testId);
                if (assignment) {
                    this.trackEvent('engagement', testId, assignment.variationId, { 
                        timeOnSite: timeOnSite / 1000,
                        pagesViewed: window.pageViewCount || 1
                    });
                }
            }
        }
    }
    
    trackBounce() {
        for (const [testId, test] of this.activeTests) {
            if (test.status === 'running') {
                const assignment = this.getUserAssignment(this.userId, testId);
                if (assignment) {
                    this.trackEvent('bounce', testId, assignment.variationId);
                }
            }
        }
    }
    
    // ===== COOKIE UTILITIES =====
    
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // ===== PUBLIC API =====
    
    getActiveTests() {
        return Array.from(this.activeTests.values());
    }
    
    getTestResults(testId) {
        if (testId) {
            return this.testResults.get(testId) || this.calculateTestResults(testId);
        }
        return Array.from(this.testResults.values());
    }
    
    createQuickTest(type, options) {
        switch (type) {
            case 'headline':
                return this.createHeadlineTest(options.headlines);
            case 'cta':
                return this.createCTATest(options.buttons);
            case 'layout':
                return this.createLayoutTest(options.layouts);
            default:
                return this.createContentTest(options);
        }
    }
}

// Initialize A/B Testing Framework
window.abTesting = new ABTestingFramework();

// Export convenience functions
window.createABTest = (config) => window.abTesting.createTest(config);
window.startABTest = (testId) => window.abTesting.startTest(testId);
window.getABTestResults = (testId) => window.abTesting.getTestResults(testId);

console.log('🧪 A/B Testing Framework loaded. Use window.createABTest() to create tests.');