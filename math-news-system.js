// Math News System - Automated News Fetching and Categorization
// Fetches mathematics-related news every 5 minutes from multiple sources

class MathNewsSystem {
    constructor() {
        this.newsCache = new Map();
        this.lastFetch = 0;
        this.fetchInterval = 5 * 60 * 1000; // 5 minutes
        this.maxArticles = 100;
        this.categories = this.initializeCategories();
        this.sources = this.initializeSources();
        this.keywords = this.initializeKeywords();
        this.init();
    }

    init() {
        this.startPeriodicFetching();
        this.setupEventListeners();
        this.loadCachedNews();
    }

    initializeCategories() {
        return {
            'research': {
                name: 'Mathematical Research',
                keywords: ['research', 'theorem', 'proof', 'study', 'discovery', 'breakthrough'],
                priority: 1
            },
            'education': {
                name: 'Math Education',
                keywords: ['education', 'learning', 'teaching', 'curriculum', 'students', 'school'],
                priority: 2
            },
            'technology': {
                name: 'Math & Technology',
                keywords: ['AI', 'machine learning', 'algorithm', 'computing', 'software', 'digital'],
                priority: 3
            },
            'applications': {
                name: 'Real-World Applications',
                keywords: ['finance', 'economics', 'physics', 'engineering', 'medical', 'climate'],
                priority: 4
            },
            'competitions': {
                name: 'Math Competitions',
                keywords: ['olympiad', 'competition', 'contest', 'award', 'medal', 'winner'],
                priority: 5
            },
            'careers': {
                name: 'Math Careers',
                keywords: ['jobs', 'career', 'employment', 'mathematician', 'analyst', 'professor'],
                priority: 6
            }
        };
    }

    initializeSources() {
        return {
            newsApi: {
                name: 'News API',
                url: 'https://newsapi.org/v2/everything',
                key: 'YOUR_NEWS_API_KEY', // Replace with actual API key
                enabled: true
            },
            mathWorld: {
                name: 'Wolfram MathWorld',
                url: 'https://mathworld.wolfram.com/news/',
                rss: true,
                enabled: true
            },
            ams: {
                name: 'American Mathematical Society',
                url: 'https://www.ams.org/news',
                rss: true,
                enabled: true
            },
            arxiv: {
                name: 'arXiv Mathematics',
                url: 'https://arxiv.org/list/math/recent',
                enabled: true
            },
            scienceDaily: {
                name: 'Science Daily - Mathematics',
                url: 'https://www.sciencedaily.com/news/computers_math/mathematics/',
                rss: true,
                enabled: true
            },
            mathStackExchange: {
                name: 'Math Stack Exchange Blog',
                url: 'https://math.stackexchange.com/questions/tagged/news',
                enabled: true
            }
        };
    }

    initializeKeywords() {
        return {
            primary: [
                'mathematics', 'mathematical', 'math', 'theorem', 'proof', 'equation',
                'algorithm', 'calculus', 'algebra', 'geometry', 'statistics', 'probability',
                'topology', 'analysis', 'number theory', 'combinatorics', 'graph theory'
            ],
            secondary: [
                'mathematician', 'research', 'discovery', 'breakthrough', 'solution',
                'problem', 'formula', 'calculation', 'computation', 'model', 'theory',
                'axiom', 'conjecture', 'lemma', 'corollary', 'derivative', 'integral'
            ],
            exclude: [
                'sports math', 'simple math', 'basic math', 'elementary', 'kindergarten',
                'preschool', 'counting', 'addition', 'subtraction', 'multiplication'
            ]
        };
    }

    async startPeriodicFetching() {
        // Initial fetch
        await this.fetchAllNews();
        
        // Set up interval for periodic fetching
        setInterval(async () => {
            await this.fetchAllNews();
        }, this.fetchInterval);

        console.log('📰 Math News System started - fetching every 5 minutes');
    }

