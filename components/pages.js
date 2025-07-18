// Atomic Design System - Pages
// Specific instances of templates with real content

// ============================================
// ALGEBRA TOPIC PAGE
// ============================================

class AlgebraTopicPage {
    constructor() {
        this.topicData = {
            title: 'Algebra',
            description: 'Master the fundamentals of algebra, from basic equations to advanced concepts',
            icon: 'calculator',
            color: 'primary',
            stats: {
                lessons: 24,
                practiceProblems: 450,
                estimatedTime: '12-15 hours',
                difficulty: 'Beginner to Advanced'
            },
            sections: [
                {
                    id: 'basics',
                    title: 'Algebra Basics',
                    description: 'Foundation concepts including variables, expressions, and simple equations',
                    lessons: [
                        { id: 'intro-variables', title: 'Introduction to Variables', duration: '15 min', completed: true },
                        { id: 'algebraic-expressions', title: 'Algebraic Expressions', duration: '20 min', completed: true },
                        { id: 'simplifying', title: 'Simplifying Expressions', duration: '25 min', completed: false },
                        { id: 'evaluating', title: 'Evaluating Expressions', duration: '20 min', completed: false }
                    ]
                },
                {
                    id: 'linear-equations',
                    title: 'Linear Equations',
                    description: 'Solving one-variable and two-variable linear equations',
                    lessons: [
                        { id: 'one-step', title: 'One-Step Equations', duration: '20 min', completed: false },
                        { id: 'two-step', title: 'Two-Step Equations', duration: '25 min', completed: false },
                        { id: 'multi-step', title: 'Multi-Step Equations', duration: '30 min', completed: false },
                        { id: 'variables-both-sides', title: 'Variables on Both Sides', duration: '25 min', completed: false }
                    ]
                },
                {
                    id: 'quadratic',
                    title: 'Quadratic Equations',
                    description: 'Understanding and solving quadratic equations',
                    lessons: [
                        { id: 'intro-quadratics', title: 'Introduction to Quadratics', duration: '30 min', completed: false },
                        { id: 'factoring', title: 'Factoring Quadratics', duration: '35 min', completed: false },
                        { id: 'quadratic-formula', title: 'The Quadratic Formula', duration: '30 min', completed: false },
                        { id: 'completing-square', title: 'Completing the Square', duration: '35 min', completed: false }
                    ]
                }
            ]
        };
    }

    render() {
        const page = document.createElement('div');
        page.className = 'page-algebra-topic';
        
        // Navigation
        const nav = new MathHelpOrganisms.NavigationHeader({
            logo: { text: 'Math Help', href: '/' },
            items: [
                { label: 'Topics', href: '/topics', active: true },
                { label: 'Practice', href: '/practice' },
                { label: 'Tools', href: '/tools' },
                { label: 'Resources', href: '/resources' }
            ],
            showSearch: true,
            showUserMenu: true,
            userInfo: { name: 'John Doe', avatar: '/images/avatar.jpg' }
        });
        page.appendChild(nav.render());
        
        // Main content
        const main = document.createElement('main');
        main.className = 'topic-main';
        
        // Hero section
        const hero = this.createHeroSection();
        main.appendChild(hero);
        
        // Progress overview
        const progress = this.createProgressOverview();
        main.appendChild(progress);
        
        // Course sections
        const sections = this.createCourseSections();
        main.appendChild(sections);
        
        // Additional resources
        const resources = this.createResourcesSection();
        main.appendChild(resources);
        
        page.appendChild(main);
        
        // Footer
        const footer = new MathHelpOrganisms.Footer();
        page.appendChild(footer.render());
        
        return page;
    }

