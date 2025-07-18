// Atomic Design System - Organisms
// Complex components combining multiple molecules and atoms

// ============================================
// NAVIGATION ORGANISM
// ============================================

class NavigationHeader {
    constructor(options = {}) {
        this.logo = options.logo || { text: 'Math Help', href: '/' };
        this.items = options.items || [];
        this.showSearch = options.showSearch !== false;
        this.showUserMenu = options.showUserMenu || false;
        this.userInfo = options.userInfo || null;
        this.sticky = options.sticky || false;
        this.transparent = options.transparent || false;
    }

    render() {
        const header = document.createElement('header');
        header.className = `navigation-header ${this.sticky ? 'sticky' : ''} ${this.transparent ? 'transparent' : ''}`;
        
        // Container
        const container = document.createElement('div');
        container.className = 'nav-container';
        
        // Logo section
        const logoSection = document.createElement('div');
        logoSection.className = 'nav-logo-section';
        
        const logoLink = document.createElement('a');
        logoLink.href = this.logo.href;
        logoLink.className = 'nav-logo';
        
        if (this.logo.image) {
            const logoImg = document.createElement('img');
            logoImg.src = this.logo.image;
            logoImg.alt = this.logo.text;
            logoLink.appendChild(logoImg);
        } else {
            logoLink.innerHTML = `
                ${MathHelpAtoms.Icon.render('calculator', { size: 'large' }).outerHTML}
                <span class="logo-text">${this.logo.text}</span>
            `;
        }
        
        logoSection.appendChild(logoLink);
        container.appendChild(logoSection);
        
        // Main navigation
        const mainNav = document.createElement('nav');
        mainNav.className = 'nav-main';
        mainNav.setAttribute('role', 'navigation');
        mainNav.setAttribute('aria-label', 'Main navigation');
        
        const navList = document.createElement('ul');
        navList.className = 'nav-list';
        
        this.items.forEach(item => {
            const navItem = new MathHelpMolecules.NavigationItem(item);
            navList.appendChild(navItem.render());
        });
        
        mainNav.appendChild(navList);
        container.appendChild(mainNav);
        
        // Actions section
        const actionsSection = document.createElement('div');
        actionsSection.className = 'nav-actions';
        
        // Search
        if (this.showSearch) {
            const searchBtn = new MathHelpAtoms.Button({
                variant: 'ghost',
                size: 'medium',
                icon: MathHelpAtoms.Icon.render('search', { size: 'small' }).outerHTML
            });
            actionsSection.appendChild(searchBtn.render('Search', () => {
                this.toggleSearch();
            }));
        }
        
        // User menu
        if (this.showUserMenu) {
            actionsSection.appendChild(this.createUserMenu());
        } else {
            const loginBtn = new MathHelpAtoms.Button({
                variant: 'primary',
                size: 'medium'
            });
            actionsSection.appendChild(loginBtn.render('Sign In', () => {
                window.location.href = '/login';
            }));
        }
        
        container.appendChild(actionsSection);
        
        // Mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'nav-mobile-toggle';
        mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
        mobileMenuBtn.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        mobileMenuBtn.onclick = () => this.toggleMobileMenu(header);
        container.appendChild(mobileMenuBtn);
        
        header.appendChild(container);
        
        // Search overlay
        if (this.showSearch) {
            header.appendChild(this.createSearchOverlay());
        }
        
        // Mobile menu
        header.appendChild(this.createMobileMenu());
        
        return header;
    }

