// Link Building Strategy Implementation
// Manages internal linking, external partnerships, and link optimization

class LinkBuildingStrategy {
    constructor() {
        this.internalLinks = {
            contextual: {
                'algebra': {
                    url: '/algebra/',
                    anchor: ['algebra help', 'equation solver', 'polynomial calculator'],
                    related: ['quadratic', 'linear', 'exponential', 'logarithmic']
                },
                'calculus': {
                    url: '/calculus/',
                    anchor: ['calculus help', 'derivative calculator', 'integral solver'],
                    related: ['limits', 'differentiation', 'integration', 'series']
                },
                'geometry': {
                    url: '/geometry/',
                    anchor: ['geometry help', 'area calculator', 'volume calculator'],
                    related: ['triangle', 'circle', 'polygon', 'pythagorean']
                },
                'trigonometry': {
                    url: '/trigonometry/',
                    anchor: ['trigonometry help', 'unit circle', 'trig calculator'],
                    related: ['sine', 'cosine', 'tangent', 'identities']
                },
                'statistics': {
                    url: '/statistics/',
                    anchor: ['statistics help', 'probability calculator', 'data analysis'],
                    related: ['mean', 'median', 'standard deviation', 'regression']
                },
                'tools': {
                    url: '/tools/',
                    anchor: ['math calculator', 'online tools', 'free calculators'],
                    related: ['scientific', 'graphing', 'matrix', 'converter']
                },
                'ai-assistant': {
                    url: '/ai-assistant.html',
                    anchor: ['AI math help', 'homework helper', 'problem solver'],
                    related: ['tutor', 'explain', 'step-by-step', 'solution']
                }
            }
        };
        
        this.externalOpportunities = {
            educational: [
                'Khan Academy',
                'MIT OpenCourseWare',
                'Wolfram Alpha',
                'Desmos',
                'GeoGebra'
            ],
            forums: [
                'Math Stack Exchange',
                'Reddit r/learnmath',
                'Physics Forums',
                'Art of Problem Solving'
            ],
            resources: [
                'Wikipedia Mathematics',
                'MathWorld',
                'NCTM',
                'MAA'
            ]
        };
        
        this.init();
    }

    init() {
        this.implementInternalLinking();
        this.createLinkableAssets();
        this.optimizeAnchorText();
        this.setupOutreachTracking();
    }

    // Implement smart internal linking
    implementInternalLinking() {
        // Auto-link content based on keywords
        document.addEventListener('DOMContentLoaded', () => {
            this.autoLinkContent();
            this.createRelatedLinks();
            this.implementBreadcrumbs();
        });
    }

    // Automatically link relevant keywords in content
    autoLinkContent() {
        const contentElements = document.querySelectorAll('.content p, .content li, .math-explanation');
        
        contentElements.forEach(element => {
            let html = element.innerHTML;
            let modified = false;
            
            Object.entries(this.internalLinks.contextual).forEach(([topic, data]) => {
                // Check if we're not on the topic's own page
                if (!window.location.pathname.includes(data.url)) {
                    // Link primary anchors
                    data.anchor.forEach(anchor => {
                        const regex = new RegExp(`\\b(${anchor})\\b(?![^<]*>)`, 'gi');
                        if (regex.test(html)) {
                            html = html.replace(regex, `<a href="${data.url}" title="${topic} resources">$1</a>`);
                            modified = true;
                        }
                    });
                    
                    // Link related terms (first occurrence only)
                    data.related.forEach(term => {
                        const regex = new RegExp(`\\b(${term})\\b(?![^<]*>)`, 'i');
                        const match = html.match(regex);
                        if (match && !html.includes(`href="${data.url}"`)) {
                            html = html.replace(regex, `<a href="${data.url}" title="${topic} - ${term}">$1</a>`);
                            modified = true;
                        }
                    });
                }
            });
            
            if (modified) {
                element.innerHTML = html;
            }
        });
    }

    // Create related links sections
    createRelatedLinks() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        const currentPage = window.location.pathname;
        const relatedTopics = this.getRelatedTopics(currentPage);
        
