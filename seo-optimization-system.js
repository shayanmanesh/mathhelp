// SEO Optimization System - Comprehensive SEO and metadata management
// Handles title tags, meta descriptions, canonical URLs, Open Graph, Twitter Cards, and Schema markup

class SEOOptimizationSystem {
    constructor() {
        this.config = {
            site: {
                name: 'Math Help',
                url: 'https://math.help',
                logo: 'https://math.help/images/logo.png',
                description: 'Free online math help, tools, and resources',
                keywords: 'mathematics, math help, algebra, calculus, geometry, trigonometry, statistics',
                author: 'Math Help Team',
                twitter: '@mathhelp',
                facebook: 'https://facebook.com/mathhelp'
            },
            titleLength: { min: 50, max: 60 },
            descriptionLength: { min: 120, max: 160 },
            defaultImage: 'https://math.help/images/math-help-og.jpg'
        };
        
        this.pageMetadata = this.initializePageMetadata();
    }

    initializePageMetadata() {
        return {
            'index.html': {
                title: 'Math Help - Free Online Mathematics Help & Tools',
                description: 'Get instant math help with our free tools, calculators, and step-by-step solutions for algebra, calculus, geometry, and more.',
                keywords: 'math help, online calculator, algebra solver, calculus help, free math tools',
                type: 'website',
                image: '/images/home-og.jpg'
            },
            'algebra/index.html': {
                title: 'Algebra Help - Equations, Functions & Graphing Tools',
                description: 'Master algebra with our comprehensive guides, equation solvers, and graphing calculators. Free step-by-step solutions included.',
                keywords: 'algebra help, equation solver, polynomial calculator, quadratic formula',
                type: 'article',
                image: '/images/algebra-og.jpg'
            },
            'calculus/index.html': {
                title: 'Calculus Help - Derivatives, Integrals & Limits',
                description: 'Learn calculus with interactive tools for derivatives, integrals, and limits. Free calculators with step-by-step solutions.',
                keywords: 'calculus help, derivative calculator, integral solver, limits',
                type: 'article',
                image: '/images/calculus-og.jpg'
            },
            'geometry/index.html': {
                title: 'Geometry Help - Shapes, Proofs & 3D Calculators',
                description: 'Explore geometry with interactive tools for shapes, angles, and proofs. Calculate area, volume, and perimeter instantly.',
                keywords: 'geometry help, area calculator, volume calculator, angle solver',
                type: 'article',
                image: '/images/geometry-og.jpg'
            },
            'trigonometry/index.html': {
                title: 'Trigonometry Help - Sin, Cos, Tan & Unit Circle',
                description: 'Master trigonometry with our unit circle tool, trig calculators, and identity solvers. Free practice problems included.',
                keywords: 'trigonometry help, unit circle, trig calculator, sine cosine tangent',
                type: 'article',
                image: '/images/trigonometry-og.jpg'
            },
            'statistics/index.html': {
                title: 'Statistics Help - Probability & Data Analysis Tools',
                description: 'Learn statistics with calculators for mean, median, standard deviation, and probability. Free statistical analysis tools.',
                keywords: 'statistics help, probability calculator, standard deviation, data analysis',
                type: 'article',
                image: '/images/statistics-og.jpg'
            },
            'tools/index.html': {
                title: 'Math Calculators - Free Online Mathematical Tools',
                description: 'Access 50+ free math calculators for algebra, calculus, geometry, and more. Instant results with step-by-step solutions.',
                keywords: 'math calculator, online calculator, scientific calculator, graphing calculator',
                type: 'webapp',
                image: '/images/tools-og.jpg'
            },
            'news/index.html': {
                title: 'Math News - Latest Mathematical Discoveries & Research',
                description: 'Stay updated with breaking mathematical news, research breakthroughs, and educational insights. Updated every 5 minutes.',
                keywords: 'math news, mathematical research, math discoveries, mathematics updates',
                type: 'article',
                image: '/images/news-og.jpg'
            },
            'ai-assistant.html': {
                title: 'AI Math Assistant - Instant Problem Solving Help',
                description: 'Get instant help from our AI-powered math assistant. Upload problems, get explanations, and learn step-by-step solutions.',
                keywords: 'AI math help, math assistant, problem solver, homework help',
                type: 'webapp',
                image: '/images/ai-assistant-og.jpg'
            }
        };
    }

    // Generate optimized title tag
    generateTitle(page, customTitle = null) {
        let title = customTitle || this.pageMetadata[page]?.title || 'Math Help - Free Online Math Help';
        
        // Ensure title length is between 50-60 characters
        if (title.length > this.config.titleLength.max) {
            title = title.substring(0, this.config.titleLength.max - 3) + '...';
        } else if (title.length < this.config.titleLength.min) {
            title += ' | Math Help';
        }
        
        return title;
    }

    // Generate optimized meta description
    generateDescription(page, customDescription = null) {
        let description = customDescription || this.pageMetadata[page]?.description || this.config.site.description;
        
        // Ensure description length is between 120-160 characters
        if (description.length > this.config.descriptionLength.max) {
            description = description.substring(0, this.config.descriptionLength.max - 3) + '...';
        } else if (description.length < this.config.descriptionLength.min) {
            description += ' Free tools and resources at Math Help.';
        }
        
        return description;
    }

    // Generate canonical URL
    generateCanonicalURL(page) {
        // Remove index.html from URL for cleaner canonicals
        const cleanPath = page.replace('index.html', '');
        return `${this.config.site.url}/${cleanPath}`;
    }