    createUserMenu() {
        const userMenu = document.createElement('div');
        userMenu.className = 'nav-user-menu';
        
        const userBtn = document.createElement('button');
        userBtn.className = 'user-menu-trigger';
        userBtn.innerHTML = `
            <img src="${this.userInfo?.avatar || '/images/default-avatar.png'}" alt="User avatar" class="user-avatar">
            <span class="user-name">${this.userInfo?.name || 'User'}</span>
            ${MathHelpAtoms.Icon.render('arrow_down', { size: 'small' }).outerHTML}
        `;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'user-menu-dropdown';
        
        const menuItems = [
            { icon: 'graph', label: 'Dashboard', href: '/dashboard' },
            { icon: 'star', label: 'Progress', href: '/progress' },
            { icon: 'book', label: 'My Courses', href: '/courses' },
            { divider: true },
            { icon: 'help', label: 'Settings', href: '/settings' },
            { icon: 'arrow_left', label: 'Sign Out', onClick: () => this.signOut() }
        ];
        
        menuItems.forEach(item => {
            if (item.divider) {
                dropdown.appendChild(MathHelpAtoms.Divider.Horizontal({ margin: '8px 0' }));
            } else {
                const menuItem = document.createElement('a');
                menuItem.href = item.href || '#';
                menuItem.className = 'user-menu-item';
                menuItem.innerHTML = `
                    ${MathHelpAtoms.Icon.render(item.icon, { size: 'small' }).outerHTML}
                    <span>${item.label}</span>
                `;
                
                if (item.onClick) {
                    menuItem.onclick = (e) => {
                        e.preventDefault();
                        item.onClick();
                    };
                }
                
                dropdown.appendChild(menuItem);
            }
        });
        
        userMenu.appendChild(userBtn);
        userMenu.appendChild(dropdown);
        
        // Toggle dropdown
        userBtn.onclick = () => {
            userMenu.classList.toggle('active');
        };
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
        
        return userMenu;
    }

    createSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-overlay-container';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'search-close';
        closeBtn.innerHTML = MathHelpAtoms.Icon.render('close', { size: 'large' }).outerHTML;
        closeBtn.onclick = () => this.toggleSearch();
        searchContainer.appendChild(closeBtn);
        
        const searchBar = new MathHelpMolecules.SearchBar({
            placeholder: 'Search topics, problems, or formulas...',
            mathMode: true,
            suggestions: [
                { text: 'Quadratic Formula', icon: 'calculator', category: 'Algebra' },
                { text: 'Derivative Rules', icon: 'graph', category: 'Calculus' },
                { text: 'Pythagorean Theorem', icon: 'book', category: 'Geometry' }
            ],
            onSearch: (query) => {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        });
        
        searchContainer.appendChild(searchBar.render());
        
        // Quick links
        const quickLinks = document.createElement('div');
        quickLinks.className = 'search-quick-links';
        quickLinks.innerHTML = '<h3>Popular Topics</h3>';
        
        const topics = ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry'];
        const topicsGrid = document.createElement('div');
        topicsGrid.className = 'topics-grid';
        
        topics.forEach(topic => {
            const topicBtn = new MathHelpAtoms.Button({
                variant: 'secondary',
                size: 'medium'
            });
            topicsGrid.appendChild(topicBtn.render(topic, () => {
                window.location.href = `/${topic.toLowerCase()}`;
            }));
        });
        
        quickLinks.appendChild(topicsGrid);
        searchContainer.appendChild(quickLinks);
        
        overlay.appendChild(searchContainer);
        
        return overlay;
    }

    createMobileMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        const menuContent = document.createElement('div');
        menuContent.className = 'mobile-menu-content';
        
        // Mobile menu header
        const menuHeader = document.createElement('div');
        menuHeader.className = 'mobile-menu-header';
        menuHeader.innerHTML = `
            <span class="mobile-menu-title">Menu</span>
            <button class="mobile-menu-close">
                ${MathHelpAtoms.Icon.render('close', { size: 'medium' }).outerHTML}
            </button>
        `;
        
        menuHeader.querySelector('.mobile-menu-close').onclick = () => {
            this.toggleMobileMenu();
        };
        
        menuContent.appendChild(menuHeader);
        
        // Mobile navigation
        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        
        const mobileNavList = document.createElement('ul');
        mobileNavList.className = 'mobile-nav-list';
        
        this.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'mobile-nav-item';
            
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'mobile-nav-link';
            link.innerHTML = `
                ${item.icon ? MathHelpAtoms.Icon.render(item.icon, { size: 'small' }).outerHTML : ''}
                <span>${item.label}</span>
                ${item.children ? MathHelpAtoms.Icon.render('arrow_right', { size: 'small' }).outerHTML : ''}
            `;
            