    async fetchAllNews() {
        console.log('🔍 Fetching math news from all sources...');
        
        const allNews = [];
        
        try {
            // Fetch from News API
            const newsApiResults = await this.fetchFromNewsAPI();
            allNews.push(...newsApiResults);

            // Fetch from RSS feeds
            const rssResults = await this.fetchFromRSSFeeds();
            allNews.push(...rssResults);

            // Fetch from arXiv
            const arxivResults = await this.fetchFromArxiv();
            allNews.push(...arxivResults);

            // Fetch from web scraping
            const scrapedResults = await this.fetchFromWebScraping();
            allNews.push(...scrapedResults);

            // Process and categorize news
            const processedNews = this.processAndCategorizeNews(allNews);
            
            // Update cache
            this.updateNewsCache(processedNews);
            
            // Notify UI
            this.notifyNewsUpdate(processedNews);
            
            console.log(`✅ Fetched ${processedNews.length} math news articles`);
            
        } catch (error) {
            console.error('❌ Error fetching news:', error);
        }
    }

    async fetchFromNewsAPI() {
        if (!this.sources.newsApi.enabled) return [];

        const query = this.keywords.primary.join(' OR ');
        const url = `${this.sources.newsApi.url}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20`;
        
        try {
            // In a real implementation, you'd use fetch with API key
            // For demo purposes, we'll simulate the response
            return this.simulateNewsAPIResponse();
        } catch (error) {
            console.error('News API error:', error);
            return [];
        }
    }

    async fetchFromRSSFeeds() {
        const rssResults = [];
        
        for (const [sourceId, source] of Object.entries(this.sources)) {
            if (source.rss && source.enabled) {
                try {
                    const articles = await this.parseRSSFeed(source.url);
                    rssResults.push(...articles.map(article => ({
                        ...article,
                        source: source.name,
                        sourceId: sourceId
                    })));
                } catch (error) {
                    console.error(`RSS feed error for ${source.name}:`, error);
                }
            }
        }
        
        return rssResults;
    }

    async fetchFromArxiv() {
        try {
            // Simulate arXiv API response
            return this.simulateArxivResponse();
        } catch (error) {
            console.error('arXiv API error:', error);
            return [];
        }
    }

    async fetchFromWebScraping() {
        const scrapedResults = [];
        
        // Simulate web scraping results
        const sources = ['Math Stack Exchange', 'Mathematics Magazine', 'Plus Magazine'];
        
        sources.forEach(source => {
            const articles = this.simulateWebScrapingResults(source);
            scrapedResults.push(...articles);
        });
        
        return scrapedResults;
    }

    simulateNewsAPIResponse() {
        return [
            {
                title: 'Breakthrough in Prime Number Theory Announced',
                description: 'Mathematicians at MIT announce a major breakthrough in understanding the distribution of prime numbers.',
                url: 'https://example.com/prime-breakthrough',
                source: 'MIT News',
                publishedAt: new Date().toISOString(),
                category: 'research'
            },
            {
                title: 'AI Uses Advanced Mathematics to Solve Climate Models',
                description: 'New artificial intelligence system employs sophisticated mathematical algorithms to improve climate prediction accuracy.',
                url: 'https://example.com/ai-climate-math',
                source: 'Science Daily',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                category: 'applications'
            },
            {
                title: 'Revolutionary Teaching Method Improves Math Learning',
                description: 'New pedagogical approach based on cognitive science research shows remarkable improvement in student math performance.',
                url: 'https://example.com/math-teaching-method',
                source: 'Education Week',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                category: 'education'
            }
        ];
    }

    simulateArxivResponse() {
        return [
            {
                title: 'On the Riemann Hypothesis and Zeta Function Zeros',
                description: 'This paper presents new insights into the distribution of non-trivial zeros of the Riemann zeta function.',
                url: 'https://arxiv.org/abs/2024.01234',
                source: 'arXiv',
                publishedAt: new Date(Date.now() - 1800000).toISOString(),
                category: 'research',
                authors: ['Dr. Jane Smith', 'Prof. John Doe']
            },
            {
                title: 'Graph Neural Networks for Combinatorial Optimization',
                description: 'We propose a novel approach using graph neural networks to solve NP-hard combinatorial optimization problems.',
                url: 'https://arxiv.org/abs/2024.01235',
                source: 'arXiv',
                publishedAt: new Date(Date.now() - 5400000).toISOString(),
                category: 'technology',
                authors: ['Dr. Alice Johnson']
            }
        ];
    }