    createHeroSection() {
        const hero = document.createElement('section');
        hero.className = 'topic-hero';
        
        const container = document.createElement('div');
        container.className = 'hero-container';
        
        // Content
        const content = document.createElement('div');
        content.className = 'hero-content';
        
        const icon = MathHelpAtoms.Icon.render(this.topicData.icon, { size: 'xlarge' });
        content.appendChild(icon);
        
        const title = MathHelpAtoms.Typography.Heading(1, this.topicData.title);
        content.appendChild(title);
        
        const description = MathHelpAtoms.Typography.Paragraph(this.topicData.description, { size: 'large' });
        content.appendChild(description);
        
        // Stats
        const stats = document.createElement('div');
        stats.className = 'hero-stats';
        
        Object.entries(this.topicData.stats).forEach(([key, value]) => {
            const stat = document.createElement('div');
            stat.className = 'hero-stat';
            
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            stat.innerHTML = `
                <span class="stat-value">${value}</span>
                <span class="stat-label">${label}</span>
            `;
            stats.appendChild(stat);
        });
        
        content.appendChild(stats);
        
        // CTA buttons
        const actions = document.createElement('div');
        actions.className = 'hero-actions';
        
        const startBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'large'
        });
        actions.appendChild(startBtn.render('Start Learning', () => {
            window.location.href = '/algebra/intro-variables';
        }));
        
        const practiceBtn = new MathHelpAtoms.Button({
            variant: 'secondary',
            size: 'large'
        });
        actions.appendChild(practiceBtn.render('Practice Problems', () => {
            window.location.href = '/algebra/practice';
        }));
        
        content.appendChild(actions);
        container.appendChild(content);
        
        // Decorative elements
        const decoration = document.createElement('div');
        decoration.className = 'hero-decoration';
        decoration.innerHTML = `
            <svg viewBox="0 0 400 400" class="math-pattern">
                <text x="50" y="100" class="math-symbol">∑</text>
                <text x="200" y="150" class="math-symbol">∫</text>
                <text x="300" y="80" class="math-symbol">π</text>
                <text x="100" y="250" class="math-symbol">√</text>
                <text x="250" y="300" class="math-symbol">∞</text>
            </svg>
        `;
        container.appendChild(decoration);
        
        hero.appendChild(container);
        return hero;
    }

    createProgressOverview() {
        const section = document.createElement('section');
        section.className = 'progress-overview';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Your Progress');
        container.appendChild(header);
        
        // Calculate overall progress
        let totalLessons = 0;
        let completedLessons = 0;
        
        this.topicData.sections.forEach(section => {
            totalLessons += section.lessons.length;
            completedLessons += section.lessons.filter(l => l.completed).length;
        });
        
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        
        // Progress stats
        const progressStats = document.createElement('div');
        progressStats.className = 'progress-stats';
        
        const mainProgress = document.createElement('div');
        mainProgress.className = 'main-progress';
        
        const progressRing = this.createProgressRing(progressPercentage);
        mainProgress.appendChild(progressRing);
        
        const progressInfo = document.createElement('div');
        progressInfo.className = 'progress-info';
        progressInfo.innerHTML = `
            <h3>${completedLessons} of ${totalLessons} lessons completed</h3>
            <p>Keep up the great work! You're making excellent progress.</p>
        `;
        mainProgress.appendChild(progressInfo);
        
        progressStats.appendChild(mainProgress);
        
        // Achievement badges
        const achievements = document.createElement('div');
        achievements.className = 'recent-achievements';
        
        const achievementBadges = [
            { icon: '🎯', name: 'Quick Learner', description: 'Complete 5 lessons in one day' },
            { icon: '🔥', name: '7 Day Streak', description: 'Study for 7 consecutive days' },
            { icon: '💯', name: 'Perfect Score', description: 'Get 100% on a practice set' }
        ];
        
        achievementBadges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'achievement-badge';
            badgeEl.innerHTML = `
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-name">${badge.name}</span>
            `;
            achievements.appendChild(badgeEl);
        });
        
        progressStats.appendChild(achievements);
        
        container.appendChild(progressStats);
        section.appendChild(container);
        
        return section;
    }

    createProgressRing(percentage) {
        const ring = document.createElement('div');
        ring.className = 'progress-ring';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        
        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', '60');
        bgCircle.setAttribute('cy', '60');
        bgCircle.setAttribute('r', '54');
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', '#e0e0e0');
        bgCircle.setAttribute('stroke-width', '12');
        svg.appendChild(bgCircle);
        
        // Progress circle
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', '60');
        progressCircle.setAttribute('cy', '60');
        progressCircle.setAttribute('r', '54');
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', '#3498db');
        progressCircle.setAttribute('stroke-width', '12');
        progressCircle.setAttribute('stroke-linecap', 'round');
        progressCircle.setAttribute('stroke-dasharray', `${percentage * 3.39} 339`);
        progressCircle.setAttribute('transform', 'rotate(-90 60 60)');
        svg.appendChild(progressCircle);
        
        // Percentage text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '60');
        text.setAttribute('y', '60');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '0.3em');
        text.setAttribute('class', 'progress-text');
        text.textContent = `${percentage}%`;
        svg.appendChild(text);
        
        ring.appendChild(svg);
        return ring;
    }

    createCourseSections() {
        const container = document.createElement('section');
        container.className = 'course-sections';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Course Content');
        wrapper.appendChild(header);
        
        const sectionsGrid = document.createElement('div');
        sectionsGrid.className = 'sections-grid';
        
        this.topicData.sections.forEach((section, index) => {
            const sectionCard = document.createElement('div');
            sectionCard.className = 'section-card';
            
            // Section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            
            const sectionNumber = document.createElement('span');
            sectionNumber.className = 'section-number';
            sectionNumber.textContent = `Section ${index + 1}`;
            sectionHeader.appendChild(sectionNumber);
            
            const completedCount = section.lessons.filter(l => l.completed).length;
            const progressBadge = new MathHelpAtoms.Badge({
                variant: completedCount === section.lessons.length ? 'success' : 'primary',
                size: 'small'
            });
            sectionHeader.appendChild(progressBadge.render(`${completedCount}/${section.lessons.length}`));
            
            sectionCard.appendChild(sectionHeader);
            
            // Section title and description
            const sectionTitle = MathHelpAtoms.Typography.Heading(3, section.title);
            sectionCard.appendChild(sectionTitle);
            
            const sectionDesc = MathHelpAtoms.Typography.Paragraph(section.description);
            sectionCard.appendChild(sectionDesc);
            
            // Lessons list
            const lessonsList = document.createElement('ul');
            lessonsList.className = 'lessons-list';
            
            section.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                lessonItem.className = `lesson-item ${lesson.completed ? 'completed' : ''}`;
                
                const lessonLink = document.createElement('a');
                lessonLink.href = `/algebra/${lesson.id}`;
                lessonLink.className = 'lesson-link';
                
                lessonLink.innerHTML = `
                    <span class="lesson-status">
                        ${lesson.completed ? 
                            MathHelpAtoms.Icon.render('check', { size: 'small' }).outerHTML : 
                            MathHelpAtoms.Icon.render('circle', { size: 'small' }).outerHTML
                        }
                    </span>
                    <span class="lesson-title">${lesson.title}</span>
                    <span class="lesson-duration">${lesson.duration}</span>
                `;
                
                lessonItem.appendChild(lessonLink);
                lessonsList.appendChild(lessonItem);
            });
            
            sectionCard.appendChild(lessonsList);
            
            // Section action
            const startBtn = new MathHelpAtoms.Button({
                variant: completedCount === 0 ? 'primary' : 'secondary',
                size: 'medium',
                fullWidth: true
            });
            const buttonText = completedCount === 0 ? 'Start Section' : 
                             completedCount === section.lessons.length ? 'Review Section' : 'Continue';
            sectionCard.appendChild(startBtn.render(buttonText, () => {
                const nextLesson = section.lessons.find(l => !l.completed) || section.lessons[0];
                window.location.href = `/algebra/${nextLesson.id}`;
            }));
            
            sectionsGrid.appendChild(sectionCard);
        });
        
        wrapper.appendChild(sectionsGrid);
        container.appendChild(wrapper);
        
        return container;
    }

    createResourcesSection() {
        const section = document.createElement('section');
        section.className = 'topic-resources';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Additional Resources');
        container.appendChild(header);
        
        const resourcesGrid = document.createElement('div');
        resourcesGrid.className = 'resources-grid';
        
        const resources = [
            {
                icon: 'book',
                title: 'Formula Sheet',
                description: 'Quick reference for all algebra formulas',
                href: '/algebra/formulas'
            },
            {
                icon: 'calculator',
                title: 'Equation Solver',
                description: 'Step-by-step equation solving tool',
                href: '/tools/equation-solver'
            },
            {
                icon: 'graph',
                title: 'Graphing Calculator',
                description: 'Visualize functions and equations',
                href: '/tools/graphing-calculator'
            },
            {
                icon: 'help',
                title: 'Practice Tests',
                description: 'Test your knowledge with full assessments',
                href: '/algebra/tests'
            }
        ];
        
        resources.forEach(resource => {
            const card = document.createElement('a');
            card.href = resource.href;
            card.className = 'resource-card';
            
            const icon = MathHelpAtoms.Icon.render(resource.icon, { size: 'large' });
            card.appendChild(icon);
            
            const title = MathHelpAtoms.Typography.Heading(4, resource.title);
            card.appendChild(title);
            
            const description = MathHelpAtoms.Typography.Paragraph(resource.description);
            card.appendChild(description);
            
            resourcesGrid.appendChild(card);
        });
        
        container.appendChild(resourcesGrid);
        section.appendChild(container);
        
        return section;
    }
}

