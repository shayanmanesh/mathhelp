// Atomic Design System - Templates
// Page layouts that combine organisms, molecules, and atoms

// ============================================
// LESSON TEMPLATE
// ============================================

class LessonTemplate {
    constructor(options = {}) {
        this.lesson = options.lesson || {};
        this.navigation = options.navigation || {};
        this.showSidebar = options.showSidebar !== false;
        this.showProgress = options.showProgress !== false;
        this.enableComments = options.enableComments || false;
        this.relatedContent = options.relatedContent || [];
    }

    render() {
        const template = document.createElement('div');
        template.className = 'template-lesson';
        
        // Header
        const header = new MathHelpOrganisms.NavigationHeader(this.navigation);
        template.appendChild(header.render());
        
        // Main content area
        const main = document.createElement('main');
        main.className = 'lesson-main';
        
        // Breadcrumb
        const breadcrumb = new MathHelpMolecules.Breadcrumb({
            items: [
                { label: 'Home', href: '/' },
                { label: this.lesson.subject || 'Math', href: `/${this.lesson.subject?.toLowerCase()}` },
                { label: this.lesson.topic || 'Topic', href: `/${this.lesson.subject?.toLowerCase()}/${this.lesson.topic?.toLowerCase()}` },
                { label: this.lesson.title || 'Lesson' }
            ]
        });
        main.appendChild(breadcrumb.render());
        
        // Content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'lesson-content-wrapper';
        
        // Sidebar
        if (this.showSidebar) {
            const sidebar = this.createSidebar();
            contentWrapper.appendChild(sidebar);
        }
        
        // Main content
        const content = document.createElement('article');
        content.className = 'lesson-content';
        
        // Lesson header
        const lessonHeader = this.createLessonHeader();
        content.appendChild(lessonHeader);
        
        // Progress indicator
        if (this.showProgress) {
            const progress = this.createProgressIndicator();
            content.appendChild(progress);
        }
        
        // Lesson sections
        const sections = this.createLessonSections();
        content.appendChild(sections);
        
        // Practice problems
        if (this.lesson.problems && this.lesson.problems.length > 0) {
            const practiceSection = this.createPracticeSection();
            content.appendChild(practiceSection);
        }
        
        // Navigation buttons
        const navButtons = this.createNavigationButtons();
        content.appendChild(navButtons);
        
        // Comments section
        if (this.enableComments) {
            const comments = this.createCommentsSection();
            content.appendChild(comments);
        }
        
        contentWrapper.appendChild(content);
        
        // Related content sidebar
        if (this.relatedContent.length > 0) {
            const relatedSidebar = this.createRelatedSidebar();
            contentWrapper.appendChild(relatedSidebar);
        }
        
        main.appendChild(contentWrapper);
        template.appendChild(main);
        
        // Footer
        const footer = new MathHelpOrganisms.Footer();
        template.appendChild(footer.render());
        
        return template;
    }

    createSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'lesson-sidebar';
        
        // Table of contents
        const toc = document.createElement('nav');
        toc.className = 'lesson-toc';
        
        const tocHeader = MathHelpAtoms.Typography.Heading(3, 'Table of Contents');
        toc.appendChild(tocHeader);
        
        const tocList = document.createElement('ol');
        tocList.className = 'toc-list';
        
        if (this.lesson.sections) {
            this.lesson.sections.forEach((section, index) => {
                const item = document.createElement('li');
                item.className = 'toc-item';
                
                const link = document.createElement('a');
                link.href = `#section-${index + 1}`;
                link.className = 'toc-link';
                link.textContent = section.title;
                
                // Add click handler for smooth scrolling
                link.onclick = (e) => {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
                
                item.appendChild(link);
                
                // Sub-sections
                if (section.subsections) {
                    const subList = document.createElement('ol');
                    subList.className = 'toc-sublist';
                    
                    section.subsections.forEach((sub, subIndex) => {
                        const subItem = document.createElement('li');
                        subItem.className = 'toc-subitem';
                        
                        const subLink = document.createElement('a');
                        subLink.href = `#section-${index + 1}-${subIndex + 1}`;
                        subLink.className = 'toc-sublink';
                        subLink.textContent = sub.title;
                        
                        subItem.appendChild(subLink);
                        subList.appendChild(subItem);
                    });
                    
                    item.appendChild(subList);
                }
                
                tocList.appendChild(item);
            });
        }
        
        toc.appendChild(tocList);
        sidebar.appendChild(toc);
        
        // Sticky positioning
        const stickyWrapper = document.createElement('div');
        stickyWrapper.className = 'sidebar-sticky';
        stickyWrapper.appendChild(toc);
        
        sidebar.appendChild(stickyWrapper);
        
        return sidebar;
    }