            li.appendChild(link);
            mobileNavList.appendChild(li);
        });
        
        mobileNav.appendChild(mobileNavList);
        menuContent.appendChild(mobileNav);
        
        // Mobile actions
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-menu-actions';
        
        if (!this.showUserMenu) {
            const signInBtn = new MathHelpAtoms.Button({
                variant: 'primary',
                size: 'large',
                fullWidth: true
            });
            mobileActions.appendChild(signInBtn.render('Sign In', () => {
                window.location.href = '/login';
            }));
        }
        
        menuContent.appendChild(mobileActions);
        mobileMenu.appendChild(menuContent);
        
        return mobileMenu;
    }

    toggleSearch() {
        const overlay = document.querySelector('.search-overlay');
        if (overlay) {
            overlay.classList.toggle('active');
            if (overlay.classList.contains('active')) {
                setTimeout(() => {
                    overlay.querySelector('input').focus();
                }, 100);
            }
        }
    }

    toggleMobileMenu(header) {
        const mobileMenu = header.querySelector('.mobile-menu');
        const toggle = header.querySelector('.nav-mobile-toggle');
        
        mobileMenu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    signOut() {
        // Handle sign out
        console.log('Signing out...');
        window.location.href = '/logout';
    }
}

// ============================================
// PROBLEM SET ORGANISM
// ============================================

class ProblemSet {
    constructor(options = {}) {
        this.title = options.title || 'Practice Problems';
        this.problems = options.problems || [];
        this.showProgress = options.showProgress !== false;
        this.showFilters = options.showFilters !== false;
        this.onComplete = options.onComplete || (() => {});
        this.layout = options.layout || 'grid'; // grid, list
    }

    render() {
        const container = document.createElement('div');
        container.className = 'problem-set';
        
        // Header
        const header = document.createElement('div');
        header.className = 'problem-set-header';
        
        const titleSection = document.createElement('div');
        titleSection.className = 'problem-set-title-section';
        
        const title = MathHelpAtoms.Typography.Heading(2, this.title);
        titleSection.appendChild(title);
        
        if (this.showProgress) {
            const progress = this.calculateProgress();
            const progressBadge = new MathHelpAtoms.Badge({
                variant: progress.percentage === 100 ? 'success' : 'primary'
            });
            titleSection.appendChild(progressBadge.render(`${progress.completed}/${progress.total} Complete`));
        }
        
        header.appendChild(titleSection);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'problem-set-actions';
        
        // Layout toggle
        const layoutToggle = document.createElement('div');
        layoutToggle.className = 'layout-toggle';
        
        ['grid', 'list'].forEach(layout => {
            const btn = new MathHelpAtoms.Button({
                variant: this.layout === layout ? 'primary' : 'ghost',
                size: 'small',
                icon: MathHelpAtoms.Icon.render(layout === 'grid' ? 'grid' : 'list', { size: 'small' }).outerHTML
            });
            layoutToggle.appendChild(btn.render('', () => {
                this.layout = layout;
                this.updateLayout(container);
            }));
        });
        
        actions.appendChild(layoutToggle);
        header.appendChild(actions);
        container.appendChild(header);
        
        // Filters
        if (this.showFilters) {
            container.appendChild(this.createFilters());
        }
        
        // Progress bar
        if (this.showProgress) {
            const progress = this.calculateProgress();
            const progressBar = MathHelpAtoms.Loading.ProgressBar(
                progress.completed, 
                progress.total,
                { variant: 'primary', showValue: true }
            );
            container.appendChild(progressBar);
        }
        
        // Problems container
        const problemsContainer = document.createElement('div');
        problemsContainer.className = `problems-container layout-${this.layout}`;
        
        this.problems.forEach((problem, index) => {
            const problemCard = new MathHelpMolecules.ProblemCard({
                problem: {
                    ...problem,
                    number: index + 1
                },
                interactive: true,
                onSolve: (p) => this.handleProblemSolve(p, container),
                onBookmark: (p) => this.handleBookmark(p)
            });
            
            const wrapper = document.createElement('div');
            wrapper.className = 'problem-wrapper';
            wrapper.setAttribute('data-problem-id', problem.id);
            wrapper.appendChild(problemCard.render());
            
            problemsContainer.appendChild(wrapper);
        });
        
        container.appendChild(problemsContainer);
        
        // Completion message
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.style.display = 'none';
        
        const successAlert = new MathHelpMolecules.Alert({
            type: 'success',
            title: 'Congratulations!',
            message: 'You\'ve completed all problems in this set.',
            actions: [
                {
                    label: 'Next Set',
                    variant: 'primary',
                    onClick: () => this.onComplete()
                },
                {
                    label: 'Review Solutions',
                    variant: 'ghost',
                    onClick: () => this.showSolutions()
                }
            ]
        });
        
        completionMessage.appendChild(successAlert.render());
        container.appendChild(completionMessage);
        
        return container;
    }