    simulateWebScrapingResults(source) {
        const articles = [
            {
                title: `${source}: Weekly Mathematics Problem Challenge`,
                description: 'Join our weekly challenge featuring problems from various mathematical disciplines.',
                url: `https://example.com/${source.toLowerCase().replace(/\s/g, '-')}/weekly-challenge`,
                source: source,
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                category: 'competitions'
            }
        ];
        
        return articles;
    }

    async parseRSSFeed(url) {
        // In a real implementation, you'd parse RSS/XML
        // For demo purposes, return simulated data
        return [
            {
                title: 'New Developments in Algebraic Topology',
                description: 'Recent advances in homotopy theory and their applications to algebraic topology.',
                url: 'https://example.com/algebraic-topology',
                publishedAt: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }

    processAndCategorizeNews(articles) {
        const processed = [];
        
        articles.forEach(article => {
            // Check if article is relevant
            if (this.isRelevantArticle(article)) {
                // Categorize article
                const category = this.categorizeArticle(article);
                
                // Add processing metadata
                const processedArticle = {
                    ...article,
                    id: this.generateArticleId(article),
                    category: category,
                    relevanceScore: this.calculateRelevanceScore(article),
                    processedAt: new Date().toISOString(),
                    tags: this.extractTags(article)
                };
                
                processed.push(processedArticle);
            }
        });
        
        // Sort by relevance and recency
        return processed.sort((a, b) => {
            const relevanceDiff = b.relevanceScore - a.relevanceScore;
            if (relevanceDiff !== 0) return relevanceDiff;
            return new Date(b.publishedAt) - new Date(a.publishedAt);
        }).slice(0, this.maxArticles);
    }

    isRelevantArticle(article) {
        const content = `${article.title} ${article.description}`.toLowerCase();
        
        // Check for primary keywords
        const hasPrimaryKeyword = this.keywords.primary.some(keyword => 
            content.includes(keyword.toLowerCase())
        );
        
        // Check for excluded keywords
        const hasExcludedKeyword = this.keywords.exclude.some(keyword => 
            content.includes(keyword.toLowerCase())
        );
        
        return hasPrimaryKeyword && !hasExcludedKeyword;
    }

    categorizeArticle(article) {
        const content = `${article.title} ${article.description}`.toLowerCase();
        
        // If article already has a category, use it
        if (article.category && this.categories[article.category]) {
            return article.category;
        }
        
        // Find best matching category
        let bestCategory = 'research'; // default
        let bestScore = 0;
        
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const score = category.keywords.reduce((total, keyword) => {
                return total + (content.includes(keyword.toLowerCase()) ? 1 : 0);
            }, 0);
            
            if (score > bestScore) {
                bestScore = score;
                bestCategory = categoryId;
            }
        });
        
        return bestCategory;
    }

    calculateRelevanceScore(article) {
        const content = `${article.title} ${article.description}`.toLowerCase();
        let score = 0;
        
        // Primary keywords (high weight)
        this.keywords.primary.forEach(keyword => {
            if (content.includes(keyword.toLowerCase())) {
                score += 3;
            }
        });
        
        // Secondary keywords (medium weight)
        this.keywords.secondary.forEach(keyword => {
            if (content.includes(keyword.toLowerCase())) {
                score += 2;
            }
        });
        
        // Recency boost (more recent = higher score)
        const hoursAgo = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
        if (hoursAgo < 24) score += 5;
        else if (hoursAgo < 48) score += 3;
        else if (hoursAgo < 72) score += 1;
        
        // Source credibility
        const credibleSources = ['MIT News', 'Science Daily', 'arXiv', 'AMS'];
        if (credibleSources.includes(article.source)) {
            score += 2;
        }
        
        return score;
    }

    extractTags(article) {
        const content = `${article.title} ${article.description}`.toLowerCase();
        const tags = [];
        
        // Extract mathematical topic tags
        const topicTags = [
            'algebra', 'calculus', 'geometry', 'statistics', 'probability',
            'topology', 'analysis', 'number-theory', 'combinatorics',
            'graph-theory', 'machine-learning', 'AI', 'physics', 'finance'
        ];
        
        topicTags.forEach(tag => {
            if (content.includes(tag.toLowerCase())) {
                tags.push(tag);
            }
        });
        
        return tags;
    }