// ============================================
// PRACTICE PROBLEMS PAGE
// ============================================

class PracticeProblemsPage {
    constructor() {
        this.practiceData = {
            title: 'Practice Problems',
            description: 'Sharpen your skills with our comprehensive problem sets',
            currentStreak: 5,
            totalSolved: 127,
            categories: [
                { id: 'algebra', name: 'Algebra', count: 450, icon: 'calculator' },
                { id: 'calculus', name: 'Calculus', count: 380, icon: 'graph' },
                { id: 'geometry', name: 'Geometry', count: 320, icon: 'shapes' },
                { id: 'statistics', name: 'Statistics', count: 290, icon: 'chart' }
            ],
            recentProblems: [
                {
                    id: 'p1',
                    title: 'Quadratic Equation',
                    category: 'Algebra',
                    difficulty: 'Medium',
                    solved: true,
                    accuracy: 100
                },
                {
                    id: 'p2',
                    title: 'Derivative of Composite Function',
                    category: 'Calculus',
                    difficulty: 'Hard',
                    solved: true,
                    accuracy: 85
                },
                {
                    id: 'p3',
                    title: 'Triangle Area Calculation',
                    category: 'Geometry',
                    difficulty: 'Easy',
                    solved: false,
                    accuracy: null
                }
            ]
        };
    }