    createLessonHeader() {
        const header = document.createElement('header');
        header.className = 'lesson-header';
        
        // Title
        const title = MathHelpAtoms.Typography.Heading(1, this.lesson.title || 'Lesson Title');
        header.appendChild(title);
        
        // Meta information
        const meta = document.createElement('div');
        meta.className = 'lesson-meta';
        
        // Author
        if (this.lesson.author) {
            const author = document.createElement('span');
            author.className = 'lesson-author';
            author.innerHTML = `By <a href="/authors/${this.lesson.author.id}">${this.lesson.author.name}</a>`;
            meta.appendChild(author);
        }
        
        // Date
        if (this.lesson.date) {
            const date = document.createElement('span');
            date.className = 'lesson-date';
            date.textContent = new Date(this.lesson.date).toLocaleDateString();
            meta.appendChild(date);
        }
        
        // Reading time
        if (this.lesson.readingTime) {
            const time = document.createElement('span');
            time.className = 'lesson-time';
            time.innerHTML = `${MathHelpAtoms.Icon.render('book', { size: 'small' }).outerHTML} ${this.lesson.readingTime} min read`;
            meta.appendChild(time);
        }
        
        header.appendChild(meta);
        
        // Learning objectives
        if (this.lesson.objectives && this.lesson.objectives.length > 0) {
            const objectives = document.createElement('div');
            objectives.className = 'lesson-objectives';
            
            const objectivesHeader = MathHelpAtoms.Typography.Heading(3, 'Learning Objectives');
            objectives.appendChild(objectivesHeader);
            
            const objectivesList = document.createElement('ul');
            objectivesList.className = 'objectives-list';
            
            this.lesson.objectives.forEach(objective => {
                const li = document.createElement('li');
                li.innerHTML = `${MathHelpAtoms.Icon.render('check', { size: 'small' }).outerHTML} ${objective}`;
                objectivesList.appendChild(li);
            });
            
            objectives.appendChild(objectivesList);
            header.appendChild(objectives);
        }
        
        return header;
    }