    generateArticleId(article) {
        // Create unique ID based on title and source
        const content = `${article.title}-${article.source}`;
        return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    updateNewsCache(articles) {
        // Clear old cache
        this.newsCache.clear();
        
        // Group articles by category
        const categorizedNews = {};
        articles.forEach(article => {
            if (!categorizedNews[article.category]) {
                categorizedNews[article.category] = [];
            }
            categorizedNews[article.category].push(article);
        });
        
        // Update cache
        Object.entries(categorizedNews).forEach(([category, articles]) => {
            this.newsCache.set(category, articles);
        });
        
        // Store all articles
        this.newsCache.set('all', articles);
        
        // Update local storage
        localStorage.setItem('mathNews', JSON.stringify(articles));
        localStorage.setItem('mathNewsLastUpdate', Date.now().toString());
    }

    loadCachedNews() {
        try {
            const cachedNews = localStorage.getItem('mathNews');
            const lastUpdate = localStorage.getItem('mathNewsLastUpdate');
            
            if (cachedNews && lastUpdate) {
                const articles = JSON.parse(cachedNews);
                const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
                
                // Use cached news if less than 30 minutes old
                if (timeSinceUpdate < 30 * 60 * 1000) {
                    this.updateNewsCache(articles);
                    this.notifyNewsUpdate(articles);
                    console.log('📰 Loaded cached math news');
                }
            }
        } catch (error) {
            console.error('Error loading cached news:', error);
        }
    }

    notifyNewsUpdate(articles) {
        // Dispatch custom event for UI updates
        const event = new CustomEvent('mathNewsUpdate', {
            detail: {
                articles: articles,
                categories: this.getCategorizedNews(),
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }

    getCategorizedNews() {
        const categorized = {};
        
        Object.keys(this.categories).forEach(categoryId => {
            categorized[categoryId] = this.newsCache.get(categoryId) || [];
        });
        
        return categorized;
    }

    getNewsByCategory(categoryId) {
        return this.newsCache.get(categoryId) || [];
    }

    getAllNews() {
        return this.newsCache.get('all') || [];
    }

    getLatestNews(limit = 10) {
        const allNews = this.getAllNews();
        return allNews.slice(0, limit);
    }

    searchNews(query) {
        const allNews = this.getAllNews();
        const searchTerm = query.toLowerCase();
        
        return allNews.filter(article => {
            const content = `${article.title} ${article.description}`.toLowerCase();
            return content.includes(searchTerm);
        });
    }

    setupEventListeners() {
        // Listen for user interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('news-refresh-btn')) {
                this.fetchAllNews();
            }
        });
        
        // Listen for category filter changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('news-category-filter')) {
                const category = e.target.value;
                this.displayCategoryNews(category);
            }
        });
    }

    displayCategoryNews(category) {
        const articles = category === 'all' ? this.getAllNews() : this.getNewsByCategory(category);
        
        const event = new CustomEvent('mathNewsCategoryChange', {
            detail: {
                category: category,
                articles: articles
            }
        });
        
        document.dispatchEvent(event);
    }

    // Public API methods
    getNewsStats() {
        return {
            totalArticles: this.getAllNews().length,
            categoriesCount: Object.keys(this.categories).length,
            lastUpdate: localStorage.getItem('mathNewsLastUpdate'),
            sources: Object.keys(this.sources).length
        };
    }

    addCustomSource(sourceId, sourceConfig) {
        this.sources[sourceId] = sourceConfig;
        console.log(`Added custom news source: ${sourceConfig.name}`);
    }

    toggleSource(sourceId, enabled) {
        if (this.sources[sourceId]) {
            this.sources[sourceId].enabled = enabled;
            console.log(`${enabled ? 'Enabled' : 'Disabled'} source: ${sourceId}`);
        }
    }
}

// Initialize the math news system
document.addEventListener('DOMContentLoaded', function() {
    window.mathNewsSystem = new MathNewsSystem();
    
    // Global access
    window.getMathNews = () => window.mathNewsSystem.getAllNews();
    window.getMathNewsByCategory = (category) => window.mathNewsSystem.getNewsByCategory(category);
    window.searchMathNews = (query) => window.mathNewsSystem.searchNews(query);
});

// Export for use in other modules
window.MathNewsSystem = MathNewsSystem;