    createFilters() {
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'problem-filters';
        
        const filters = [
            {
                label: 'Difficulty',
                options: ['All', 'Easy', 'Medium', 'Hard'],
                onChange: (value) => this.filterByDifficulty(value)
            },
            {
                label: 'Status',
                options: ['All', 'Not Started', 'In Progress', 'Completed'],
                onChange: (value) => this.filterByStatus(value)
            },
            {
                label: 'Topic',
                options: ['All', 'Equations', 'Functions', 'Graphs', 'Word Problems'],
                onChange: (value) => this.filterByTopic(value)
            }
        ];
        
        filters.forEach(filter => {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'filter-group';
            
            const label = MathHelpAtoms.Typography.Label(filter.label, `filter-${filter.label.toLowerCase()}`);
            filterGroup.appendChild(label);
            
            const select = document.createElement('select');
            select.id = `filter-${filter.label.toLowerCase()}`;
            select.className = 'filter-select';
            
            filter.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                select.appendChild(optionEl);
            });
            
            select.onchange = (e) => filter.onChange(e.target.value);
            filterGroup.appendChild(select);
            
            filtersContainer.appendChild(filterGroup);
        });
        
        // Reset button
        const resetBtn = new MathHelpAtoms.Button({
            variant: 'ghost',
            size: 'small'
        });
        filtersContainer.appendChild(resetBtn.render('Reset Filters', () => {
            this.resetFilters(filtersContainer);
        }));
        
        return filtersContainer;
    }

    calculateProgress() {
        const completed = this.problems.filter(p => p.completed).length;
        const total = this.problems.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
    }

    handleProblemSolve(problem, container) {
        problem.completed = true;
        
        // Update progress
        const progress = this.calculateProgress();
        
        // Update progress bar
        const progressBar = container.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${progress.percentage}%`;
            const label = progressBar.querySelector('.progress-bar-label');
            if (label) {
                label.textContent = `${progress.percentage}%`;
            }
        }
        
        // Update badge
        const badge = container.querySelector('.problem-set-title-section .badge');
        if (badge) {
            badge.querySelector('span').textContent = `${progress.completed}/${progress.total} Complete`;
            if (progress.percentage === 100) {
                badge.className = 'badge badge-success badge-medium';
            }
        }
        
        // Check if all problems completed
        if (progress.percentage === 100) {
            const completionMessage = container.querySelector('.completion-message');
            if (completionMessage) {
                completionMessage.style.display = 'block';
                completionMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    handleBookmark(problem) {
        console.log('Bookmarked problem:', problem);
        // Save bookmark to user preferences
    }

    updateLayout(container) {
        const problemsContainer = container.querySelector('.problems-container');
        problemsContainer.className = `problems-container layout-${this.layout}`;
        
        // Update layout toggle buttons
        const layoutButtons = container.querySelectorAll('.layout-toggle button');
        layoutButtons.forEach((btn, index) => {
            const isActive = (index === 0 && this.layout === 'grid') || 
                           (index === 1 && this.layout === 'list');
            btn.className = isActive ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small';
        });
    }

    filterByDifficulty(difficulty) {
        this.applyFilter('difficulty', difficulty);
    }

    filterByStatus(status) {
        this.applyFilter('status', status);
    }

    filterByTopic(topic) {
        this.applyFilter('topic', topic);
    }

    applyFilter(filterType, value) {
        const problemWrappers = document.querySelectorAll('.problem-wrapper');
        
        problemWrappers.forEach(wrapper => {
            const problemId = wrapper.getAttribute('data-problem-id');
            const problem = this.problems.find(p => p.id === problemId);
            
            if (!problem) return;
            
            let shouldShow = true;
            
            if (value !== 'All') {
                switch (filterType) {
                    case 'difficulty':
                        shouldShow = problem.difficulty === value;
                        break;
                    case 'status':
                        if (value === 'Completed') shouldShow = problem.completed;
                        else if (value === 'Not Started') shouldShow = !problem.started && !problem.completed;
                        else if (value === 'In Progress') shouldShow = problem.started && !problem.completed;
                        break;
                    case 'topic':
                        shouldShow = problem.topic === value;
                        break;
                }
            }
            
            wrapper.style.display = shouldShow ? '' : 'none';
        });
    }

    resetFilters(filtersContainer) {
        const selects = filtersContainer.querySelectorAll('select');
        selects.forEach(select => {
            select.value = 'All';
        });
        
        // Show all problems
        const problemWrappers = document.querySelectorAll('.problem-wrapper');
        problemWrappers.forEach(wrapper => {
            wrapper.style.display = '';
        });
    }

    showSolutions() {
        console.log('Showing solutions...');
        // Navigate to solutions page or show solutions overlay
    }
}

// ============================================
// DASHBOARD ORGANISM
// ============================================

class Dashboard {
    constructor(options = {}) {
        this.userStats = options.userStats || {};
        this.recentActivity = options.recentActivity || [];
        this.recommendations = options.recommendations || [];
        this.achievements = options.achievements || [];
        this.weeklyGoal = options.weeklyGoal || { current: 0, target: 50 };
    }

    render() {
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        
        // Welcome section
        const welcomeSection = this.createWelcomeSection();
        dashboard.appendChild(welcomeSection);
        
        // Stats grid
        const statsGrid = this.createStatsGrid();
        dashboard.appendChild(statsGrid);
        
        // Main content grid
        const contentGrid = document.createElement('div');
        contentGrid.className = 'dashboard-content-grid';
        
        // Left column
        const leftColumn = document.createElement('div');
        leftColumn.className = 'dashboard-column left';
        
        // Weekly progress
        leftColumn.appendChild(this.createWeeklyProgress());
        
        // Recent activity
        leftColumn.appendChild(this.createRecentActivity());
        
        contentGrid.appendChild(leftColumn);
        
        // Right column
        const rightColumn = document.createElement('div');
        rightColumn.className = 'dashboard-column right';
        
        // Achievements
        rightColumn.appendChild(this.createAchievements());
        
        // Recommendations
        rightColumn.appendChild(this.createRecommendations());
        
        contentGrid.appendChild(rightColumn);
        
        dashboard.appendChild(contentGrid);
        
        return dashboard;
    }

    createWelcomeSection() {
        const section = document.createElement('section');
        section.className = 'welcome-section';
        
        const greeting = document.createElement('div');
        greeting.className = 'welcome-greeting';
        
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        
        greeting.innerHTML = `
            <h1>Good ${timeOfDay}, ${this.userStats.name || 'Student'}!</h1>
            <p>Ready to continue your math journey?</p>
        `;
        
        section.appendChild(greeting);
        
        // Quick actions
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        
        const actions = [
            { label: 'Continue Learning', icon: 'book', variant: 'primary', href: '/continue' },
            { label: 'Practice Problems', icon: 'calculator', variant: 'secondary', href: '/practice' },
            { label: 'Review Progress', icon: 'graph', variant: 'ghost', href: '/progress' }
        ];
        
        actions.forEach(action => {
            const btn = new MathHelpAtoms.Button({
                variant: action.variant,
                size: 'medium',
                icon: MathHelpAtoms.Icon.render(action.icon, { size: 'small' }).outerHTML
            });
            quickActions.appendChild(btn.render(action.label, () => {
                window.location.href = action.href;
            }));
        });
        
        section.appendChild(quickActions);
        
        return section;
    }

    createStatsGrid() {
        const grid = document.createElement('div');
        grid.className = 'stats-grid';
        
        const stats = [
            {
                label: 'Problems Solved',
                value: this.userStats.problemsSolved || 0,
                icon: 'check',
                color: 'success',
                trend: 'up',
                trendValue: '+12%'
            },
            {
                label: 'Study Streak',
                value: this.userStats.studyStreak || 0,
                unit: 'days',
                icon: 'star',
                color: 'warning',
                trend: 'up',
                trendValue: '+3 days'
            },
            {
                label: 'Accuracy Rate',
                value: this.userStats.accuracy || 85,
                unit: '%',
                icon: 'graph',
                color: 'primary',
                trend: 'neutral',
                trendValue: 'Stable'
            },
            {
                label: 'Topics Mastered',
                value: this.userStats.topicsMastered || 7,
                icon: 'book',
                color: 'info',
                trend: 'up',
                trendValue: '+2 this week'
            }
        ];
        
        stats.forEach(stat => {
            const statCard = new MathHelpMolecules.StatCard(stat);
            grid.appendChild(statCard.render());
        });
        
        return grid;
    }

    createWeeklyProgress() {
        const section = document.createElement('section');
        section.className = 'weekly-progress-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h3>Weekly Goal</h3>
            <span class="goal-text">${this.weeklyGoal.current}/${this.weeklyGoal.target} problems</span>
        `;
        section.appendChild(header);
        
        // Progress visualization
        const progressContainer = document.createElement('div');
        progressContainer.className = 'weekly-progress-container';
        
        // Days of week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyProgress = [8, 12, 6, 15, 10, 5, 0]; // Example data
        
        const chart = document.createElement('div');
        chart.className = 'progress-chart';
        
        days.forEach((day, index) => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            
            const bar = document.createElement('div');
            bar.className = 'progress-bar-vertical';
            bar.style.height = `${Math.min(dailyProgress[index] * 5, 100)}%`;
            
            const label = document.createElement('span');
            label.className = 'day-label';
            label.textContent = day;
            
            dayColumn.appendChild(bar);
            dayColumn.appendChild(label);
            chart.appendChild(dayColumn);
        });
        
        progressContainer.appendChild(chart);
        
        // Summary
        const summary = document.createElement('div');
        summary.className = 'progress-summary';
        
        const percentage = Math.round((this.weeklyGoal.current / this.weeklyGoal.target) * 100);
        const progressBar = MathHelpAtoms.Loading.ProgressBar(
            this.weeklyGoal.current,
            this.weeklyGoal.target,
            { variant: percentage >= 100 ? 'success' : 'primary', showValue: true }
        );
        
        summary.appendChild(progressBar);
        progressContainer.appendChild(summary);
        
        section.appendChild(progressContainer);
        
        return section;
    }

    createRecentActivity() {
        const section = document.createElement('section');
        section.className = 'recent-activity-section';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Recent Activity');
        section.appendChild(header);
        
        const activityList = document.createElement('div');
        activityList.className = 'activity-list';
        
        this.recentActivity.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const icon = this.getActivityIcon(activity.type);
            const time = this.formatTime(activity.timestamp);
            
            item.innerHTML = `
                <div class="activity-icon">${MathHelpAtoms.Icon.render(icon, { size: 'small' }).outerHTML}</div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${time}</div>
                </div>
            `;
            
            activityList.appendChild(item);
        });
        
        section.appendChild(activityList);
        
        // View all link
        const viewAll = document.createElement('a');
        viewAll.href = '/activity';
        viewAll.className = 'view-all-link';
        viewAll.textContent = 'View all activity →';
        section.appendChild(viewAll);
        
        return section;
    }

    createAchievements() {
        const section = document.createElement('section');
        section.className = 'achievements-section';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Recent Achievements');
        section.appendChild(header);
        
        const achievementsGrid = document.createElement('div');
        achievementsGrid.className = 'achievements-grid';
        
        this.achievements.slice(0, 4).forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievement.earned ? 'earned' : 'locked'}`;
            
            badge.innerHTML = `
                <div class="achievement-icon">
                    ${achievement.icon || '🏆'}
                </div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            if (!achievement.earned) {
                badge.innerHTML += `<div class="achievement-progress">${achievement.progress}% Complete</div>`;
            }
            
            achievementsGrid.appendChild(badge);
        });
        
        section.appendChild(achievementsGrid);
        
        // View all link
        const viewAll = document.createElement('a');
        viewAll.href = '/achievements';
        viewAll.className = 'view-all-link';
        viewAll.textContent = 'View all achievements →';
        section.appendChild(viewAll);
        
        return section;
    }

    createRecommendations() {
        const section = document.createElement('section');
        section.className = 'recommendations-section';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Recommended for You');
        section.appendChild(header);
        
        const recommendationsList = document.createElement('div');
        recommendationsList.className = 'recommendations-list';
        
        this.recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            
            card.innerHTML = `
                <div class="rec-header">
                    <span class="rec-type">${rec.type}</span>
                    <span class="rec-difficulty">${rec.difficulty}</span>
                </div>
                <h4 class="rec-title">${rec.title}</h4>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-footer">
                    <span class="rec-duration">${rec.duration}</span>
                    <button class="rec-action">Start →</button>
                </div>
            `;
            
            card.querySelector('.rec-action').onclick = () => {
                window.location.href = rec.href;
            };
            
            recommendationsList.appendChild(card);
        });
        
        section.appendChild(recommendationsList);
        
        return section;
    }

    getActivityIcon(type) {
        const icons = {
            'problem_solved': 'check',
            'lesson_completed': 'book',
            'achievement_earned': 'star',
            'streak_maintained': 'graph',
            'quiz_taken': 'help'
        };
        return icons[type] || 'info';
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000); // seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        
        return time.toLocaleDateString();
    }
}