    createProgressIndicator() {
        const progress = document.createElement('div');
        progress.className = 'lesson-progress-indicator';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'lesson-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'lesson-progress-fill';
        progressFill.style.width = '0%';
        
        progressBar.appendChild(progressFill);
        progress.appendChild(progressBar);
        
        // Update progress on scroll
        let ticking = false;
        const updateProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            progressFill.style.width = `${Math.min(progress, 100)}%`;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        });
        
        return progress;
    }

    createLessonSections() {
        const container = document.createElement('div');
        container.className = 'lesson-sections';
        
        if (this.lesson.sections) {
            this.lesson.sections.forEach((section, index) => {
                const sectionEl = document.createElement('section');
                sectionEl.className = 'lesson-section';
                sectionEl.id = `section-${index + 1}`;
                
                // Section header
                const sectionHeader = MathHelpAtoms.Typography.Heading(2, section.title);
                sectionEl.appendChild(sectionHeader);
                
                // Section content
                if (section.content) {
                    const content = document.createElement('div');
                    content.className = 'section-content';
                    content.innerHTML = section.content; // Assuming HTML content
                    sectionEl.appendChild(content);
                }
                
                // Math expressions
                if (section.mathExpressions) {
                    section.mathExpressions.forEach(expr => {
                        const mathExpr = new MathHelpMolecules.MathExpression({
                            latex: expr.latex,
                            size: 'large',
                            showSteps: expr.showSteps
                        });
                        sectionEl.appendChild(mathExpr.render());
                    });
                }
                
                // Examples
                if (section.examples) {
                    const examplesContainer = document.createElement('div');
                    examplesContainer.className = 'section-examples';
                    
                    const examplesHeader = MathHelpAtoms.Typography.Heading(3, 'Examples');
                    examplesContainer.appendChild(examplesHeader);
                    
                    section.examples.forEach((example, exIndex) => {
                        const exampleCard = document.createElement('div');
                        exampleCard.className = 'example-card';
                        
                        const exampleHeader = document.createElement('div');
                        exampleHeader.className = 'example-header';
                        exampleHeader.innerHTML = `<strong>Example ${exIndex + 1}:</strong> ${example.title}`;
                        exampleCard.appendChild(exampleHeader);
                        
                        const exampleContent = document.createElement('div');
                        exampleContent.className = 'example-content';
                        exampleContent.innerHTML = example.content;
                        exampleCard.appendChild(exampleContent);
                        
                        if (example.solution) {
                            const solutionToggle = new MathHelpAtoms.Button({
                                variant: 'secondary',
                                size: 'small'
                            });
                            
                            const solutionContent = document.createElement('div');
                            solutionContent.className = 'example-solution';
                            solutionContent.style.display = 'none';
                            solutionContent.innerHTML = example.solution;
                            
                            exampleCard.appendChild(solutionToggle.render('Show Solution', () => {
                                const isVisible = solutionContent.style.display !== 'none';
                                solutionContent.style.display = isVisible ? 'none' : 'block';
                                solutionToggle.querySelector('.button-text').textContent = isVisible ? 'Show Solution' : 'Hide Solution';
                            }));
                            
                            exampleCard.appendChild(solutionContent);
                        }
                        
                        examplesContainer.appendChild(exampleCard);
                    });
                    
                    sectionEl.appendChild(examplesContainer);
                }
                
                // Interactive elements
                if (section.interactive) {
                    const interactive = document.createElement('div');
                    interactive.className = 'section-interactive';
                    interactive.innerHTML = section.interactive;
                    sectionEl.appendChild(interactive);
                }
                
                container.appendChild(sectionEl);
            });
        }
        
        return container;
    }

    createPracticeSection() {
        const section = document.createElement('section');
        section.className = 'lesson-practice';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Practice Problems');
        section.appendChild(header);
        
        const problemSet = new MathHelpOrganisms.ProblemSet({
            problems: this.lesson.problems,
            showFilters: false,
            layout: 'list',
            onComplete: () => {
                this.markLessonComplete();
            }
        });
        
        section.appendChild(problemSet.render());
        
        return section;
    }

    createNavigationButtons() {
        const nav = document.createElement('nav');
        nav.className = 'lesson-navigation';
        
        const prevBtn = new MathHelpAtoms.Button({
            variant: 'secondary',
            size: 'medium',
            icon: MathHelpAtoms.Icon.render('arrow_left', { size: 'small' }).outerHTML
        });
        
        const nextBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium',
            icon: MathHelpAtoms.Icon.render('arrow_right', { size: 'small' }).outerHTML
        });
        
        if (this.lesson.previousLesson) {
            nav.appendChild(prevBtn.render('Previous Lesson', () => {
                window.location.href = this.lesson.previousLesson.href;
            }));
        }
        
        if (this.lesson.nextLesson) {
            nav.appendChild(nextBtn.render('Next Lesson', () => {
                window.location.href = this.lesson.nextLesson.href;
            }));
        }
        
        return nav;
    }

    createCommentsSection() {
        const section = document.createElement('section');
        section.className = 'lesson-comments';
        
        const header = MathHelpAtoms.Typography.Heading(2, 'Discussion');
        section.appendChild(header);
        
        // Comment form
        const form = document.createElement('form');
        form.className = 'comment-form';
        
        const textareaField = new MathHelpMolecules.FormField({
            type: 'textarea',
            name: 'comment',
            placeholder: 'Share your thoughts or ask a question...',
            required: true
        });
        form.appendChild(textareaField.render());
        
        const submitBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium'
        });
        form.appendChild(submitBtn.render('Post Comment', () => {
            console.log('Posting comment...');
        }));
        
        section.appendChild(form);
        
        // Existing comments
        const commentsList = document.createElement('div');
        commentsList.className = 'comments-list';
        
        // Placeholder for comments
        const noComments = document.createElement('p');
        noComments.className = 'no-comments';
        noComments.textContent = 'Be the first to comment!';
        commentsList.appendChild(noComments);
        
        section.appendChild(commentsList);
        
        return section;
    }

    createRelatedSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'related-sidebar';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Related Content');
        sidebar.appendChild(header);
        
        const relatedList = document.createElement('div');
        relatedList.className = 'related-list';
        
        this.relatedContent.forEach(item => {
            const card = document.createElement('a');
            card.href = item.href;
            card.className = 'related-card';
            
            card.innerHTML = `
                <div class="related-type">${item.type}</div>
                <h4 class="related-title">${item.title}</h4>
                <p class="related-description">${item.description}</p>
            `;
            
            relatedList.appendChild(card);
        });
        
        sidebar.appendChild(relatedList);
        
        return sidebar;
    }

    markLessonComplete() {
        console.log('Lesson completed!');
        // Track lesson completion
    }
}