    render() {
        const page = document.createElement('div');
        page.className = 'page-practice-problems';
        
        // Use practice template
        const template = new MathHelpTemplates.PracticeTemplate({
            practice: this.practiceData,
            navigation: {
                logo: { text: 'Math Help', href: '/' },
                items: [
                    { label: 'Topics', href: '/topics' },
                    { label: 'Practice', href: '/practice', active: true },
                    { label: 'Tools', href: '/tools' },
                    { label: 'Resources', href: '/resources' }
                ],
                showSearch: true,
                showUserMenu: true,
                userInfo: { name: 'John Doe', avatar: '/images/avatar.jpg' }
            },
            showTimer: true,
            showHints: true
        });
        
        // Override with custom content sections
        const templateContent = template.render();
        
        // Insert custom sections before main practice area
        const main = templateContent.querySelector('.practice-main');
        const contentWrapper = main.querySelector('.practice-content-wrapper');
        
        // Add stats section
        const statsSection = this.createStatsSection();
        main.insertBefore(statsSection, contentWrapper);
        
        // Add categories section
        const categoriesSection = this.createCategoriesSection();
        main.insertBefore(categoriesSection, contentWrapper);
        
        page.appendChild(templateContent);
        
        return page;
    }

    createStatsSection() {
        const section = document.createElement('section');
        section.className = 'practice-stats-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        
        // Current streak
        const streakCard = new MathHelpMolecules.StatCard({
            label: 'Current Streak',
            value: this.practiceData.currentStreak,
            unit: 'days',
            icon: 'star',
            color: 'warning',
            trend: 'up',
            trendValue: '+2 days'
        });
        statsGrid.appendChild(streakCard.render());
        
        // Total solved
        const solvedCard = new MathHelpMolecules.StatCard({
            label: 'Problems Solved',
            value: this.practiceData.totalSolved,
            icon: 'check',
            color: 'success',
            trend: 'up',
            trendValue: '+15 this week'
        });
        statsGrid.appendChild(solvedCard.render());
        
        // Average accuracy
        const accuracyCard = new MathHelpMolecules.StatCard({
            label: 'Average Accuracy',
            value: 87,
            unit: '%',
            icon: 'graph',
            color: 'primary',
            trend: 'up',
            trendValue: '+3%'
        });
        statsGrid.appendChild(accuracyCard.render());
        
        // Time spent
        const timeCard = new MathHelpMolecules.StatCard({
            label: 'Time Today',
            value: 45,
            unit: 'min',
            icon: 'clock',
            color: 'info',
            trend: 'neutral'
        });
        statsGrid.appendChild(timeCard.render());
        
        container.appendChild(statsGrid);
        section.appendChild(container);
        
        return section;
    }

