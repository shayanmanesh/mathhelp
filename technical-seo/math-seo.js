// Technical SEO System for Math Platforms
// Optimized for 2024-2025 search requirements

class MathTechnicalSEO {
  constructor() {
    this.config = {
      structuredData: {
        enabled: true,
        types: ['MathSolver', 'LearningResource', 'Course', 'Quiz', 'FAQPage'],
        mathMLEnhanced: true,
        practiceProblems: true
      },
      
      rendering: {
        serverSideEnabled: true,
        prerendering: true,
        criticalMath: true,
        fallbackText: true
      },
      
      performance: {
        resourceBudget: 50, // Max resources per page
        criticalInlineSize: 14336, // 14KB inline limit
        preloadStrategy: 'selective',
        compressionEnabled: true
      },
      
      crawlability: {
        mathSitemaps: true,
        dynamicRendering: true,
        crawlerDetection: true,
        renderTimeout: 5000 // ms
      },
      
      mobile: {
        viewportMeta: true,
        touchTargets: 44, // pixels
        fontSizeMin: 16, // pixels
        responsiveMath: true
      }
    };
    
    this.init();
  }

  init() {
    this.injectCriticalMeta();
    this.setupStructuredData();
    this.optimizeForCrawlers();
    this.implementMobileOptimizations();
    this.setupResourceHints();
    this.configureMathMLFallbacks();
    this.monitorSEOHealth();
  }

  // ============================================
  // CRITICAL META TAGS
  // ============================================