// ============================================
// PRACTICE TEMPLATE
// ============================================

class PracticeTemplate {
    constructor(options = {}) {
        this.practice = options.practice || {};
        this.navigation = options.navigation || {};
        this.filters = options.filters || {};
        this.showTimer = options.showTimer || false;
        this.showHints = options.showHints !== false;
    }

    render() {
        const template = document.createElement('div');
        template.className = 'template-practice';
        
        // Header
        const header = new MathHelpOrganisms.NavigationHeader(this.navigation);
        template.appendChild(header.render());
        
        // Main content
        const main = document.createElement('main');
        main.className = 'practice-main';
        
        // Practice header
        const practiceHeader = this.createPracticeHeader();
        main.appendChild(practiceHeader);
        
        // Content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'practice-content-wrapper';
        
        // Filters sidebar
        const filtersSidebar = this.createFiltersSidebar();
        contentWrapper.appendChild(filtersSidebar);
        
        // Practice area
        const practiceArea = document.createElement('div');
        practiceArea.className = 'practice-area';
        
        // Problem display
        const problemDisplay = this.createProblemDisplay();
        practiceArea.appendChild(problemDisplay);
        
        // Answer input
        const answerSection = this.createAnswerSection();
        practiceArea.appendChild(answerSection);
        
        // Hints section
        if (this.showHints) {
            const hintsSection = this.createHintsSection();
            practiceArea.appendChild(hintsSection);
        }
        
        contentWrapper.appendChild(practiceArea);
        
        // Progress sidebar
        const progressSidebar = this.createProgressSidebar();
        contentWrapper.appendChild(progressSidebar);
        
        main.appendChild(contentWrapper);
        template.appendChild(main);
        
        // Footer
        const footer = new MathHelpOrganisms.Footer();
        template.appendChild(footer.render());
        
        return template;
    }

    createPracticeHeader() {
        const header = document.createElement('header');
        header.className = 'practice-header';
        
        const titleSection = document.createElement('div');
        titleSection.className = 'practice-title-section';
        
        const title = MathHelpAtoms.Typography.Heading(1, this.practice.title || 'Practice Mode');
        titleSection.appendChild(title);
        
        const subtitle = MathHelpAtoms.Typography.Paragraph(
            this.practice.description || 'Sharpen your skills with practice problems'
        );
        titleSection.appendChild(subtitle);
        
        header.appendChild(titleSection);
        
        // Timer
        if (this.showTimer) {
            const timer = this.createTimer();
            header.appendChild(timer);
        }
        
        return header;
    }

    createTimer() {
        const timer = document.createElement('div');
        timer.className = 'practice-timer';
        
        const icon = MathHelpAtoms.Icon.render('clock', { size: 'small' });
        timer.appendChild(icon);
        
        const display = document.createElement('span');
        display.className = 'timer-display';
        display.textContent = '00:00';
        timer.appendChild(display);
        
        let seconds = 0;
        setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
        
        return timer;
    }

    createFiltersSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'practice-filters';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Filter Problems');
        sidebar.appendChild(header);
        
        // Topic filter
        const topicField = new MathHelpMolecules.FormField({
            type: 'select',
            label: 'Topic',
            name: 'topic',
            options: [
                { value: 'all', label: 'All Topics' },
                { value: 'algebra', label: 'Algebra' },
                { value: 'calculus', label: 'Calculus' },
                { value: 'geometry', label: 'Geometry' },
                { value: 'statistics', label: 'Statistics' }
            ]
        });
        sidebar.appendChild(topicField.render());
        