    createCategoriesSection() {
        const section = document.createElement('section');
        section.className = 'practice-categories';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Choose a Category');
        container.appendChild(header);
        
        const categoriesGrid = document.createElement('div');
        categoriesGrid.className = 'categories-grid';
        
        this.practiceData.categories.forEach(category => {
            const card = document.createElement('a');
            card.href = `/practice/${category.id}`;
            card.className = 'category-card';
            
            const icon = MathHelpAtoms.Icon.render(category.icon, { size: 'large' });
            card.appendChild(icon);
            
            const name = MathHelpAtoms.Typography.Heading(3, category.name);
            card.appendChild(name);
            
            const count = document.createElement('p');
            count.className = 'problem-count';
            count.textContent = `${category.count} problems`;
            card.appendChild(count);
            
            const startBtn = new MathHelpAtoms.Button({
                variant: 'primary',
                size: 'medium'
            });
            card.appendChild(startBtn.render('Start Practice', (e) => {
                e.preventDefault();
                window.location.href = `/practice/${category.id}`;
            }));
            
            categoriesGrid.appendChild(card);
        });
        
        container.appendChild(categoriesGrid);
        section.appendChild(container);
        
        return section;
    }
}

// ============================================
// USER PROGRESS PAGE
// ============================================

class UserProgressPage {
    constructor() {
        this.userData = {
            name: 'John Doe',
            joinDate: '2024-01-15',
            level: 12,
            xp: 3450,
            nextLevelXp: 4000,
            overallStats: {
                totalTime: 4530, // minutes
                problemsSolved: 342,
                accuracy: 85,
                topicsCompleted: 8,
                currentStreak: 15,
                longestStreak: 23
            },
            weeklyActivity: [
                { day: 'Mon', problems: 12, minutes: 45 },
                { day: 'Tue', problems: 8, minutes: 30 },
                { day: 'Wed', problems: 15, minutes: 60 },
                { day: 'Thu', problems: 10, minutes: 40 },
                { day: 'Fri', problems: 20, minutes: 75 },
                { day: 'Sat', problems: 5, minutes: 20 },
                { day: 'Sun', problems: 0, minutes: 0 }
            ],
            topicProgress: [
                { name: 'Algebra', completed: 85, total: 100 },
                { name: 'Calculus', completed: 45, total: 80 },
                { name: 'Geometry', completed: 60, total: 70 },
                { name: 'Statistics', completed: 30, total: 60 },
                { name: 'Trigonometry', completed: 15, total: 50 }
            ],
            achievements: [
                { id: 'first-problem', name: 'First Steps', description: 'Solve your first problem', icon: '👶', earned: true, date: '2024-01-15' },
                { id: 'week-streak', name: 'Week Warrior', description: '7 day streak', icon: '🔥', earned: true, date: '2024-01-22' },
                { id: 'century', name: 'Century Club', description: 'Solve 100 problems', icon: '💯', earned: true, date: '2024-02-10' },
                { id: 'perfect-set', name: 'Perfectionist', description: 'Complete a problem set with 100% accuracy', icon: '🎯', earned: true, date: '2024-02-15' },
                { id: 'speed-demon', name: 'Speed Demon', description: 'Solve 10 problems in under 10 minutes', icon: '⚡', earned: false, progress: 70 },
                { id: 'master-algebra', name: 'Algebra Master', description: 'Complete all algebra lessons', icon: '🎓', earned: false, progress: 85 }
            ]
        };
    }

