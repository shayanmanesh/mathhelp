// Generate Sample Programmatic SEO Pages
// This script demonstrates the programmatic SEO generation system

const fs = require('fs');
const path = require('path');

// Import the programmatic SEO generator
const ProgrammaticSEOGenerator = require('./programmatic-seo-generator.js');

class SEOPageGenerator {
    constructor() {
        this.generator = new ProgrammaticSEOGenerator();
        this.outputDir = './seo-pages';
        this.samplePages = [];
    }

    async generateSamplePages() {
        console.log('🚀 Starting programmatic SEO page generation...');
        
        // Create output directory
        this.ensureDirectoryExists(this.outputDir);
        
        // Generate sample pages for each template type
        const templateTypes = ['solve', 'practice', 'visual', 'worksheet', 'calculator'];
        const sampleTopics = ['algebra', 'calculus', 'geometry'];
        const sampleProblems = {
            algebra: ['linear-equations', 'quadratic-equations'],
            calculus: ['derivatives', 'integrals'],
            geometry: ['triangle-area', 'circle-area']
        };
        
        for (const templateType of templateTypes) {
            for (const topic of sampleTopics) {
                for (const problem of sampleProblems[topic]) {
                    const page = await this.generateSamplePage(templateType, topic, problem);
                    this.samplePages.push(page);
                    await this.writePage(page);
                }
            }
        }

        // Generate sitemap
        await this.generateSitemap();
        
        // Generate robots.txt
        await this.generateRobotsTxt();

        console.log(`✅ Generated ${this.samplePages.length} sample SEO pages`);
        console.log(`📁 Pages saved to: ${this.outputDir}`);
        
        return this.samplePages;
    }

    async generateSamplePage(templateType, topic, problemType) {
        const template = this.generator.templates[templateType];
        const topicInfo = this.generator.topicCategories[topic];
        const difficulty = 'intermediate';
        
        const pageData = this.generator.generatePageData(templateType, topic, problemType, difficulty, topicInfo);
        const page = this.generator.createPage(template, pageData);
        
        // Add sample content
        page.fullContent = this.generateFullPageContent(page);
        
        return page;
    }

    generateFullPageContent(page) {
        const { title, h1, metaDescription, content, schema, breadcrumbs } = page;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="robots" content="index, follow">
    
    <!-- Schema Markup -->
    <script type="application/ld+json">
    ${JSON.stringify(schema, null, 2)}
    </script>
    
    <!-- AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5635114711353420" crossorigin="anonymous"></script>
    
    <!-- Enhanced CSS -->
    <link rel="stylesheet" href="enhanced-styles.css">
    
    <!-- Critical CSS -->
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .breadcrumbs { padding: 10px 0; }
        .breadcrumbs a { text-decoration: none; color: #3498db; }
        .content-section { margin: 30px 0; }
        .formula { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; }
        .example { background: #fff; border: 1px solid #e0e0e0; padding: 20px; margin: 15px 0; }
        .practice-problem { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .btn { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .share-challenge-btn { background: #e74c3c; margin-left: 10px; }
        .historical-context-mini { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .research-context-mini { background: #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .ad-container { margin: 30px 0; text-align: center; }
        .ad-label { font-size: 0.8em; color: #666; margin-bottom: 5px; }
        .interactive-tools-section { background: #f8f9fa; padding: 30px; margin: 30px 0; border-radius: 8px; }
        .research-papers-section { background: white; padding: 30px; margin: 30px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
    </style>
</head>
<body data-page-type="seo-page">
    <nav class="breadcrumbs">
        <div class="container">
            ${breadcrumbs.map(crumb => 
                crumb.url ? `<a href="${crumb.url}">${crumb.name}</a>` : crumb.name
            ).join(' > ')}
        </div>
    </nav>

    <main class="container">
        <header>
            <h1>${h1}</h1>
            <p>${metaDescription}</p>
        </header>

        ${this.renderContentSections(content)}

        <!-- Viral Sharing Section -->
        <section class="viral-sharing">
            <h3>Share This Problem</h3>
            <p>Challenge your friends to solve this problem!</p>
            <button class="btn share-challenge-btn" onclick="shareChallenge()">
                🚀 Create Math Challenge
            </button>
        </section>

        <!-- Rewarded Video Section -->
        <section class="rewarded-video">
            <h3>Need Help?</h3>
            <p>Watch a short video to unlock hints and step-by-step solutions!</p>
            <button class="btn" onclick="showRewardedVideo()">
                🎁 Get Hint (Watch 30s Video)
            </button>
        </section>
    </main>

    <!-- JavaScript Files -->
    <script src="schema-markup.js"></script>
    <script src="viral-growth-system.js"></script>
    <script src="header-bidding-system.js"></script>
    <script src="interactive-tools.js"></script>
    <script src="core-web-vitals.js"></script>

    <script>
        function shareChallenge() {
            if (window.viralGrowthSystem) {
                window.viralGrowthSystem.shareChallenge('sample-challenge');
            }
        }
        
        function showRewardedVideo() {
            if (window.viralGrowthSystem) {
                window.viralGrowthSystem.showRewardedVideoOffer('hint', 'seo-page');
            }
        }
        
        function solveProblem(problemType) {
            const input = document.getElementById('problem-input');
            const output = document.getElementById('solution-output');
            
            if (input && output) {
                output.innerHTML = '<p>Step-by-step solution would be generated here for: ' + input.value + '</p>';
            }
        }
        
        // Track page view
        if (window.viralGrowthSystem) {
            window.viralGrowthSystem.trackEvent('page_view', {
                page_type: 'seo_page',
                url: window.location.href
            });
        }
    </script>
</body>
</html>`;
    }

    renderContentSections(content) {
        let html = '';
        
        Object.entries(content.sections).forEach(([sectionName, section]) => {
            html += `
                <section class="content-section">
                    <h2>${section.title}</h2>
                    ${section.content}
                </section>
            `;
        });
        
        return html;
    }

    async writePage(page) {
        const fileName = this.generateFileName(page.url);
        const filePath = path.join(this.outputDir, fileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(path.dirname(filePath));
        
        await fs.promises.writeFile(filePath, page.fullContent, 'utf8');
        console.log(`📄 Generated: ${fileName}`);
    }

    generateFileName(url) {
        return url.replace(/^\//, '').replace(/\//g, '-') + '.html';
    }

    async generateSitemap() {
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.samplePages.map(page => `
    <url>
        <loc>https://math.help${page.url}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${page.changeFreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`).join('')}
</urlset>`;

        await fs.promises.writeFile(path.join(this.outputDir, 'sitemap.xml'), sitemapXml, 'utf8');
        console.log('📄 Generated: sitemap.xml');
    }

    async generateRobotsTxt() {
        const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://math.help/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all educational content
Allow: /solve/
Allow: /practice/
Allow: /visual/
Allow: /worksheets/
Allow: /calculators/`;

        await fs.promises.writeFile(path.join(this.outputDir, 'robots.txt'), robotsTxt, 'utf8');
        console.log('📄 Generated: robots.txt');
    }

    ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

// Generate sample pages if run directly
if (require.main === module) {
    const generator = new SEOPageGenerator();
    generator.generateSamplePages().then(() => {
        console.log('🎉 Sample SEO pages generation complete!');
    }).catch(error => {
        console.error('❌ Error generating pages:', error);
    });
}

module.exports = SEOPageGenerator;