        // Difficulty filter
        const difficultyField = new MathHelpMolecules.FormField({
            type: 'select',
            label: 'Difficulty',
            name: 'difficulty',
            options: [
                { value: 'all', label: 'All Levels' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
            ]
        });
        sidebar.appendChild(difficultyField.render());
        
        // Problem type filter
        const typeField = new MathHelpMolecules.FormField({
            type: 'select',
            label: 'Problem Type',
            name: 'type',
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'free-response', label: 'Free Response' },
                { value: 'proof', label: 'Proof' },
                { value: 'graphing', label: 'Graphing' }
            ]
        });
        sidebar.appendChild(typeField.render());
        
        // Apply filters button
        const applyBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium',
            fullWidth: true
        });
        sidebar.appendChild(applyBtn.render('Apply Filters', () => {
            this.applyFilters();
        }));
        
        return sidebar;
    }

    createProblemDisplay() {
        const display = document.createElement('div');
        display.className = 'problem-display';
        
        // Problem number and difficulty
        const problemHeader = document.createElement('div');
        problemHeader.className = 'problem-header';
        
        const problemNumber = document.createElement('span');
        problemNumber.className = 'problem-number';
        problemNumber.textContent = 'Problem 1 of 10';
        problemHeader.appendChild(problemNumber);
        
        const difficulty = new MathHelpAtoms.Badge({
            variant: 'warning',
            size: 'small'
        });
        problemHeader.appendChild(difficulty.render('Medium'));
        
        display.appendChild(problemHeader);
        
        // Problem statement
        const statement = document.createElement('div');
        statement.className = 'problem-statement';
        
        const problemText = MathHelpAtoms.Typography.Paragraph(
            'Solve the following equation for x:',
            { size: 'large' }
        );
        statement.appendChild(problemText);
        
        const mathExpression = new MathHelpMolecules.MathExpression({
            latex: '3x^2 + 5x - 2 = 0',
            size: 'large',
            showCopyButton: true
        });
        statement.appendChild(mathExpression.render());
        
        display.appendChild(statement);
        
        // Problem image (if any)
        if (this.practice.currentProblem?.image) {
            const image = document.createElement('img');
            image.className = 'problem-image';
            image.src = this.practice.currentProblem.image;
            image.alt = 'Problem diagram';
            display.appendChild(image);
        }
        
        return display;
    }

    createAnswerSection() {
        const section = document.createElement('div');
        section.className = 'answer-section';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Your Answer');
        section.appendChild(header);
        
        // Answer input options based on problem type
        const answerInput = this.createAnswerInput();
        section.appendChild(answerInput);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'answer-actions';
        
        const checkBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'large'
        });
        actions.appendChild(checkBtn.render('Check Answer', () => {
            this.checkAnswer();
        }));
        
        const skipBtn = new MathHelpAtoms.Button({
            variant: 'ghost',
            size: 'large'
        });
        actions.appendChild(skipBtn.render('Skip', () => {
            this.skipProblem();
        }));
        
        section.appendChild(actions);
        
        // Feedback area
        const feedback = document.createElement('div');
        feedback.className = 'answer-feedback';
        feedback.style.display = 'none';
        section.appendChild(feedback);
        
        return section;
    }

    createAnswerInput() {
        const container = document.createElement('div');
        container.className = 'answer-input-container';
        
        // For this example, using a math input
        const mathInput = new MathHelpMolecules.FormField({
            type: 'text',
            name: 'answer',
            placeholder: 'Enter your answer...',
            helper: 'Use LaTeX notation for mathematical expressions'
        });
        
        container.appendChild(mathInput.render());
        
        // Quick math symbols
        const symbols = document.createElement('div');
        symbols.className = 'math-symbols';
        
        const commonSymbols = ['√', 'π', '∞', '±', '≤', '≥', '≠', '∑', '∫'];
        commonSymbols.forEach(symbol => {
            const btn = document.createElement('button');
            btn.className = 'symbol-btn';
            btn.textContent = symbol;
            btn.onclick = () => {
                const input = container.querySelector('input');
                input.value += symbol;
                input.focus();
            };
            symbols.appendChild(btn);
        });
        
        container.appendChild(symbols);
        
        return container;
    }

    createHintsSection() {
        const section = document.createElement('div');
        section.className = 'hints-section';
        
        const header = document.createElement('div');
        header.className = 'hints-header';
        
        const title = MathHelpAtoms.Typography.Heading(3, 'Need Help?');
        header.appendChild(title);
        
        const hintCount = document.createElement('span');
        hintCount.className = 'hint-count';
        hintCount.textContent = '3 hints available';
        header.appendChild(hintCount);
        
        section.appendChild(header);
        
        // Hint buttons
        const hintButtons = document.createElement('div');
        hintButtons.className = 'hint-buttons';
        
        for (let i = 1; i <= 3; i++) {
            const hintBtn = new MathHelpAtoms.Button({
                variant: 'secondary',
                size: 'small'
            });
            hintButtons.appendChild(hintBtn.render(`Hint ${i}`, () => {
                this.showHint(i);
            }));
        }
        
        section.appendChild(hintButtons);
        
        // Hint display
        const hintDisplay = document.createElement('div');
        hintDisplay.className = 'hint-display';
        hintDisplay.style.display = 'none';
        section.appendChild(hintDisplay);
        
        return section;
    }

    createProgressSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'practice-progress';
        
        const header = MathHelpAtoms.Typography.Heading(3, 'Session Progress');
        sidebar.appendChild(header);
        
        // Stats
        const stats = document.createElement('div');
        stats.className = 'session-stats';
        
        const statItems = [
            { label: 'Completed', value: 0, color: 'success' },
            { label: 'Correct', value: 0, color: 'primary' },
            { label: 'Incorrect', value: 0, color: 'danger' },
            { label: 'Skipped', value: 0, color: 'warning' }
        ];
        
        statItems.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const label = document.createElement('span');
            label.className = 'stat-label';
            label.textContent = stat.label;
            statItem.appendChild(label);
            
            const value = document.createElement('span');
            value.className = `stat-value text-${stat.color}`;
            value.textContent = stat.value;
            statItem.appendChild(value);
            
            stats.appendChild(statItem);
        });
        
        sidebar.appendChild(stats);
        
        // Accuracy gauge
        const accuracySection = document.createElement('div');
        accuracySection.className = 'accuracy-section';
        
        const accuracyHeader = MathHelpAtoms.Typography.Heading(4, 'Accuracy');
        accuracySection.appendChild(accuracyHeader);
        
        const accuracyGauge = this.createAccuracyGauge();
        accuracySection.appendChild(accuracyGauge);
        
        sidebar.appendChild(accuracySection);
        
        // Recent problems
        const recentSection = document.createElement('div');
        recentSection.className = 'recent-problems';
        
        const recentHeader = MathHelpAtoms.Typography.Heading(4, 'Recent Problems');
        recentSection.appendChild(recentHeader);
        
        const recentList = document.createElement('div');
        recentList.className = 'recent-list';
        recentList.innerHTML = '<p class="empty-state">No problems attempted yet</p>';
        recentSection.appendChild(recentList);
        
        sidebar.appendChild(recentSection);
        
        return sidebar;
    }

    createAccuracyGauge() {
        const gauge = document.createElement('div');
        gauge.className = 'accuracy-gauge';
        
        // SVG gauge implementation would go here
        // For now, using a simple percentage display
        const percentage = document.createElement('div');
        percentage.className = 'accuracy-percentage';
        percentage.textContent = '0%';
        
        gauge.appendChild(percentage);
        
        return gauge;
    }

    applyFilters() {
        console.log('Applying filters...');
        // Filter logic
    }

    checkAnswer() {
        console.log('Checking answer...');
        // Answer validation logic
    }

    skipProblem() {
        console.log('Skipping problem...');
        // Skip logic
    }

    showHint(hintNumber) {
        console.log(`Showing hint ${hintNumber}`);
        // Hint display logic
    }
}