    render() {
        const page = document.createElement('div');
        page.className = 'page-user-progress';
        
        // Navigation
        const nav = new MathHelpOrganisms.NavigationHeader({
            logo: { text: 'Math Help', href: '/' },
            items: [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Progress', href: '/progress', active: true },
                { label: 'Practice', href: '/practice' },
                { label: 'Settings', href: '/settings' }
            ],
            showSearch: true,
            showUserMenu: true,
            userInfo: { name: this.userData.name, avatar: '/images/avatar.jpg' }
        });
        page.appendChild(nav.render());
        
        // Main content
        const main = document.createElement('main');
        main.className = 'progress-main';
        
        // Page header
        const pageHeader = this.createPageHeader();
        main.appendChild(pageHeader);
        
        // Level progress
        const levelProgress = this.createLevelProgress();
        main.appendChild(levelProgress);
        
        // Stats overview
        const statsOverview = this.createStatsOverview();
        main.appendChild(statsOverview);
        
        // Activity chart
        const activityChart = this.createActivityChart();
        main.appendChild(activityChart);
        
        // Topic progress
        const topicProgress = this.createTopicProgress();
        main.appendChild(topicProgress);
        
        // Achievements
        const achievements = this.createAchievements();
        main.appendChild(achievements);
        
        page.appendChild(main);
        
        // Footer
        const footer = new MathHelpOrganisms.Footer();
        page.appendChild(footer.render());
        
        return page;
    }