        if (relatedTopics.length > 0) {
            const relatedSection = document.createElement('div');
            relatedSection.className = 'related-links';
            relatedSection.innerHTML = `
                <h3>Related Topics</h3>
                <ul class="related-links-list">
                    ${relatedTopics.map(topic => `
                        <li><a href="${topic.url}" title="${topic.description}">${topic.title}</a></li>
                    `).join('')}
                </ul>
            `;
            
            mainContent.appendChild(relatedSection);
        }
    }

    // Get related topics based on current page
    getRelatedTopics(currentPath) {
        const topics = [];
        const currentTopic = this.identifyCurrentTopic(currentPath);
        
        // Define topic relationships
        const relationships = {
            'algebra': ['calculus', 'trigonometry', 'tools'],
            'calculus': ['algebra', 'trigonometry', 'tools'],
            'geometry': ['trigonometry', 'algebra', 'tools'],
            'trigonometry': ['geometry', 'calculus', 'tools'],
            'statistics': ['calculus', 'tools', 'ai-assistant'],
            'tools': ['algebra', 'calculus', 'geometry'],
            'ai-assistant': ['tools', 'algebra', 'calculus']
        };
        
        if (relationships[currentTopic]) {
            relationships[currentTopic].forEach(related => {
                const data = this.internalLinks.contextual[related];
                if (data) {
                    topics.push({
                        title: data.anchor[0],
                        url: data.url,
                        description: `Explore ${related} resources and tools`
                    });
                }
            });
        }
        
        return topics;
    }

    // Identify current topic from URL
    identifyCurrentTopic(path) {
        for (const [topic, data] of Object.entries(this.internalLinks.contextual)) {
            if (path.includes(data.url)) {
                return topic;
            }
        }
        return null;
    }

    // Implement breadcrumb navigation
    implementBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;
        
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s);
        
        const breadcrumbs = [{
            name: 'Home',
            url: '/'
        }];
        
        let currentPath = '';
        segments.forEach(segment => {
            currentPath += `/${segment}`;
            breadcrumbs.push({
                name: this.formatSegmentName(segment),
                url: currentPath
            });
        });
        
        // Generate breadcrumb HTML
        breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
            if (index === breadcrumbs.length - 1) {
                return `<span class="breadcrumb-current">${crumb.name}</span>`;
            }
            return `<a href="${crumb.url}" class="breadcrumb-link">${crumb.name}</a>`;
        }).join(' <span class="breadcrumb-separator">›</span> ');
        
        // Add breadcrumb schema
        this.addBreadcrumbSchema(breadcrumbs);
    }

    // Format URL segment to readable name
    formatSegmentName(segment) {
        const mappings = {
            'algebra': 'Algebra',
            'calculus': 'Calculus',
            'geometry': 'Geometry',
            'trigonometry': 'Trigonometry',
            'statistics': 'Statistics',
            'tools': 'Calculators',
            'ai-assistant': 'AI Assistant'
        };
        
        return mappings[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    // Add breadcrumb schema markup
    addBreadcrumbSchema(breadcrumbs) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `https://math.help${crumb.url}`
            }))
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    // Create linkable assets (infographics, tools, etc.)
    createLinkableAssets() {
        this.createEmbeddableCalculators();
        this.createShareableInfographics();
        this.createInteractiveTools();
    }

    // Create embeddable calculator widgets
    createEmbeddableCalculators() {
        const embedCode = `
        <div class="math-help-embed-widget">
            <h4>Embed Our Calculator</h4>
            <p>Share this calculator on your website:</p>
            <textarea class="embed-code" readonly>
<iframe src="https://math.help/embed/calculator" 
        width="400" 
        height="500" 
        frameborder="0"
        title="Math Help Calculator">
</iframe>
            </textarea>
            <button class="copy-embed-btn">Copy Code</button>
        </div>`;
        
        // Add to calculator pages
        document.querySelectorAll('.calculator-widget').forEach(widget => {
            const embedDiv = document.createElement('div');
            embedDiv.innerHTML = embedCode;
            widget.appendChild(embedDiv);
            
            // Copy functionality
            embedDiv.querySelector('.copy-embed-btn').addEventListener('click', function() {
                const textarea = embedDiv.querySelector('.embed-code');
                textarea.select();
                document.execCommand('copy');
                this.textContent = 'Copied!';
                setTimeout(() => this.textContent = 'Copy Code', 2000);
            });
        });
    }

    // Create shareable infographics
    createShareableInfographics() {
        const infographics = [
            {
                title: 'Common Math Formulas',
                url: '/infographics/math-formulas.png',
                embedCode: '<img src="https://math.help/infographics/math-formulas.png" alt="Common Math Formulas - Math Help">'
            },
            {
                title: 'Trigonometry Unit Circle',
                url: '/infographics/unit-circle.png',
                embedCode: '<img src="https://math.help/infographics/unit-circle.png" alt="Trigonometry Unit Circle - Math Help">'
            }
        ];
        
        // Create infographic share section
        const shareSection = document.createElement('div');
        shareSection.className = 'infographic-share';
        shareSection.innerHTML = `
            <h3>Share Our Infographics</h3>
            <p>Free to use with attribution to Math Help</p>
        `;
        
        infographics.forEach(info => {
            const escapedEmbedCode = info.embedCode.replace(/"/g, '&quot;');
            shareSection.innerHTML += `
                <div class="infographic-item">
                    <h4>${info.title}</h4>
                    <textarea class="embed-code" readonly>${info.embedCode}</textarea>
                    <button class="copy-btn" data-embed="${escapedEmbedCode}">Copy Embed Code</button>
                </div>
            `;
        });
    }

    // Create interactive tools that encourage sharing
    createInteractiveTools() {
        const tools = [
            {
                name: 'Math Problem Generator',
                description: 'Generate practice problems with solutions',
                shareText: 'Check out this math problem generator!'
            },
            {
                name: 'Formula Sheet Builder',
                description: 'Create custom formula sheets',
                shareText: 'Create your own math formula sheet!'
            }
        ];
        
        tools.forEach(tool => {
            this.addShareButtons(tool);
        });
    }

    // Add social share buttons
    addShareButtons(item) {
        const shareButtons = `
            <div class="share-buttons">
                <button class="share-btn share-twitter" data-url="${window.location.href}" data-text="${item.shareText}">
                    Share on Twitter
                </button>
                <button class="share-btn share-facebook" data-url="${window.location.href}">
                    Share on Facebook
                </button>
                <button class="share-btn share-linkedin" data-url="${window.location.href}" data-text="${item.shareText}">
                    Share on LinkedIn
                </button>
                <button class="share-btn share-email" data-subject="Check out ${item.name}" data-body="${item.shareText} ${window.location.href}">
                    Email
                </button>
            </div>
        `;
        
        // Add event listeners for share buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-btn')) {
                this.handleShare(e.target);
            }
        });
    }

    // Handle share button clicks
    handleShare(button) {
        const url = button.dataset.url || window.location.href;
        const text = button.dataset.text || 'Check out Math Help!';
        
        if (button.classList.contains('share-twitter')) {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        } else if (button.classList.contains('share-facebook')) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (button.classList.contains('share-linkedin')) {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        } else if (button.classList.contains('share-email')) {
            const subject = button.dataset.subject || 'Check out Math Help';
            const body = button.dataset.body || `I found this helpful: ${url}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    }

    // Optimize anchor text distribution
    optimizeAnchorText() {
        const anchorTexts = new Map();
        
        // Analyze current anchor text distribution
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            if (!anchorTexts.has(href)) {
                anchorTexts.set(href, []);
            }
            anchorTexts.get(href).push(text);
        });
        
        // Ensure diverse anchor text
        anchorTexts.forEach((texts, href) => {
            const uniqueTexts = [...new Set(texts)];
            if (uniqueTexts.length < 3) {
                console.warn(`Low anchor text diversity for ${href}:`, uniqueTexts);
            }
        });
    }

    // Setup outreach tracking
    setupOutreachTracking() {
        // Track external link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes(window.location.hostname)) {
                this.trackOutboundLink(link.href);
            }
        });
        
        // Track backlink opportunities
        this.identifyBacklinkOpportunities();
    }

    // Track outbound links
    trackOutboundLink(url) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'outbound',
                'event_label': url
            });
        }
    }

    // Identify backlink opportunities
    identifyBacklinkOpportunities() {
        const opportunities = [];
        
        // Check for brand mentions without links
        const textNodes = document.evaluate(
            "//text()[contains(., 'Math Help') or contains(., 'math help')]",
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        
        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            const parent = node.parentElement;
            
            if (parent && parent.tagName !== 'A') {
                opportunities.push({
                    type: 'unlinked-mention',
                    text: node.textContent,
                    element: parent
                });
            }
        }
        
        return opportunities;
    }

    // Generate link building report
    generateLinkReport() {
        const report = {
            internal: {
                total: document.querySelectorAll('a[href^="/"]').length,
                unique: new Set(Array.from(document.querySelectorAll('a[href^="/"]')).map(a => a.href)).size,
                distribution: this.getInternalLinkDistribution()
            },
            external: {
                total: document.querySelectorAll('a[href^="http"]:not([href*="math.help"])').length,
                domains: this.getExternalDomains()
            },
            opportunities: this.identifyBacklinkOpportunities()
        };
        
        return report;
    }

    // Get internal link distribution
    getInternalLinkDistribution() {
        const distribution = {};
        
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const href = link.getAttribute('href');
            distribution[href] = (distribution[href] || 0) + 1;
        });
        
        return distribution;
    }

    // Get external domains linked to
    getExternalDomains() {
        const domains = new Set();
        
        document.querySelectorAll('a[href^="http"]:not([href*="math.help"])').forEach(link => {
            try {
                const url = new URL(link.href);
                domains.add(url.hostname);
            } catch (e) {
                console.error('Invalid URL:', link.href);
            }
        });
        
        return Array.from(domains);
    }
}

// Initialize link building strategy
document.addEventListener('DOMContentLoaded', function() {
    window.linkBuildingStrategy = new LinkBuildingStrategy();
});