// ============================================
// ASSESSMENT TEMPLATE
// ============================================

class AssessmentTemplate {
    constructor(options = {}) {
        this.assessment = options.assessment || {};
        this.navigation = options.navigation || {};
        this.timeLimit = options.timeLimit || null;
        this.allowReview = options.allowReview !== false;
        this.showProgress = options.showProgress !== false;
    }

    render() {
        const template = document.createElement('div');
        template.className = 'template-assessment';
        
        // Header (minimal during assessment)
        const header = this.createAssessmentHeader();
        template.appendChild(header);
        
        // Main content
        const main = document.createElement('main');
        main.className = 'assessment-main';
        
        // Assessment info bar
        const infoBar = this.createInfoBar();
        main.appendChild(infoBar);
        
        // Content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'assessment-content-wrapper';
        
        // Question navigation
        if (this.showProgress) {
            const questionNav = this.createQuestionNavigation();
            contentWrapper.appendChild(questionNav);
        }
        
        // Question display
        const questionArea = this.createQuestionArea();
        contentWrapper.appendChild(questionArea);
        
        main.appendChild(contentWrapper);
        
        // Assessment controls
        const controls = this.createAssessmentControls();
        main.appendChild(controls);
        
        template.appendChild(main);
        
        return template;
    }

    createAssessmentHeader() {
        const header = document.createElement('header');
        header.className = 'assessment-header';
        
        const container = document.createElement('div');
        container.className = 'assessment-header-container';
        
        // Logo
        const logo = document.createElement('a');
        logo.href = '/';
        logo.className = 'assessment-logo';
        logo.innerHTML = `
            ${MathHelpAtoms.Icon.render('calculator', { size: 'medium' }).outerHTML}
            <span>Math Help</span>
        `;
        container.appendChild(logo);
        
        // Assessment title
        const title = document.createElement('h1');
        title.className = 'assessment-title';
        title.textContent = this.assessment.title || 'Assessment';
        container.appendChild(title);
        
        // Exit button
        const exitBtn = new MathHelpAtoms.Button({
            variant: 'ghost',
            size: 'small'
        });
        container.appendChild(exitBtn.render('Exit', () => {
            if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
                this.exitAssessment();
            }
        }));
        