    createPageHeader() {
        const header = document.createElement('header');
        header.className = 'progress-page-header';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const title = MathHelpAtoms.Typography.Heading(1, 'Your Progress');
        container.appendChild(title);
        
        const subtitle = MathHelpAtoms.Typography.Paragraph(
            `Member since ${new Date(this.userData.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
        );
        container.appendChild(subtitle);
        
        header.appendChild(container);
        return header;
    }

    createLevelProgress() {
        const section = document.createElement('section');
        section.className = 'level-progress-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const levelCard = document.createElement('div');
        levelCard.className = 'level-card';
        
        // Level info
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info';
        
        const levelBadge = document.createElement('div');
        levelBadge.className = 'level-badge';
        levelBadge.innerHTML = `
            <span class="level-number">${this.userData.level}</span>
            <span class="level-label">Level</span>
        `;
        levelInfo.appendChild(levelBadge);
        
        const xpInfo = document.createElement('div');
        xpInfo.className = 'xp-info';
        
        const xpText = MathHelpAtoms.Typography.Heading(3, `${this.userData.xp} / ${this.userData.nextLevelXp} XP`);
        xpInfo.appendChild(xpText);
        
        const xpSubtext = MathHelpAtoms.Typography.Paragraph('Experience points to next level');
        xpInfo.appendChild(xpSubtext);
        
        levelInfo.appendChild(xpInfo);
        levelCard.appendChild(levelInfo);
        
        // XP progress bar
        const xpProgress = MathHelpAtoms.Loading.ProgressBar(
            this.userData.xp,
            this.userData.nextLevelXp,
            { variant: 'primary', showValue: true }
        );
        xpProgress.className += ' xp-progress';
        levelCard.appendChild(xpProgress);
        
        // Motivational message
        const message = document.createElement('p');
        message.className = 'level-message';
        message.textContent = `Only ${this.userData.nextLevelXp - this.userData.xp} XP until level ${this.userData.level + 1}!`;
        levelCard.appendChild(message);
        
        container.appendChild(levelCard);
        section.appendChild(container);
        
        return section;
    }

    createStatsOverview() {
        const section = document.createElement('section');
        section.className = 'stats-overview-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Overall Statistics');
        container.appendChild(header);
        
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        
        // Create stat cards
        const stats = [
            {
                label: 'Total Study Time',
                value: Math.floor(this.userData.overallStats.totalTime / 60),
                unit: 'hours',
                icon: 'clock',
                color: 'primary'
            },
            {
                label: 'Problems Solved',
                value: this.userData.overallStats.problemsSolved,
                icon: 'check',
                color: 'success'
            },
            {
                label: 'Accuracy Rate',
                value: this.userData.overallStats.accuracy,
                unit: '%',
                icon: 'graph',
                color: 'info'
            },
            {
                label: 'Topics Completed',
                value: this.userData.overallStats.topicsCompleted,
                icon: 'book',
                color: 'warning'
            },
            {
                label: 'Current Streak',
                value: this.userData.overallStats.currentStreak,
                unit: 'days',
                icon: 'star',
                color: 'danger'
            },
            {
                label: 'Longest Streak',
                value: this.userData.overallStats.longestStreak,
                unit: 'days',
                icon: 'star',
                color: 'secondary'
            }
        ];
        
        stats.forEach(stat => {
            const statCard = new MathHelpMolecules.StatCard(stat);
            statsGrid.appendChild(statCard.render());
        });
        
        container.appendChild(statsGrid);
        section.appendChild(container);
        
        return section;
    }

    createActivityChart() {
        const section = document.createElement('section');
        section.className = 'activity-chart-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'This Week\'s Activity');
        container.appendChild(header);
        
        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card';
        
        // Chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'activity-chart';
        
        // Find max values for scaling
        const maxProblems = Math.max(...this.userData.weeklyActivity.map(d => d.problems));
        const maxMinutes = Math.max(...this.userData.weeklyActivity.map(d => d.minutes));
        
        // Create bars
        this.userData.weeklyActivity.forEach(day => {
            const dayBar = document.createElement('div');
            dayBar.className = 'day-bar';
            
            const problemsBar = document.createElement('div');
            problemsBar.className = 'bar problems-bar';
            problemsBar.style.height = `${(day.problems / maxProblems) * 100}%`;
            problemsBar.setAttribute('data-tooltip', `${day.problems} problems`);
            
            const minutesBar = document.createElement('div');
            minutesBar.className = 'bar minutes-bar';
            minutesBar.style.height = `${(day.minutes / maxMinutes) * 100}%`;
            minutesBar.setAttribute('data-tooltip', `${day.minutes} minutes`);
            
            const dayLabel = document.createElement('span');
            dayLabel.className = 'day-label';
            dayLabel.textContent = day.day;
            
            dayBar.appendChild(problemsBar);
            dayBar.appendChild(minutesBar);
            dayBar.appendChild(dayLabel);
            
            chartContainer.appendChild(dayBar);
        });
        
        chartCard.appendChild(chartContainer);
        
        // Legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        legend.innerHTML = `
            <span class="legend-item"><span class="legend-color problems"></span> Problems Solved</span>
            <span class="legend-item"><span class="legend-color minutes"></span> Time Spent (minutes)</span>
        `;
        chartCard.appendChild(legend);
        
        container.appendChild(chartCard);
        section.appendChild(container);
        
        return section;
    }

    createTopicProgress() {
        const section = document.createElement('section');
        section.className = 'topic-progress-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Progress by Topic');
        container.appendChild(header);
        
        const topicsGrid = document.createElement('div');
        topicsGrid.className = 'topics-progress-grid';
        
        this.userData.topicProgress.forEach(topic => {
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-progress-card';
            
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            
            const topicName = MathHelpAtoms.Typography.Heading(4, topic.name);
            topicHeader.appendChild(topicName);
            
            const percentage = Math.round((topic.completed / topic.total) * 100);
            const percentageBadge = new MathHelpAtoms.Badge({
                variant: percentage === 100 ? 'success' : 'primary',
                size: 'small'
            });
            topicHeader.appendChild(percentageBadge.render(`${percentage}%`));
            
            topicCard.appendChild(topicHeader);
            
            // Progress bar
            const progressBar = MathHelpAtoms.Loading.ProgressBar(
                topic.completed,
                topic.total,
                { variant: percentage === 100 ? 'success' : 'primary' }
            );
            topicCard.appendChild(progressBar);
            
            // Stats
            const stats = document.createElement('div');
            stats.className = 'topic-stats';
            stats.textContent = `${topic.completed} of ${topic.total} lessons completed`;
            topicCard.appendChild(stats);
            
            topicsGrid.appendChild(topicCard);
        });
        
        container.appendChild(topicsGrid);
        section.appendChild(container);
        
        return section;
    }

    createAchievements() {
        const section = document.createElement('section');
        section.className = 'achievements-section';
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Achievements');
        container.appendChild(header);
        
        // Tabs for earned/in-progress
        const tabs = document.createElement('div');
        tabs.className = 'achievement-tabs';
        
        const earnedTab = document.createElement('button');
        earnedTab.className = 'tab-button active';
        earnedTab.textContent = `Earned (${this.userData.achievements.filter(a => a.earned).length})`;
        tabs.appendChild(earnedTab);
        
        const progressTab = document.createElement('button');
        progressTab.className = 'tab-button';
        progressTab.textContent = `In Progress (${this.userData.achievements.filter(a => !a.earned).length})`;
        tabs.appendChild(progressTab);
        
        container.appendChild(tabs);
        
        // Achievements grid
        const achievementsGrid = document.createElement('div');
        achievementsGrid.className = 'achievements-grid';
        
        // Show earned achievements by default
        const earnedAchievements = this.userData.achievements.filter(a => a.earned);
        
        earnedAchievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = 'achievement-card earned';
            
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                <span class="achievement-date">Earned ${new Date(achievement.date).toLocaleDateString()}</span>
            `;
            
            achievementsGrid.appendChild(card);
        });
        