    // Generate complete meta tags for a page
    generateMetaTags(page, options = {}) {
        const title = this.generateTitle(page, options.title);
        const description = this.generateDescription(page, options.description);
        const canonicalURL = this.generateCanonicalURL(page);
        const keywords = options.keywords || this.pageMetadata[page]?.keywords || this.config.site.keywords;
        const type = options.type || this.pageMetadata[page]?.type || 'website';
        const image = options.image || this.pageMetadata[page]?.image || this.config.defaultImage;

        return `
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${this.config.site.author}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${canonicalURL}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${canonicalURL}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${this.config.site.url}${image}">
    <meta property="og:site_name" content="${this.config.site.name}">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalURL}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${this.config.site.url}${image}">
    <meta property="twitter:site" content="${this.config.site.twitter}">
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">`;
    }

    // Generate Local Business Schema markup
    generateLocalBusinessSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Math Help",
            "url": this.config.site.url,
            "logo": this.config.site.logo,
            "description": this.config.site.description,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
            },
            "sameAs": [
                this.config.site.facebook,
                `https://twitter.com/${this.config.site.twitter.substring(1)}`
            ],
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${this.config.site.url}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };
    }

    // Generate WebSite Schema markup for search
    generateWebSiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.config.site.name,
            "url": this.config.site.url,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${this.config.site.url}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };
    }

    // Generate BreadcrumbList Schema
    generateBreadcrumbSchema(breadcrumbs) {
        const items = breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `${this.config.site.url}${crumb.url}`
        }));

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }

    // Generate Article Schema for content pages
    generateArticleSchema(articleData) {
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": articleData.title,
            "description": articleData.description,
            "image": `${this.config.site.url}${articleData.image}`,
            "author": {
                "@type": "Organization",
                "name": this.config.site.author
            },
            "publisher": {
                "@type": "Organization",
                "name": this.config.site.name,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.config.site.logo
                }
            },
            "datePublished": articleData.datePublished || new Date().toISOString(),
            "dateModified": articleData.dateModified || new Date().toISOString()
        };
    }

    // Generate complete Schema.org script tag
    generateSchemaScript(schemas) {
        const schemaArray = Array.isArray(schemas) ? schemas : [schemas];
        return `<script type="application/ld+json">
${JSON.stringify(schemaArray.length > 1 ? schemaArray : schemaArray[0], null, 2)}
</script>`;
    }

    // Link Building Strategy Implementation
    generateInternalLinks(currentPage, content) {
        const linkOpportunities = {
            'algebra': {
                url: '/algebra/',
                keywords: ['algebra', 'equation', 'polynomial', 'quadratic', 'linear']
            },
            'calculus': {
                url: '/calculus/',
                keywords: ['calculus', 'derivative', 'integral', 'limit', 'differentiation']
            },
            'geometry': {
                url: '/geometry/',
                keywords: ['geometry', 'shape', 'angle', 'triangle', 'circle', 'area', 'volume']
            },
            'trigonometry': {
                url: '/trigonometry/',
                keywords: ['trigonometry', 'sine', 'cosine', 'tangent', 'trig', 'angle']
            },
            'statistics': {
                url: '/statistics/',
                keywords: ['statistics', 'probability', 'mean', 'median', 'standard deviation']
            },
            'tools': {
                url: '/tools/',
                keywords: ['calculator', 'solve', 'compute', 'calculate', 'tool']
            },
            'ai-assistant': {
                url: '/ai-assistant.html',
                keywords: ['AI', 'assistant', 'help', 'tutor', 'explain']
            }
        };

        let enhancedContent = content;
        
        Object.entries(linkOpportunities).forEach(([section, data]) => {
            // Don't link to current page
            if (!currentPage.includes(data.url)) {
                data.keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, 'gi');
                    const replacement = `<a href="${data.url}" title="${section} help">$1</a>`;
                    
                    // Only replace first occurrence to avoid over-linking
                    enhancedContent = enhancedContent.replace(regex, (match, p1, offset, string) => {
                        // Check if this keyword has already been linked
                        const before = string.substring(0, offset);
                        if (before.includes(`href="${data.url}"`)) {
                            return match;
                        }
                        return replacement;
                    });
                });
            }
        });
        
        return enhancedContent;
    }

    // Generate sitemap entry
    generateSitemapEntry(page, priority = 0.5, changefreq = 'weekly') {
        return {
            url: this.generateCanonicalURL(page),
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: changefreq,
            priority: priority
        };
    }

    // Check SEO issues
    checkSEOIssues(page) {
        const issues = [];
        const metadata = this.pageMetadata[page];
        
        if (!metadata) {
            issues.push('Page metadata not defined');
            return issues;
        }
        
        // Check title length
        if (metadata.title.length < this.config.titleLength.min) {
            issues.push(`Title too short (${metadata.title.length} chars, min ${this.config.titleLength.min})`);
        } else if (metadata.title.length > this.config.titleLength.max) {
            issues.push(`Title too long (${metadata.title.length} chars, max ${this.config.titleLength.max})`);
        }
        
        // Check description length
        if (metadata.description.length < this.config.descriptionLength.min) {
            issues.push(`Description too short (${metadata.description.length} chars, min ${this.config.descriptionLength.min})`);
        } else if (metadata.description.length > this.config.descriptionLength.max) {
            issues.push(`Description too long (${metadata.description.length} chars, max ${this.config.descriptionLength.max})`);
        }
        
        // Check for keywords
        if (!metadata.keywords || metadata.keywords.length === 0) {
            issues.push('No keywords defined');
        }
        
        return issues;
    }
}

// Export for use
window.seoOptimization = new SEOOptimizationSystem();