// ============================================
// FOOTER ORGANISM
// ============================================

class Footer {
    constructor(options = {}) {
        this.sections = options.sections || this.getDefaultSections();
        this.showNewsletter = options.showNewsletter !== false;
        this.showSocial = options.showSocial !== false;
        this.copyright = options.copyright || '© 2024 Math Help. All rights reserved.';
    }

    getDefaultSections() {
        return [
            {
                title: 'Subjects',
                links: [
                    { label: 'Algebra', href: '/algebra' },
                    { label: 'Calculus', href: '/calculus' },
                    { label: 'Geometry', href: '/geometry' },
                    { label: 'Statistics', href: '/statistics' },
                    { label: 'Trigonometry', href: '/trigonometry' }
                ]
            },
            {
                title: 'Resources',
                links: [
                    { label: 'Practice Problems', href: '/practice' },
                    { label: 'Video Tutorials', href: '/tutorials' },
                    { label: 'Formula Sheet', href: '/formulas' },
                    { label: 'Study Guides', href: '/guides' },
                    { label: 'Calculator', href: '/calculator' }
                ]
            },
            {
                title: 'About',
                links: [
                    { label: 'About Us', href: '/about' },
                    { label: 'Contact', href: '/contact' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'Careers', href: '/careers' },
                    { label: 'Press', href: '/press' }
                ]
            },
            {
                title: 'Support',
                links: [
                    { label: 'Help Center', href: '/help' },
                    { label: 'Privacy Policy', href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                    { label: 'Cookie Policy', href: '/cookies' },
                    { label: 'Accessibility', href: '/accessibility' }
                ]
            }
        ];
    }

    render() {
        const footer = document.createElement('footer');
        footer.className = 'site-footer';
        
        // Main footer content
        const footerContent = document.createElement('div');
        footerContent.className = 'footer-content';
        
        // Newsletter section
        if (this.showNewsletter) {
            footerContent.appendChild(this.createNewsletterSection());
        }
        
        // Links sections
        const linksGrid = document.createElement('div');
        linksGrid.className = 'footer-links-grid';
        
        this.sections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'footer-section';
            
            const title = MathHelpAtoms.Typography.Heading(4, section.title);
            sectionEl.appendChild(title);
            
            const linksList = document.createElement('ul');
            linksList.className = 'footer-links';
            
            section.links.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.label;
                li.appendChild(a);
                linksList.appendChild(li);
            });
            