  injectCriticalMeta() {
    const head = document.head;
    
    // Viewport meta for mobile
    this.ensureMetaTag('viewport', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    
    // Theme color
    this.ensureMetaTag('theme-color', '#3498db');
    
    // Canonical URL
    this.ensureCanonicalURL();
    
    // Open Graph meta
    this.setupOpenGraph();
    
    // Twitter Card meta
    this.setupTwitterCard();
    
    // Math-specific meta
    this.setupMathMeta();
  }

  ensureMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  ensureCanonicalURL() {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    // Set canonical URL
    const url = new URL(window.location.href);
    url.search = ''; // Remove query params
    canonical.href = url.toString();
  }

  setupOpenGraph() {
    const ogTags = {
      'og:type': 'website',
      'og:site_name': 'Math Help',
      'og:title': document.title,
      'og:description': this.getPageDescription(),
      'og:url': window.location.href,
      'og:image': this.getPageImage()
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }

  setupTwitterCard() {
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': document.title,
      'twitter:description': this.getPageDescription(),
      'twitter:image': this.getPageImage()
    };
    
    Object.entries(twitterTags).forEach(([name, content]) => {
      this.ensureMetaTag(name, content);
    });
  }

  setupMathMeta() {
    // Math-specific meta tags for search engines
    this.ensureMetaTag('math:renderer', 'MathJax 3.0');
    this.ensureMetaTag('math:notation', 'LaTeX, MathML');
    this.ensureMetaTag('math:accessibility', 'true');
  }

  // ============================================
  // STRUCTURED DATA
  // ============================================

  setupStructuredData() {
    // Remove any existing structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      if (script.textContent.includes('@context')) {
        script.remove();
      }
    });
    
    // Add new structured data based on page type
    const pageType = this.detectPageType();
    const structuredData = this.generateStructuredData(pageType);
    
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }

  detectPageType() {
    // Detect page type from URL or content
    const path = window.location.pathname;
    const content = document.body.textContent || '';
    
    if (path.includes('/practice') || content.includes('practice problem')) {
      return 'practice';
    } else if (path.includes('/lesson') || content.includes('lesson')) {
      return 'lesson';
    } else if (path.includes('/quiz') || content.includes('quiz')) {
      return 'quiz';
    } else if (path.includes('/solver') || content.includes('solve')) {
      return 'solver';
    } else if (document.querySelector('.faq')) {
      return 'faq';
    }
    
    return 'general';
  }

  generateStructuredData(pageType) {
    const baseData = {
      '@context': 'https://schema.org',
      '@graph': []
    };
    
    // Add organization data
    baseData['@graph'].push(this.getOrganizationSchema());
    
    // Add page-specific schema
    switch (pageType) {
      case 'practice':
        baseData['@graph'].push(this.getPracticeProblemsSchema());
        break;
      case 'lesson':
        baseData['@graph'].push(this.getLearningResourceSchema());
        break;
      case 'quiz':
        baseData['@graph'].push(this.getQuizSchema());
        break;
      case 'solver':
        baseData['@graph'].push(this.getMathSolverSchema());
        break;
      case 'faq':
        baseData['@graph'].push(this.getFAQSchema());
        break;
    }
    
    // Add breadcrumb schema
    const breadcrumb = this.getBreadcrumbSchema();
    if (breadcrumb) {
      baseData['@graph'].push(breadcrumb);
    }
    
    return baseData;
  }

  getOrganizationSchema() {
    return {
      '@type': 'Organization',
      '@id': 'https://math.help/#organization',
      'name': 'Math Help',
      'url': 'https://math.help',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://math.help/logo.png'
      },
      'sameAs': [
        'https://twitter.com/mathhelp',
        'https://facebook.com/mathhelp',
        'https://youtube.com/mathhelp'
      ]
    };
  }

  getPracticeProblemsSchema() {
    const problems = document.querySelectorAll('.problem-card');
    const problemData = [];
    
    problems.forEach((problem, index) => {
      const title = problem.querySelector('h3')?.textContent || `Problem ${index + 1}`;
      const question = problem.querySelector('.problem-statement')?.textContent || '';
      const answer = problem.dataset.answer || '';
      
      problemData.push({
        '@type': 'MathProblem',
        'name': title,
        'text': question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': answer
        },
        'educationalLevel': problem.dataset.difficulty || 'Intermediate',
        'learningResourceType': 'Practice problem',
        'mathExpression': {
          '@type': 'MathExpression',
          'latexRepresentation': problem.dataset.latex || '',
          'mathMLRepresentation': this.generateMathML(problem.dataset.latex)
        }
      });
    });
    
    return {
      '@type': 'LearningResource',
      '@id': window.location.href + '#practice',
      'name': document.title,
      'description': this.getPageDescription(),
      'learningResourceType': 'Practice problems',
      'educationalLevel': 'High school to College',
      'teaches': problemData,
      'inLanguage': 'en',
      'isAccessibleForFree': true,
      'provider': {
        '@id': 'https://math.help/#organization'
      }
    };
  }

  getLearningResourceSchema() {
    return {
      '@type': 'Course',
      'name': document.title,
      'description': this.getPageDescription(),
      'provider': {
        '@id': 'https://math.help/#organization'
      },
      'educationalLevel': 'High school to College',
      'inLanguage': 'en',
      'isAccessibleForFree': true,
      'hasCourseInstance': {
        '@type': 'CourseInstance',
        'courseMode': 'online',
        'courseWorkload': 'PT30M' // 30 minutes
      },
      'teaches': this.extractLessonConcepts()
    };
  }

  getQuizSchema() {
    const questions = document.querySelectorAll('.quiz-question');
    const questionData = [];
    
    questions.forEach((question, index) => {
      const text = question.querySelector('.question-text')?.textContent || '';
      const options = Array.from(question.querySelectorAll('.answer-option')).map(opt => ({
        '@type': 'Answer',
        'text': opt.textContent,
        'isCorrect': opt.dataset.correct === 'true'
      }));
      
      questionData.push({
        '@type': 'Question',
        'name': `Question ${index + 1}`,
        'text': text,
        'suggestedAnswer': options.filter(opt => opt.isCorrect),
        'answerOption': options
      });
    });
    
    return {
      '@type': 'Quiz',
      'name': document.title,
      'description': this.getPageDescription(),
      'educationalLevel': 'High school to College',
      'learningResourceType': 'Quiz',
      'hasPart': questionData,
      'provider': {
        '@id': 'https://math.help/#organization'
      }
    };
  }

  getMathSolverSchema() {
    return {
      '@type': 'WebApplication',
      'name': 'Math Solver',
      'description': 'Step-by-step math problem solver',
      'url': window.location.href,
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Any',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'Step-by-step solutions',
        'Multiple solving methods',
        'Graph visualization',
        'LaTeX support',
        'MathML output'
      ],
      'provider': {
        '@id': 'https://math.help/#organization'
      }
    };
  }

  getFAQSchema() {
    const faqs = document.querySelectorAll('.faq-item');
    const faqData = [];
    
    faqs.forEach(faq => {
      const question = faq.querySelector('.faq-question')?.textContent || '';
      const answer = faq.querySelector('.faq-answer')?.textContent || '';
      
      if (question && answer) {
        faqData.push({
          '@type': 'Question',
          'name': question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': answer
          }
        });
      }
    });
    
    return {
      '@type': 'FAQPage',
      'mainEntity': faqData
    };
  }

  getBreadcrumbSchema() {
    const breadcrumbs = document.querySelectorAll('.breadcrumb-item');
    if (breadcrumbs.length === 0) return null;
    
    const items = Array.from(breadcrumbs).map((crumb, index) => {
      const link = crumb.querySelector('a');
      return {
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.textContent.trim(),
        'item': link ? link.href : window.location.href
      };
    });
    
    return {
      '@type': 'BreadcrumbList',
      'itemListElement': items
    };
  }

  // ============================================
  // CRAWLER OPTIMIZATION
  // ============================================

  optimizeForCrawlers() {
    // Detect crawler user agents
    const isCrawler = this.detectCrawler();
    
    if (isCrawler) {
      this.enableCrawlerMode();
    }
    
    // Setup dynamic rendering
    this.setupDynamicRendering();
    
    // Add crawler hints
    this.addCrawlerHints();
  }

  detectCrawler() {
    const crawlerPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i
    ];
    
    const userAgent = navigator.userAgent;
    return crawlerPatterns.some(pattern => pattern.test(userAgent));
  }

  enableCrawlerMode() {
    // Force synchronous rendering for crawlers
    document.body.classList.add('crawler-mode');
    
    // Disable lazy loading
    document.querySelectorAll('[loading="lazy"]').forEach(el => {
      el.removeAttribute('loading');
    });
    
    // Render all math immediately
    if (window.MathJax) {
      MathJax.startup.document.render();
    }
    
    // Expand all collapsible content
    document.querySelectorAll('[data-collapsed="true"]').forEach(el => {
      el.setAttribute('data-collapsed', 'false');
    });
  }

  setupDynamicRendering() {
    // Add meta tag for dynamic rendering
    this.ensureMetaTag('fragment', '!');
    
    // Setup escaped fragment handling
    if (window.location.search.includes('_escaped_fragment_')) {
      this.handleEscapedFragment();
    }
  }

  handleEscapedFragment() {
    // Handle _escaped_fragment_ for crawlers
    const fragment = new URLSearchParams(window.location.search).get('_escaped_fragment_');
    if (fragment) {
      // Load content based on fragment
      this.loadFragmentContent(fragment);
    }
  }

  addCrawlerHints() {
    // Add JSON-LD for crawler hints
    const hints = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://math.help/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      },
      'speakable': {
        '@type': 'SpeakableSpecification',
        'cssSelector': ['.main-content', '.problem-statement', '.solution']
      }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(hints);
    document.head.appendChild(script);
  }

  // ============================================
  // MOBILE OPTIMIZATION
  // ============================================

  implementMobileOptimizations() {
    this.optimizeViewport();
    this.ensureTouchTargets();
    this.optimizeFontSizes();
    this.implementResponsiveMath();
    this.reduceResourceUsage();
  }

  optimizeViewport() {
    // Ensure proper viewport settings
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      // Prevent zoom on input focus
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }
    
    // Add iOS specific meta tags
    this.ensureMetaTag('apple-mobile-web-app-capable', 'yes');
    this.ensureMetaTag('apple-mobile-web-app-status-bar-style', 'default');
  }

  ensureTouchTargets() {
    // Check all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      if (size < this.config.mobile.touchTargets) {
        // Add padding to increase touch target
        element.style.padding = `${(this.config.mobile.touchTargets - size) / 2}px`;
        element.classList.add('touch-optimized');
      }
    });
  }

  optimizeFontSizes() {
    // Ensure readable font sizes on mobile
    const textElements = document.querySelectorAll('p, span, div, li, td');
    
    textElements.forEach(element => {
      const fontSize = window.getComputedStyle(element).fontSize;
      const size = parseFloat(fontSize);
      
      if (size < this.config.mobile.fontSizeMin) {
        element.style.fontSize = `${this.config.mobile.fontSizeMin}px`;
      }
    });
  }

  implementResponsiveMath() {
    // Make math expressions responsive
    const mathElements = document.querySelectorAll('.math-expression, mjx-container, .MathJax');
    
    mathElements.forEach(element => {
      // Add responsive wrapper
      if (!element.parentElement.classList.contains('math-responsive-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'math-responsive-wrapper';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
      }
      
      // Add overflow scrolling
      element.style.maxWidth = '100%';
      element.style.overflowX = 'auto';
      element.style.webkitOverflowScrolling = 'touch';
    });
    
    // Add CSS for responsive math
    this.injectResponsiveMathCSS();
  }

  injectResponsiveMathCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .math-responsive-wrapper {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 0.5rem 0;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar {
        height: 8px;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .math-responsive-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      @media (max-width: 768px) {
        .math-expression, mjx-container, .MathJax {
          font-size: 0.9em !important;
        }
        
        mjx-math {
          white-space: nowrap !important;
        }
      }
      
      @media (max-width: 480px) {
        .math-expression, mjx-container, .MathJax {
          font-size: 0.85em !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  reduceResourceUsage() {
    // Count current resources
    const resources = this.countPageResources();
    
    if (resources.total > this.config.performance.resourceBudget) {
      console.warn(`Page has ${resources.total} resources, exceeding budget of ${this.config.performance.resourceBudget}`);
      this.optimizeResources(resources);
    }
  }

  countPageResources() {
    return {
      scripts: document.querySelectorAll('script[src]').length,
      styles: document.querySelectorAll('link[rel="stylesheet"]').length,
      images: document.querySelectorAll('img').length,
      fonts: document.querySelectorAll('link[rel="preload"][as="font"]').length,
      total: 0
    };
  }

  optimizeResources(resources) {
    // Combine and minify where possible
    if (resources.scripts > 10) {
      console.log('Consider bundling JavaScript files');
    }
    
    if (resources.styles > 5) {
      console.log('Consider combining CSS files');
    }
    
    // Lazy load non-critical resources
    this.lazyLoadResources();
  }

  // ============================================
  // RESOURCE HINTS
  // ============================================

  setupResourceHints() {
    // DNS prefetch for external domains
    const domains = [
      'https://cdn.jsdelivr.net',
      'https://fonts.googleapis.com',
      'https://www.google-analytics.com'
    ];
    
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
    
    // Preconnect for critical domains
    const criticalDomains = [
      'https://cdn.jsdelivr.net'
    ];
    
    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // ============================================
  // MATHML FALLBACKS
  // ============================================

  configureMathMLFallbacks() {
    // Add MathML namespace
    document.documentElement.setAttribute('xmlns:m', 'http://www.w3.org/1998/Math/MathML');
    
    // Check MathML support
    const mathMLSupported = this.checkMathMLSupport();
    
    if (!mathMLSupported) {
      this.setupMathMLPolyfill();
    }
    
    // Add fallback text for all math
    this.addMathFallbackText();
  }

  checkMathMLSupport() {
    const div = document.createElement('div');
    div.innerHTML = '<math><mrow><mn>1</mn></mrow></math>';
    document.body.appendChild(div);
    const supported = div.firstChild && div.firstChild.firstChild && 
                     div.firstChild.firstChild.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
    document.body.removeChild(div);
    return supported;
  }

  setupMathMLPolyfill() {
    // Load MathML polyfill for browsers without support
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathml-polyfill@1.0.0/mathml.min.js';
    script.async = true;
    document.head.appendChild(script);
  }

  addMathFallbackText() {
    const mathElements = document.querySelectorAll('.math-expression, [role="math"]');
    
    mathElements.forEach(element => {
      if (!element.querySelector('.math-fallback')) {
        const fallback = document.createElement('span');
        fallback.className = 'math-fallback sr-only';
        fallback.textContent = this.extractMathText(element);
        element.appendChild(fallback);
      }
    });
  }

  // ============================================
  // SEO MONITORING
  // ============================================

  monitorSEOHealth() {
    // Check for common SEO issues
    const issues = [];
    
    // Check title length
    if (document.title.length > 60) {
      issues.push('Title tag exceeds 60 characters');
    }
    
    // Check meta description
    const description = document.querySelector('meta[name="description"]');
    if (!description) {
      issues.push('Missing meta description');
    } else if (description.content.length > 160) {
      issues.push('Meta description exceeds 160 characters');
    }
    
    // Check heading structure
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      issues.push('Missing H1 tag');
    } else if (h1Count > 1) {
      issues.push('Multiple H1 tags found');
    }
    
    // Check image alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt text`);
    }
    
    // Check for broken links
    this.checkBrokenLinks();
    
    // Report issues
    if (issues.length > 0) {
      console.warn('SEO issues detected:', issues);
      this.reportSEOIssues(issues);
    }
  }

  checkBrokenLinks() {
    const links = document.querySelectorAll('a[href]');
    const checkedLinks = new Set();
    
    links.forEach(link => {
      const href = link.href;
      if (!checkedLinks.has(href) && !href.startsWith('javascript:') && !href.startsWith('#')) {
        checkedLinks.add(href);
        
        // Check internal links only
        if (href.startsWith(window.location.origin)) {
          fetch(href, { method: 'HEAD' })
            .then(response => {
              if (!response.ok) {
                console.warn(`Broken link found: ${href}`);
              }
            })
            .catch(error => {
              console.warn(`Error checking link ${href}:`, error);
            });
        }
      }
    });
  }

  reportSEOIssues(issues) {
    // Send SEO issues to monitoring service
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        url: window.location.href,
        issues: issues,
        timestamp: Date.now()
      });
      
      navigator.sendBeacon('/api/seo-monitor', new Blob([data], { type: 'application/json' }));
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  getPageDescription() {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) return metaDescription.content;
    
    // Generate from content
    const firstParagraph = document.querySelector('p');
    if (firstParagraph) {
      return firstParagraph.textContent.substring(0, 160) + '...';
    }
    
    return 'Learn mathematics step by step with interactive lessons and practice problems.';
  }

  getPageImage() {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) return ogImage.content;
    
    const firstImage = document.querySelector('img');
    if (firstImage && firstImage.src.startsWith('http')) {
      return firstImage.src;
    }
    
    return 'https://math.help/default-share-image.png';
  }

  extractLessonConcepts() {
    const concepts = [];
    const headings = document.querySelectorAll('h2, h3');
    
    headings.forEach(heading => {
      concepts.push(heading.textContent.trim());
    });
    
    return concepts;
  }

  generateMathML(latex) {
    // Simple LaTeX to MathML conversion for common expressions
    if (!latex) return '';
    
    // This would integrate with MathJax for proper conversion
    return `<math><mtext>${latex}</mtext></math>`;
  }

  extractMathText(element) {
    // Extract readable text from math element
    const latex = element.getAttribute('data-latex') || element.textContent;
    return this.latexToText(latex);
  }

  latexToText(latex) {
    // Convert LaTeX to readable text
    return latex
      .replace(/\^{([^}]+)}/g, ' to the power of $1')
      .replace(/\^(\d+)/g, ' to the power of $1')
      .replace(/_{([^}]+)}/g, ' subscript $1')
      .replace(/_(\d+)/g, ' subscript $1')
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '$1 over $2')
      .replace(/\\sqrt{([^}]+)}/g, 'square root of $1')
      .replace(/\\sum/g, 'sum')
      .replace(/\\int/g, 'integral')
      .replace(/\\cdot/g, ' times ')
      .replace(/\\times/g, ' times ')
      .replace(/\\div/g, ' divided by ')
      .replace(/\\pm/g, ' plus or minus ')
      .replace(/\\infty/g, 'infinity')
      .replace(/\\pi/g, 'pi')
      .replace(/\\alpha/g, 'alpha')
      .replace(/\\beta/g, 'beta')
      .replace(/\\gamma/g, 'gamma')
      .replace(/\\delta/g, 'delta')
      .replace(/\\theta/g, 'theta');
  }

  lazyLoadResources() {
    // Implement resource lazy loading
    const nonCriticalScripts = document.querySelectorAll('script[data-lazy]');
    
    nonCriticalScripts.forEach(script => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            newScript.async = true;
            document.body.appendChild(newScript);
            observer.unobserve(script);
          }
        });
      });
      
      observer.observe(script);
    });
  }

  loadFragmentContent(fragment) {
    // Load content for escaped fragment
    console.log('Loading fragment content:', fragment);
  }
}

// Initialize SEO system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mathSEO = new MathTechnicalSEO();
  });
} else {
  window.mathSEO = new MathTechnicalSEO();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathTechnicalSEO;
}