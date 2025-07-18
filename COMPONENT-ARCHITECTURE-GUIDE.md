# Math Help Component Architecture Guide

## Overview

This guide documents the atomic design system implementation for Math Help, providing a scalable, maintainable component architecture for building educational interfaces.

## Architecture Structure

```
components/
├── atoms.js        # Basic building blocks
├── molecules.js    # Combinations of atoms
├── organisms.js    # Complex UI sections
├── templates.js    # Page layouts
└── pages.js        # Specific page instances
```

## Component Hierarchy

### 1. Atoms (atoms.js)
The smallest functional units of the design system.

#### Available Atoms:

**Button**
```javascript
const button = new MathHelpAtoms.Button({
    variant: 'primary', // primary, secondary, tertiary, ghost, danger
    size: 'medium',     // small, medium, large
    icon: iconHTML,     // optional icon
    loading: false,     // loading state
    disabled: false,    // disabled state
    fullWidth: false    // full width option
});
button.render('Click Me', onClick);
```

**Input**
```javascript
const input = new MathHelpAtoms.Input({
    type: 'text',       // text, number, email, password, search
    size: 'medium',     // small, medium, large
    variant: 'default', // default, math, error, success
    placeholder: '',
    mathMode: false     // LaTeX input with preview
});
input.render('field-name', 'initial-value');
```

**Typography**
```javascript
// Headings
MathHelpAtoms.Typography.Heading(1, 'Title', { subheading: 'Subtitle' });

// Paragraphs
MathHelpAtoms.Typography.Paragraph('Text content', { size: 'medium' });

// Labels
MathHelpAtoms.Typography.Label('Label', 'input-id', { required: true });

// Math Expressions
MathHelpAtoms.Typography.MathExpression('\\frac{1}{2}', { display: true });
```

**Icon**
```javascript
MathHelpAtoms.Icon.render('calculator', { 
    size: 'medium',  // small, medium, large
    color: '#3498db' 
});
```

**Badge**
```javascript
const badge = new MathHelpAtoms.Badge({
    variant: 'primary', // default, primary, success, warning, danger, info
    size: 'medium',     // small, medium, large
    rounded: false,
    icon: 'star'
});
badge.render('New');
```

**Loading**
```javascript
// Spinner
MathHelpAtoms.Loading.Spinner({ size: 'medium' });

// Skeleton
MathHelpAtoms.Loading.Skeleton({ 
    type: 'text',
    width: '200px',
    height: '20px'
});

// Progress Bar
MathHelpAtoms.Loading.ProgressBar(75, 100, {
    variant: 'primary',
    showValue: true
});
```

**Divider**
```javascript
// Horizontal
MathHelpAtoms.Divider.Horizontal({ margin: '20px 0' });

// Vertical
MathHelpAtoms.Divider.Vertical({ height: '100px' });

// With Text
MathHelpAtoms.Divider.WithText('OR');
```

**Tooltip**
```javascript
const tooltip = new MathHelpAtoms.Tooltip({
    position: 'top',    // top, right, bottom, left
    trigger: 'hover',   // hover, click
    delay: 200
});
tooltip.render('Tooltip content', targetElement);
```

### 2. Molecules (molecules.js)
Functional components built from atoms.

#### Available Molecules:

**SearchBar**
```javascript
const searchBar = new MathHelpMolecules.SearchBar({
    placeholder: 'Search...',
    onSearch: (query) => {},
    suggestions: [],
    mathMode: false,
    filters: [
        { label: 'All', onChange: (active) => {} }
    ]
});
```

**MathExpression**
```javascript
const mathExpr = new MathHelpMolecules.MathExpression({
    latex: '\\int_0^1 x^2 dx',
    editable: false,
    showSteps: true,
    showCopyButton: true,
    size: 'medium'
});
```

**ProblemCard**
```javascript
const problemCard = new MathHelpMolecules.ProblemCard({
    problem: {
        title: 'Solve for x',
        description: 'Find the value of x',
        difficulty: 'Medium',
        topic: 'Algebra',
        expression: '2x + 5 = 13'
    },
    showDifficulty: true,
    showTopic: true,
    interactive: true,
    onSolve: (problem) => {},
    onBookmark: (problem) => {}
});
```

**FormField**
```javascript
const formField = new MathHelpMolecules.FormField({
    label: 'Email',
    name: 'email',
    type: 'email',
    required: true,
    helper: 'We\'ll never share your email',
    error: 'Invalid email address',
    placeholder: 'Enter your email'
});
```

**StatCard**
```javascript
const statCard = new MathHelpMolecules.StatCard({
    label: 'Problems Solved',
    value: 150,
    unit: 'problems',
    trend: 'up',
    trendValue: '+12%',
    icon: 'check',
    color: 'success'
});
```

**NavigationItem**
```javascript
const navItem = new MathHelpMolecules.NavigationItem({
    label: 'Topics',
    href: '/topics',
    icon: 'book',
    badge: '3',
    active: false,
    children: [], // Sub-navigation items
    onClick: () => {}
});
```

**Alert**
```javascript
const alert = new MathHelpMolecules.Alert({
    type: 'success',    // info, success, warning, error
    title: 'Success!',
    message: 'Your answer is correct',
    dismissible: true,
    icon: 'check',
    actions: [
        { label: 'Next Problem', onClick: () => {} }
    ]
});
```

**Breadcrumb**
```javascript
const breadcrumb = new MathHelpMolecules.Breadcrumb({
    items: [
        { label: 'Home', href: '/' },
        { label: 'Algebra', href: '/algebra' },
        { label: 'Linear Equations' }
    ],
    separator: '/'
});
```

### 3. Organisms (organisms.js)
Complex components that form distinct UI sections.

#### Available Organisms:

**NavigationHeader**
```javascript
const nav = new MathHelpOrganisms.NavigationHeader({
    logo: { text: 'Math Help', href: '/', image: '/logo.png' },
    items: [...],           // Navigation items
    showSearch: true,
    showUserMenu: true,
    userInfo: { name: 'John', avatar: '/avatar.jpg' },
    sticky: true,
    transparent: false
});
```

**ProblemSet**
```javascript
const problemSet = new MathHelpOrganisms.ProblemSet({
    title: 'Practice Problems',
    problems: [...],
    showProgress: true,
    showFilters: true,
    onComplete: () => {},
    layout: 'grid'      // grid, list
});
```

**Dashboard**
```javascript
const dashboard = new MathHelpOrganisms.Dashboard({
    userStats: {
        name: 'John',
        problemsSolved: 150,
        studyStreak: 7,
        accuracy: 85,
        topicsMastered: 3
    },
    recentActivity: [...],
    recommendations: [...],
    achievements: [...],
    weeklyGoal: { current: 35, target: 50 }
});
```

**Footer**
```javascript
const footer = new MathHelpOrganisms.Footer({
    sections: [...],        // Link sections
    showNewsletter: true,
    showSocial: true,
    copyright: '© 2024 Math Help'
});
```

### 4. Templates (templates.js)
Page layouts that combine organisms.

#### Available Templates:

**LessonTemplate**
```javascript
const lessonTemplate = new MathHelpTemplates.LessonTemplate({
    lesson: {
        title: 'Introduction to Algebra',
        subject: 'Algebra',
        topic: 'Basics',
        sections: [...],
        objectives: [...],
        problems: [...]
    },
    navigation: {...},
    showSidebar: true,
    showProgress: true,
    enableComments: false,
    relatedContent: [...]
});
```

**PracticeTemplate**
```javascript
const practiceTemplate = new MathHelpTemplates.PracticeTemplate({
    practice: {
        title: 'Practice Mode',
        description: 'Sharpen your skills',
        currentProblem: {...}
    },
    navigation: {...},
    filters: {...},
    showTimer: true,
    showHints: true
});
```

**AssessmentTemplate**
```javascript
const assessmentTemplate = new MathHelpTemplates.AssessmentTemplate({
    assessment: {
        title: 'Algebra Test',
        totalQuestions: 20,
        questions: [...]
    },
    navigation: {...},
    timeLimit: 60,      // minutes
    allowReview: true,
    showProgress: true
});
```

### 5. Pages (pages.js)
Complete page implementations with content.

#### Available Pages:

**AlgebraTopicPage**
- Complete topic overview with hero section
- Progress tracking and statistics
- Course sections with lessons
- Additional resources

**PracticeProblemsPage**
- Practice hub with category selection
- Performance statistics
- Recent activity tracking
- Integration with practice template

**UserProgressPage**
- Comprehensive progress tracking
- Level and XP system
- Activity charts and analytics
- Achievement system

## Usage Examples

### Creating a Simple Button
```javascript
const btn = new MathHelpAtoms.Button({
    variant: 'primary',
    size: 'medium'
});
document.body.appendChild(btn.render('Click Me', () => {
    console.log('Button clicked!');
}));
```

### Building a Problem Card
```javascript
const problem = {
    title: 'Quadratic Equation',
    description: 'Solve for x',
    expression: 'x^2 + 5x + 6 = 0',
    difficulty: 'Medium',
    topic: 'Algebra'
};

const card = new MathHelpMolecules.ProblemCard({
    problem: problem,
    interactive: true,
    onSolve: (p) => console.log('Solving:', p)
});

document.body.appendChild(card.render());
```

### Creating a Complete Page
```javascript
const algebraPage = new MathHelpPages.AlgebraTopicPage();
document.body.appendChild(algebraPage.render());
```

## Styling Integration

All components are designed to work with the existing Math Help styles:
- `ad-optimization-styles.css` - Ad layouts and native styles
- Component-specific styles should be added to a dedicated CSS file

## Best Practices

1. **Component Reusability**
   - Keep atoms simple and focused
   - Build molecules for specific use cases
   - Organisms should be self-contained sections

2. **State Management**
   - Components manage their own internal state
   - Use callbacks for parent-child communication
   - Avoid global state dependencies

3. **Accessibility**
   - All interactive elements have proper ARIA labels
   - Keyboard navigation is supported
   - Color contrast meets WCAG standards

4. **Performance**
   - Components use efficient DOM manipulation
   - Event delegation where appropriate
   - Lazy loading for heavy components

5. **Extensibility**
   - Use configuration objects for customization
   - Provide sensible defaults
   - Allow style overrides through classes

## Component Lifecycle

1. **Initialization**: Create component instance with options
2. **Rendering**: Call render() to get DOM element
3. **Interaction**: Handle user events through callbacks
4. **Updates**: Re-render or update specific parts
5. **Cleanup**: Remove event listeners when needed

## Testing Components

```javascript
// Test a component in isolation
const testButton = new MathHelpAtoms.Button({
    variant: 'primary',
    size: 'large'
});

const element = testButton.render('Test Button', () => {
    console.log('Test passed!');
});

// Add to test container
document.getElementById('test-container').appendChild(element);
```

## Future Enhancements

1. **Additional Components**
   - Video player molecule
   - Code editor organism
   - Forum template
   - Course catalog page

2. **Features**
   - Component theming system
   - Animation presets
   - Responsive breakpoints
   - A11y improvements

3. **Tools**
   - Component playground
   - Visual regression testing
   - Documentation generator
   - Design tokens

## Conclusion

This atomic design system provides a solid foundation for building scalable, maintainable educational interfaces. By following the hierarchy from atoms to pages, developers can create consistent, reusable components that enhance the Math Help learning experience.