# Migration Guide

This guide helps you migrate between major versions of the Math Help Design System.

## Migrating from v0.x to v1.0

### Breaking Changes

#### Component API Changes

##### Atoms
- **Button**: The `type` prop has been renamed to `variant`
  ```javascript
  // Before
  new Button({ type: 'primary' })
  
  // After
  new MathHelpAtoms.Button({ variant: 'primary' })
  ```

- **Input**: Math mode now requires explicit `mathMode` flag
  ```javascript
  // Before
  new Input({ type: 'math' })
  
  // After
  new MathHelpAtoms.Input({ mathMode: true })
  ```

##### Design Tokens
- All color tokens now use CSS custom properties
  ```css
  /* Before */
  color: #3498db;
  
  /* After */
  color: var(--color-brand-primary);
  ```

#### Accessibility Changes

- All math expressions now require `role="math"` attribute
- MathML alternatives must be provided for screen readers
- Keyboard navigation is enabled by default

### New Features

#### Design Tokens
- Comprehensive token system for colors, typography, spacing
- Math-specific tokens for expressions and formulas
- High contrast mode tokens

#### Components
- Full atomic design system implementation
- New molecules: SearchBar, MathExpression, ProblemCard
- New organisms: NavigationHeader, Dashboard, ProblemSet

#### Accessibility
- MathML support with automatic generation
- Keyboard navigation for math expressions
- Speech synthesis for math reading
- Customizable screen reader verbosity

### Migration Steps

1. **Update imports**
   ```javascript
   // Before
   import { Button } from './components/button';
   
   // After
   import { MathHelpAtoms } from './components/atoms';
   ```

2. **Update color usage**
   ```css
   /* Before */
   .math-var { color: #3498db; }
   
   /* After */
   .math-var { color: var(--color-expression-variable); }
   ```

3. **Add accessibility attributes**
   ```html
   <!-- Before -->
   <div class="math-expression">x^2 + y^2 = r^2</div>
   
   <!-- After -->
   <div class="math-expression" role="math" tabindex="0" 
        aria-label="x squared plus y squared equals r squared">
     x^2 + y^2 = r^2
   </div>
   ```

4. **Initialize accessibility features**
   ```javascript
   // Add to your app initialization
   import { MathAccessibility } from './accessibility/math-a11y';
   window.mathAccessibility = new MathAccessibility();
   ```

### Deprecated Features

The following features are deprecated and will be removed in v2.0:

- Direct color values in components (use design tokens instead)
- Inline styles for math expressions (use CSS classes)
- Manual ARIA label generation (use automatic generation)

### Tools and Scripts

We provide migration scripts to help automate the update process:

```bash
# Run migration script
npm run migrate:v1

# Check for migration issues
npm run migrate:check
```

## Future Versions

### v1.x Roadmap
- Enhanced math expression editor
- Advanced graphing components
- Real-time collaboration features
- Extended language support

### v2.0 Plans
- TypeScript migration
- React/Vue/Angular wrappers
- Advanced animation system
- AI-powered accessibility features

## Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG](./CHANGELOG.md) for detailed changes
2. Review [Storybook examples](http://localhost:6006) for implementation patterns
3. Open an [issue](https://github.com/shayanmanesh/mathhelp/issues) on GitHub
4. Join our [Discord community](https://discord.gg/mathhelp) for support

## Rollback Instructions

If you need to rollback to a previous version:

```bash
# Rollback to specific version
npm install mathhelp@0.9.0

# Clear cache
npm cache clean --force

# Reinstall dependencies
npm install
```

Remember to also rollback any code changes made for the new version.