        container.appendChild(achievementsGrid);
        
        // Tab switching
        earnedTab.onclick = () => {
            earnedTab.classList.add('active');
            progressTab.classList.remove('active');
            this.showEarnedAchievements(achievementsGrid);
        };
        
        progressTab.onclick = () => {
            progressTab.classList.add('active');
            earnedTab.classList.remove('active');
            this.showInProgressAchievements(achievementsGrid);
        };
        
        section.appendChild(container);
        return section;
    }

    showEarnedAchievements(grid) {
        grid.innerHTML = '';
        const earned = this.userData.achievements.filter(a => a.earned);
        
        earned.forEach(achievement => {
            const card = document.createElement('div');
            card.className = 'achievement-card earned';
            
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                <span class="achievement-date">Earned ${new Date(achievement.date).toLocaleDateString()}</span>
            `;
            
            grid.appendChild(card);
        });
    }

    showInProgressAchievements(grid) {
        grid.innerHTML = '';
        const inProgress = this.userData.achievements.filter(a => !a.earned);
        
        inProgress.forEach(achievement => {
            const card = document.createElement('div');
            card.className = 'achievement-card in-progress';
            
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                    </div>
                    <span class="progress-text">${achievement.progress}% Complete</span>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
}

// Export all pages
const Pages = {
    AlgebraTopicPage,
    PracticeProblemsPage,
    UserProgressPage
};

window.MathHelpPages = Pages;