            sectionEl.appendChild(linksList);
            linksGrid.appendChild(sectionEl);
        });
        
        footerContent.appendChild(linksGrid);
        footer.appendChild(footerContent);
        
        // Bottom bar
        const bottomBar = document.createElement('div');
        bottomBar.className = 'footer-bottom';
        
        const bottomContent = document.createElement('div');
        bottomContent.className = 'footer-bottom-content';
        
        // Copyright
        const copyright = document.createElement('p');
        copyright.className = 'footer-copyright';
        copyright.textContent = this.copyright;
        bottomContent.appendChild(copyright);
        
        // Social links
        if (this.showSocial) {
            bottomContent.appendChild(this.createSocialLinks());
        }
        
        bottomBar.appendChild(bottomContent);
        footer.appendChild(bottomBar);
        
        return footer;
    }

    createNewsletterSection() {
        const section = document.createElement('div');
        section.className = 'footer-newsletter';
        
        const content = document.createElement('div');
        content.className = 'newsletter-content';
        
        const title = MathHelpAtoms.Typography.Heading(3, 'Stay Updated');
        content.appendChild(title);
        
        const description = MathHelpAtoms.Typography.Paragraph(
            'Get the latest math tips, practice problems, and study resources delivered to your inbox.'
        );
        content.appendChild(description);
        
        const form = document.createElement('form');
        form.className = 'newsletter-form';
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleNewsletterSubmit(form);
        };
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'newsletter-input-wrapper';
        
        const emailInput = new MathHelpAtoms.Input({
            type: 'email',
            placeholder: 'Enter your email',
            required: true
        });
        inputWrapper.appendChild(emailInput.render('newsletter-email'));
        
        const submitBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium'
        });
        inputWrapper.appendChild(submitBtn.render('Subscribe', null));
        
        form.appendChild(inputWrapper);
        
        const privacy = document.createElement('p');
        privacy.className = 'newsletter-privacy';
        privacy.innerHTML = 'By subscribing, you agree to our <a href="/privacy">Privacy Policy</a>.';
        form.appendChild(privacy);
        
        content.appendChild(form);
        section.appendChild(content);
        
        return section;
    }

    createSocialLinks() {
        const social = document.createElement('div');
        social.className = 'footer-social';
        
        const links = [
            { icon: 'facebook', href: 'https://facebook.com/mathhelp', label: 'Facebook' },
            { icon: 'twitter', href: 'https://twitter.com/mathhelp', label: 'Twitter' },
            { icon: 'youtube', href: 'https://youtube.com/mathhelp', label: 'YouTube' },
            { icon: 'instagram', href: 'https://instagram.com/mathhelp', label: 'Instagram' }
        ];
        
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'social-link';
            a.setAttribute('aria-label', link.label);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            
            // Using placeholder icons since we don't have social media icons in our Icon atom
            a.innerHTML = MathHelpAtoms.Icon.render('star_outline', { size: 'small' }).outerHTML;
            
            social.appendChild(a);
        });
        
        return social;
    }

    handleNewsletterSubmit(form) {
        const email = form.querySelector('input[type="email"]').value;
        console.log('Newsletter subscription:', email);
        
        // Show success message
        const successMessage = new MathHelpMolecules.Alert({
            type: 'success',
            message: 'Thank you for subscribing!',
            dismissible: true
        });
        
        form.appendChild(successMessage.render());
        
        // Reset form
        form.reset();
    }
}

// Export all organisms
const Organisms = {
    NavigationHeader,
    ProblemSet,
    Dashboard,
    Footer
};

window.MathHelpOrganisms = Organisms;