        header.appendChild(container);
        
        return header;
    }

    createInfoBar() {
        const infoBar = document.createElement('div');
        infoBar.className = 'assessment-info-bar';
        
        // Timer
        if (this.timeLimit) {
            const timer = this.createCountdownTimer();
            infoBar.appendChild(timer);
        }
        
        // Question counter
        const counter = document.createElement('div');
        counter.className = 'question-counter';
        counter.innerHTML = `
            Question <span class="current-question">1</span> of <span class="total-questions">${this.assessment.totalQuestions || 10}</span>
        `;
        infoBar.appendChild(counter);
        
        // Progress bar
        const progressBar = MathHelpAtoms.Loading.ProgressBar(1, this.assessment.totalQuestions || 10, {
            variant: 'primary'
        });
        progressBar.className += ' assessment-progress';
        infoBar.appendChild(progressBar);
        
        return infoBar;
    }

    createCountdownTimer() {
        const timer = document.createElement('div');
        timer.className = 'countdown-timer';
        
        const icon = MathHelpAtoms.Icon.render('clock', { size: 'small' });
        timer.appendChild(icon);
        
        const display = document.createElement('span');
        display.className = 'timer-display';
        
        let remainingSeconds = this.timeLimit * 60;
        const updateTimer = () => {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (remainingSeconds <= 300) { // 5 minutes warning
                timer.classList.add('warning');
            }
            
            if (remainingSeconds <= 0) {
                this.submitAssessment();
            } else {
                remainingSeconds--;
                setTimeout(updateTimer, 1000);
            }
        };
        
        updateTimer();
        timer.appendChild(display);
        
        return timer;
    }

    createQuestionNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'question-navigation';
        
        const header = MathHelpAtoms.Typography.Heading(4, 'Questions');
        nav.appendChild(header);
        
        const grid = document.createElement('div');
        grid.className = 'question-grid';
        
        for (let i = 1; i <= (this.assessment.totalQuestions || 10); i++) {
            const btn = document.createElement('button');
            btn.className = 'question-nav-btn';
            btn.textContent = i;
            
            // Add status classes
            if (i === 1) btn.classList.add('current');
            
            btn.onclick = () => this.navigateToQuestion(i);
            
            grid.appendChild(btn);
        }
        
        nav.appendChild(grid);
        
        // Legend
        const legend = document.createElement('div');
        legend.className = 'nav-legend';
        legend.innerHTML = `
            <span class="legend-item"><span class="dot current"></span> Current</span>
            <span class="legend-item"><span class="dot answered"></span> Answered</span>
            <span class="legend-item"><span class="dot flagged"></span> Flagged</span>
        `;
        nav.appendChild(legend);
        
        return nav;
    }

    createQuestionArea() {
        const area = document.createElement('div');
        area.className = 'question-area';
        
        // Question content
        const questionContent = document.createElement('div');
        questionContent.className = 'question-content';
        
        // Question text
        const questionText = MathHelpAtoms.Typography.Paragraph(
            'What is the derivative of f(x) = 3x² + 5x - 2?',
            { size: 'large' }
        );
        questionContent.appendChild(questionText);
        
        // Math expression if needed
        const mathExpr = new MathHelpMolecules.MathExpression({
            latex: 'f(x) = 3x^2 + 5x - 2',
            size: 'large'
        });
        questionContent.appendChild(mathExpr.render());
        
        area.appendChild(questionContent);
        
        // Answer options (for multiple choice)
        const answerOptions = this.createAnswerOptions();
        area.appendChild(answerOptions);
        
        // Flag button
        const flagBtn = new MathHelpAtoms.Button({
            variant: 'ghost',
            size: 'small',
            icon: MathHelpAtoms.Icon.render('flag', { size: 'small' }).outerHTML
        });
        area.appendChild(flagBtn.render('Flag for Review', () => {
            this.flagQuestion();
        }));
        
        return area;
    }

    createAnswerOptions() {
        const options = document.createElement('div');
        options.className = 'answer-options';
        
        const answers = [
            { id: 'a', text: 'f\'(x) = 6x + 5' },
            { id: 'b', text: 'f\'(x) = 3x + 5' },
            { id: 'c', text: 'f\'(x) = 6x² + 5' },
            { id: 'd', text: 'f\'(x) = 6x + 5x - 2' }
        ];
        
        answers.forEach(answer => {
            const option = document.createElement('label');
            option.className = 'answer-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'question-1';
            input.value = answer.id;
            
            const label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = answer.id.toUpperCase();
            
            const text = document.createElement('span');
            text.className = 'option-text';
            text.textContent = answer.text;
            
            option.appendChild(input);
            option.appendChild(label);
            option.appendChild(text);
            
            options.appendChild(option);
        });
        
        return options;
    }

    createAssessmentControls() {
        const controls = document.createElement('div');
        controls.className = 'assessment-controls';
        
        const leftControls = document.createElement('div');
        leftControls.className = 'controls-left';
        
        const prevBtn = new MathHelpAtoms.Button({
            variant: 'secondary',
            size: 'medium',
            icon: MathHelpAtoms.Icon.render('arrow_left', { size: 'small' }).outerHTML
        });
        leftControls.appendChild(prevBtn.render('Previous', () => {
            this.previousQuestion();
        }));
        
        controls.appendChild(leftControls);
        
        const rightControls = document.createElement('div');
        rightControls.className = 'controls-right';
        
        const nextBtn = new MathHelpAtoms.Button({
            variant: 'primary',
            size: 'medium',
            icon: MathHelpAtoms.Icon.render('arrow_right', { size: 'small' }).outerHTML
        });
        rightControls.appendChild(nextBtn.render('Next', () => {
            this.nextQuestion();
        }));
        
        const submitBtn = new MathHelpAtoms.Button({
            variant: 'success',
            size: 'medium'
        });
        submitBtn.render('Submit Assessment', () => {
            if (confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
                this.submitAssessment();
            }
        });
        submitBtn.querySelector('button').style.display = 'none'; // Hidden until last question
        rightControls.appendChild(submitBtn.querySelector('button'));
        
        controls.appendChild(rightControls);
        
        return controls;
    }

    navigateToQuestion(questionNumber) {
        console.log(`Navigating to question ${questionNumber}`);
        // Navigation logic
    }

    previousQuestion() {
        console.log('Previous question');
        // Previous question logic
    }

    nextQuestion() {
        console.log('Next question');
        // Next question logic
    }

    flagQuestion() {
        console.log('Question flagged');
        // Flag logic
    }

    exitAssessment() {
        console.log('Exiting assessment');
        window.location.href = '/dashboard';
    }

    submitAssessment() {
        console.log('Submitting assessment');
        // Submit logic
    }
}

// Export all templates
const Templates = {
    LessonTemplate,
    PracticeTemplate,
    AssessmentTemplate
};

window.MathHelpTemplates = Templates;