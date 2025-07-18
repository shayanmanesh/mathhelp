# Changelog

All notable changes to the Math Help Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features
- Implemented comprehensive design tokens for mathematical content
- Created specialized color systems for math expressions with semantic meaning
- Added accessibility-first math expression components with MathML support
- Implemented keyboard navigation for complex mathematical expressions
- Added high contrast mode with automatic detection
- Created atomic design component system (atoms, molecules, organisms, templates, pages)
- Set up Storybook documentation with interactive component playground
- Added screen reader compatibility with customizable verbosity levels
- Implemented touch gesture support for math expression interaction

### 🎨 Design System
- Established design tokens for colors, typography, spacing, and animations
- Created math-specific spacing tokens for formulas and expressions
- Implemented responsive sizing system with touch target compliance
- Added comprehensive shadow and border radius tokens
- Created animation tokens with reduced motion support

### ♿ Accessibility
- Full MathML support for screen readers
- Keyboard navigation with customizable shortcuts
- High contrast mode with WCAG AAA compliance
- Speech synthesis for math expression reading
- Focus management with clear visual indicators
- ARIA live regions for dynamic content updates
- Math expression tooltips with keyboard support

### 📚 Documentation
- Set up Storybook with accessibility testing integration
- Created comprehensive component documentation
- Added interactive examples for all components
- Implemented automated changelog generation
- Created migration guide for version updates

### 📦 Build System
- Configured webpack for production builds
- Set up standard-version for semantic versioning
- Implemented auto-changelog for release notes
- Added npm scripts for development workflow

## [1.0.0] - 2024-01-18

### ✨ Features
- Initial release of Math Help platform
- Basic calculator functionality
- Algebra learning modules
- Schema markup implementation
- Ad optimization system

### 🎨 Design System
- Initial component library
- Basic styling system
- Responsive layouts

### ♿ Accessibility
- Basic keyboard navigation
- Screen reader support
- Focus indicators

---

## Version Guide

### Version Number Format: MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Revert a previous commit
- `a11y`: Accessibility improvements
- `math`: Mathematical feature additions
- `design`: Design system updates

### Migration Guide

When upgrading between major versions, please refer to our [Migration Guide](./MIGRATION.md) for detailed instructions on updating your implementation.

[Unreleased]: https://github.com/shayanmanesh/mathhelp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/shayanmanesh/mathhelp/releases/tag/v1.0.0