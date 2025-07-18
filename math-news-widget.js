// Math News Widget - Embeddable component for displaying latest math news
// Can be embedded on any page to show recent mathematical news

class MathNewsWidget {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'math-news-widget',
            maxArticles: options.maxArticles || 5,
            categories: options.categories || ['research', 'education', 'technology'],
            showImages: options.showImages || false,
            showDescriptions: options.showDescriptions || true,
            showSources: options.showSources || true,
            showTimes: options.showTimes || true,
            autoRefresh: options.autoRefresh || true,
            refreshInterval: options.refreshInterval || 5 * 60 * 1000, // 5 minutes
            compact: options.compact || false,
            darkMode: options.darkMode || false
        };
        
        this.articles = [];
        this.lastUpdate = null;
        this.init();
    }

    init() {
        this.createWidgetHTML();
        this.applyStyles();
        this.loadNews();
        
        if (this.options.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    createWidgetHTML() {
        const container = document.getElementById(this.options.containerId);
        if (!container) {
            console.error(`Math News Widget: Container with ID '${this.options.containerId}' not found`);
            return;
        }

        container.innerHTML = `
            <div class="math-news-widget ${this.options.compact ? 'compact' : ''} ${this.options.darkMode ? 'dark-mode' : ''}">
                <div class="widget-header">
                    <h3 class="widget-title">📰 Latest Math News</h3>
                    <button class="widget-refresh-btn" onclick="this.refreshWidget()">🔄</button>
                </div>
                <div class="widget-content">
                    <div class="widget-loading">
                        <div class="loading-spinner"></div>
                        <span>Loading math news...</span>
                    </div>
                    <div class="widget-articles" style="display: none;"></div>
                    <div class="widget-error" style="display: none;">
                        <span>Unable to load news. Please try again later.</span>
                    </div>
                </div>
                <div class="widget-footer">
                    <a href="/news/" class="widget-more-link">View All Math News →</a>
                    <span class="widget-updated">Updated: <span class="update-time">Never</span></span>
                </div>
            </div>
        `;

        // Store reference to widget instance
        container.querySelector('.widget-refresh-btn').widget = this;
    }

    applyStyles() {
        if (document.getElementById('math-news-widget-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'math-news-widget-styles';
        styles.textContent = `
            .math-news-widget {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                max-width: 400px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .math-news-widget.compact {
                max-width: 300px;
                font-size: 12px;
            }

            .math-news-widget.dark-mode {
                background: #2d3748;
                border-color: #4a5568;
                color: #e2e8f0;
            }

            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
            }

            .math-news-widget.dark-mode .widget-header {
                background: #4a5568;
                border-bottom-color: #2d3748;
            }

            .widget-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }

            .math-news-widget.dark-mode .widget-title {
                color: #e2e8f0;
            }

            .math-news-widget.compact .widget-title {
                font-size: 14px;
            }

            .widget-refresh-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .widget-refresh-btn:hover {
                background: rgba(0,0,0,0.1);
            }

            .widget-content {
                padding: 15px;
            }

            .widget-loading {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 20px;
                text-align: center;
                color: #666;
            }

            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .widget-articles {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .widget-article {
                padding: 12px;
                border: 1px solid #f0f0f0;
                border-radius: 6px;
                transition: all 0.2s;
                cursor: pointer;
            }

            .widget-article:hover {
                border-color: #3498db;
                background: #f8f9fa;
            }

            .math-news-widget.dark-mode .widget-article {
                border-color: #4a5568;
                background: #2d3748;
            }

            .math-news-widget.dark-mode .widget-article:hover {
                border-color: #3498db;
                background: #4a5568;
            }

            .article-title {
                font-weight: 600;
                color: #333;
                margin: 0 0 8px 0;
                font-size: 14px;
                line-height: 1.3;
            }

            .math-news-widget.dark-mode .article-title {
                color: #e2e8f0;
            }

            .math-news-widget.compact .article-title {
                font-size: 12px;
            }

            .article-description {
                color: #666;
                margin: 0 0 8px 0;
                font-size: 12px;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .math-news-widget.dark-mode .article-description {
                color: #cbd5e0;
            }

            .article-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #999;
            }

            .math-news-widget.dark-mode .article-meta {
                color: #a0aec0;
            }

            .article-source {
                font-weight: 500;
                color: #3498db;
            }

            .article-time {
                color: #999;
            }

            .article-category {
                background: #3498db;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 500;
            }

            .widget-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                border-top: 1px solid #e0e0e0;
                background: #f8f9fa;
                font-size: 12px;
            }

            .math-news-widget.dark-mode .widget-footer {
                background: #4a5568;
                border-top-color: #2d3748;
            }

            .widget-more-link {
                color: #3498db;
                text-decoration: none;
                font-weight: 500;
            }

            .widget-more-link:hover {
                text-decoration: underline;
            }

            .widget-updated {
                color: #666;
            }

            .math-news-widget.dark-mode .widget-updated {
                color: #a0aec0;
            }

            .widget-error {
                text-align: center;
                color: #e74c3c;
                padding: 20px;
            }

            .math-news-widget.dark-mode .widget-error {
                color: #fc8181;
            }
        `;
        
        document.head.appendChild(styles);
    }

    async loadNews() {
        this.showLoading();
        
        try {
            // Try to get news from the global news system
            let articles = [];
            
            if (window.mathNewsSystem) {
                articles = window.mathNewsSystem.getAllNews();
            } else {
                // Fallback to cached news or fetch directly
                articles = await this.fetchNewsDirectly();
            }
            
            // Filter by categories if specified
            if (this.options.categories.length > 0) {
                articles = articles.filter(article => 
                    this.options.categories.includes(article.category)
                );
            }
            
            // Limit number of articles
            this.articles = articles.slice(0, this.options.maxArticles);
            
            this.renderArticles();
            this.updateTimestamp();
            
        } catch (error) {
            console.error('Error loading news for widget:', error);
            this.showError();
        }
    }

    async fetchNewsDirectly() {
        // Fallback method to get news when main system isn't available
        const cachedNews = localStorage.getItem('mathNews');
        if (cachedNews) {
            return JSON.parse(cachedNews);
        }
        
        // Return dummy data if no cache available
        return this.getDummyNews();
    }

    getDummyNews() {
        return [
            {
                id: '1',
                title: 'Breakthrough in Prime Number Theory',
                description: 'Mathematicians discover new patterns in prime number distribution.',
                source: 'MIT News',
                category: 'research',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                url: '/news/#article-1'
            },
            {
                id: '2',
                title: 'AI Revolutionizes Mathematical Education',
                description: 'New AI system helps students learn complex mathematical concepts.',
                source: 'Education Today',
                category: 'education',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                url: '/news/#article-2'
            },
            {
                id: '3',
                title: 'Quantum Computing Breakthrough',
                description: 'Mathematical algorithms enable faster quantum computations.',
                source: 'Tech Review',
                category: 'technology',
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                url: '/news/#article-3'
            }
        ];
    }

    renderArticles() {
        const container = document.querySelector(`#${this.options.containerId} .widget-articles`);
        if (!container) return;

        if (this.articles.length === 0) {
            container.innerHTML = '<div class="widget-error">No news articles found</div>';
            this.showContent();
            return;
        }

        container.innerHTML = this.articles.map(article => this.renderArticle(article)).join('');
        this.addClickHandlers();
        this.showContent();
    }

    renderArticle(article) {
        const timeAgo = this.getTimeAgo(article.publishedAt);
        const categoryName = this.getCategoryName(article.category);
        
        return `
            <div class="widget-article" data-article-id="${article.id}" data-article-url="${article.url}">
                <h4 class="article-title">${article.title}</h4>
                ${this.options.showDescriptions ? `
                    <p class="article-description">${article.description}</p>
                ` : ''}
                <div class="article-meta">
                    <div>
                        ${this.options.showSources ? `<span class="article-source">${article.source}</span>` : ''}
                        <span class="article-category">${categoryName}</span>
                    </div>
                    ${this.options.showTimes ? `<span class="article-time">${timeAgo}</span>` : ''}
                </div>
            </div>
        `;
    }

    addClickHandlers() {
        const articles = document.querySelectorAll(`#${this.options.containerId} .widget-article`);
        articles.forEach(article => {
            article.addEventListener('click', (e) => {
                const url = article.dataset.articleUrl;
                if (url) {
                    if (url.startsWith('http')) {
                        window.open(url, '_blank');
                    } else {
                        window.location.href = url;
                    }
                }
            });
        });
    }

    getCategoryName(categoryId) {
        const categoryNames = {
            'research': 'Research',
            'education': 'Education',
            'technology': 'Technology',
            'applications': 'Applications',
            'competitions': 'Competitions',
            'careers': 'Careers'
        };
        return categoryNames[categoryId] || 'News';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    showLoading() {
        const container = document.querySelector(`#${this.options.containerId}`);
        if (!container) return;

        container.querySelector('.widget-loading').style.display = 'flex';
        container.querySelector('.widget-articles').style.display = 'none';
        container.querySelector('.widget-error').style.display = 'none';
    }

    showContent() {
        const container = document.querySelector(`#${this.options.containerId}`);
        if (!container) return;

        container.querySelector('.widget-loading').style.display = 'none';
        container.querySelector('.widget-articles').style.display = 'flex';
        container.querySelector('.widget-error').style.display = 'none';
    }

    showError() {
        const container = document.querySelector(`#${this.options.containerId}`);
        if (!container) return;

        container.querySelector('.widget-loading').style.display = 'none';
        container.querySelector('.widget-articles').style.display = 'none';
        container.querySelector('.widget-error').style.display = 'block';
    }

    updateTimestamp() {
        const timeElement = document.querySelector(`#${this.options.containerId} .update-time`);
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
        this.lastUpdate = new Date();
    }

    refreshWidget() {
        this.loadNews();
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadNews();
        }, this.options.refreshInterval);
    }

    // Public methods
    refresh() {
        this.refreshWidget();
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.init();
    }

    destroy() {
        const container = document.getElementById(this.options.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Global function to create widget
window.createMathNewsWidget = function(containerId, options = {}) {
    return new MathNewsWidget({
        containerId: containerId,
        ...options
    });
};

// Auto-initialize widgets with data attributes
document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('[data-math-news-widget]');
    widgets.forEach(widget => {
        const options = {
            containerId: widget.id,
            maxArticles: parseInt(widget.dataset.maxArticles) || 5,
            categories: widget.dataset.categories ? widget.dataset.categories.split(',') : ['research', 'education', 'technology'],
            showDescriptions: widget.dataset.showDescriptions !== 'false',
            showSources: widget.dataset.showSources !== 'false',
            showTimes: widget.dataset.showTimes !== 'false',
            autoRefresh: widget.dataset.autoRefresh !== 'false',
            compact: widget.dataset.compact === 'true',
            darkMode: widget.dataset.darkMode === 'true'
        };
        
        new MathNewsWidget(options);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathNewsWidget;
}

window.MathNewsWidget = MathNewsWidget;