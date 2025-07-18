// Storybook stories for Atomic components

export default {
  title: 'Components/Atoms',
  parameters: {
    docs: {
      description: {
        component: 'Basic building blocks of the Math Help design system.'
      }
    }
  }
};

// ============================================
// BUTTON STORIES
// ============================================

export const Buttons = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'component-preview-grid';
    
    const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'danger'];
    const sizes = ['small', 'medium', 'large'];
    
    variants.forEach(variant => {
      const variantSection = document.createElement('div');
      variantSection.innerHTML = `<h3>${variant.charAt(0).toUpperCase() + variant.slice(1)} Buttons</h3>`;
      
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '1rem';
      buttonGroup.style.marginBottom = '2rem';
      
      sizes.forEach(size => {
        const btn = new MathHelpAtoms.Button({ variant, size });
        buttonGroup.appendChild(btn.render(`${size}`, () => {
          console.log(`${variant} ${size} button clicked`);
        }));
      });
      
      variantSection.appendChild(buttonGroup);
      container.appendChild(variantSection);
    });
    
    // Loading state
    const loadingSection = document.createElement('div');
    loadingSection.innerHTML = '<h3>Loading State</h3>';
    const loadingBtn = new MathHelpAtoms.Button({ 
      variant: 'primary', 
      loading: true 
    });
    loadingSection.appendChild(loadingBtn.render('Loading', () => {}));
    container.appendChild(loadingSection);
    
    // With icons
    const iconSection = document.createElement('div');
    iconSection.innerHTML = '<h3>With Icons</h3>';
    const iconBtn = new MathHelpAtoms.Button({ 
      variant: 'primary',
      icon: MathHelpAtoms.Icon.render('calculator', { size: 'small' }).outerHTML
    });
    iconSection.appendChild(iconBtn.render('Calculate', () => {}));
    container.appendChild(iconSection);
    
    return container;
  },
  parameters: {
    docs: {
      description: {
        story: 'Button components in various variants, sizes, and states.'
      }
    }
  }
};

// ============================================
// INPUT STORIES
// ============================================

export const Inputs = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '2rem';
    
    // Basic inputs
    const basicSection = document.createElement('div');
    basicSection.innerHTML = '<h3>Basic Inputs</h3>';
    
    const types = ['text', 'email', 'number', 'password', 'search'];
    types.forEach(type => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '1rem';
      
      const label = document.createElement('label');
      label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Input`;
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      wrapper.appendChild(label);
      
      const input = new MathHelpAtoms.Input({ 
        type, 
        placeholder: `Enter ${type}...` 
      });
      wrapper.appendChild(input.render(`${type}-input`));
      
      basicSection.appendChild(wrapper);
    });
    
    container.appendChild(basicSection);
    
    // Math input
    const mathSection = document.createElement('div');
    mathSection.innerHTML = '<h3>Math Input with LaTeX Preview</h3>';
    
    const mathInput = new MathHelpAtoms.Input({ 
      type: 'text',
      mathMode: true,
      placeholder: 'Enter LaTeX expression (e.g., x^2 + y^2 = r^2)'
    });
    mathSection.appendChild(mathInput.render('math-input', 'x^2 + y^2 = r^2'));
    
    container.appendChild(mathSection);
    
    // Input states
    const statesSection = document.createElement('div');
    statesSection.innerHTML = '<h3>Input States</h3>';
    
    const states = [
      { variant: 'default', label: 'Default' },
      { variant: 'error', label: 'Error State' },
      { variant: 'success', label: 'Success State' }
    ];
    
    states.forEach(state => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '1rem';
      
      const label = document.createElement('label');
      label.textContent = state.label;
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      wrapper.appendChild(label);
      
      const input = new MathHelpAtoms.Input({ 
        variant: state.variant,
        placeholder: `${state.label} input`
      });
      wrapper.appendChild(input.render(`${state.variant}-input`));
      
      statesSection.appendChild(wrapper);
    });
    
    container.appendChild(statesSection);
    
    return container;
  }
};

// ============================================
// TYPOGRAPHY STORIES
// ============================================

export const Typography = {
  render: () => {
    const container = document.createElement('div');
    
    // Headings
    const headingsSection = document.createElement('div');
    headingsSection.innerHTML = '<h2>Headings</h2>';
    
    for (let i = 1; i <= 6; i++) {
      const heading = MathHelpAtoms.Typography.Heading(i, `Heading Level ${i}`, {
        subheading: i <= 3 ? 'With subheading' : null
      });
      headingsSection.appendChild(heading);
    }
    
    container.appendChild(headingsSection);
    
    // Paragraphs
    const paragraphSection = document.createElement('div');
    paragraphSection.innerHTML = '<h2>Paragraphs</h2>';
    
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach(size => {
      const p = MathHelpAtoms.Typography.Paragraph(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.',
        { size }
      );
      const label = document.createElement('strong');
      label.textContent = `${size}: `;
      paragraphSection.appendChild(label);
      paragraphSection.appendChild(p);
    });
    
    container.appendChild(paragraphSection);
    
    // Math expressions
    const mathSection = document.createElement('div');
    mathSection.innerHTML = '<h2>Math Expressions</h2>';
    
    const expressions = [
      { latex: 'x^2 + y^2 = r^2', label: 'Circle equation' },
      { latex: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', label: 'Quadratic formula' },
      { latex: '\\int_{a}^{b} f(x) dx', label: 'Definite integral' },
      { latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}', label: 'Basel problem' }
    ];
    
    expressions.forEach(expr => {
      const wrapper = document.createElement('div');
      wrapper.style.margin = '1rem 0';
      
      const label = document.createElement('p');
      label.textContent = `${expr.label}:`;
      wrapper.appendChild(label);
      
      const mathExpr = MathHelpAtoms.Typography.MathExpression(expr.latex, { display: true });
      wrapper.appendChild(mathExpr);
      
      mathSection.appendChild(wrapper);
    });
    
    container.appendChild(mathSection);
    
    return container;
  }
};

// ============================================
// ICON STORIES
// ============================================

export const Icons = {
  render: () => {
    const container = document.createElement('div');
    
    const iconGroups = {
      'Math Operations': ['plus', 'minus', 'multiply', 'divide', 'equals'],
      'Navigation': ['arrow_right', 'arrow_left', 'arrow_down', 'arrow_up'],
      'Actions': ['check', 'close', 'search', 'help'],
      'Educational': ['book', 'calculator', 'graph'],
      'Feedback': ['star', 'star_outline', 'error', 'success', 'warning']
    };
    
    Object.entries(iconGroups).forEach(([groupName, icons]) => {
      const section = document.createElement('div');
      section.innerHTML = `<h3>${groupName}</h3>`;
      
      const iconGrid = document.createElement('div');
      iconGrid.style.display = 'grid';
      iconGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
      iconGrid.style.gap = '1rem';
      
      icons.forEach(iconName => {
        const iconWrapper = document.createElement('div');
        iconWrapper.style.textAlign = 'center';
        iconWrapper.style.padding = '1rem';
        iconWrapper.style.border = '1px solid #e0e0e0';
        iconWrapper.style.borderRadius = '8px';
        
        const icon = MathHelpAtoms.Icon.render(iconName, { size: 'medium' });
        iconWrapper.appendChild(icon);
        
        const label = document.createElement('p');
        label.style.marginTop = '0.5rem';
        label.style.fontSize = '0.75rem';
        label.textContent = iconName;
        iconWrapper.appendChild(label);
        
        iconGrid.appendChild(iconWrapper);
      });
      
      section.appendChild(iconGrid);
      container.appendChild(section);
    });
    
    return container;
  }
};

// ============================================
// BADGE STORIES
// ============================================

export const Badges = {
  render: () => {
    const container = document.createElement('div');
    
    const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'];
    
    // Basic badges
    const basicSection = document.createElement('div');
    basicSection.innerHTML = '<h3>Badge Variants</h3>';
    
    const badgeGroup = document.createElement('div');
    badgeGroup.style.display = 'flex';
    badgeGroup.style.gap = '1rem';
    badgeGroup.style.flexWrap = 'wrap';
    
    variants.forEach(variant => {
      const badge = new MathHelpAtoms.Badge({ variant });
      badgeGroup.appendChild(badge.render(variant));
    });
    
    basicSection.appendChild(badgeGroup);
    container.appendChild(basicSection);
    
    // Sizes
    const sizesSection = document.createElement('div');
    sizesSection.innerHTML = '<h3>Badge Sizes</h3>';
    
    const sizeGroup = document.createElement('div');
    sizeGroup.style.display = 'flex';
    sizeGroup.style.gap = '1rem';
    sizeGroup.style.alignItems = 'center';
    
    ['small', 'medium', 'large'].forEach(size => {
      const badge = new MathHelpAtoms.Badge({ 
        variant: 'primary', 
        size 
      });
      sizeGroup.appendChild(badge.render(size));
    });
    
    sizesSection.appendChild(sizeGroup);
    container.appendChild(sizesSection);
    
    // With icons
    const iconSection = document.createElement('div');
    iconSection.innerHTML = '<h3>Badges with Icons</h3>';
    
    const iconGroup = document.createElement('div');
    iconGroup.style.display = 'flex';
    iconGroup.style.gap = '1rem';
    
    const iconBadge = new MathHelpAtoms.Badge({ 
      variant: 'success',
      icon: 'check'
    });
    iconGroup.appendChild(iconBadge.render('Completed'));
    
    const roundedBadge = new MathHelpAtoms.Badge({ 
      variant: 'primary',
      rounded: true
    });
    iconGroup.appendChild(roundedBadge.render('99+'));
    
    iconSection.appendChild(iconGroup);
    container.appendChild(iconSection);
    
    return container;
  }
};

// ============================================
// LOADING STORIES
// ============================================

export const Loading = {
  render: () => {
    const container = document.createElement('div');
    
    // Spinners
    const spinnerSection = document.createElement('div');
    spinnerSection.innerHTML = '<h3>Spinners</h3>';
    
    const spinnerGroup = document.createElement('div');
    spinnerGroup.style.display = 'flex';
    spinnerGroup.style.gap = '2rem';
    spinnerGroup.style.alignItems = 'center';
    
    ['small', 'medium', 'large'].forEach(size => {
      const wrapper = document.createElement('div');
      wrapper.style.textAlign = 'center';
      
      const spinner = MathHelpAtoms.Loading.Spinner({ size });
      wrapper.appendChild(spinner);
      
      const label = document.createElement('p');
      label.style.marginTop = '0.5rem';
      label.textContent = size;
      wrapper.appendChild(label);
      
      spinnerGroup.appendChild(wrapper);
    });
    
    spinnerSection.appendChild(spinnerGroup);
    container.appendChild(spinnerSection);
    
    // Progress bars
    const progressSection = document.createElement('div');
    progressSection.innerHTML = '<h3>Progress Bars</h3>';
    
    const progressValues = [
      { value: 25, variant: 'primary', label: '25% Complete' },
      { value: 50, variant: 'warning', label: '50% Complete' },
      { value: 75, variant: 'info', label: '75% Complete' },
      { value: 100, variant: 'success', label: '100% Complete' }
    ];
    
    progressValues.forEach(({ value, variant, label }) => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '1rem';
      
      const text = document.createElement('p');
      text.textContent = label;
      wrapper.appendChild(text);
      
      const progress = MathHelpAtoms.Loading.ProgressBar(value, 100, {
        variant,
        showValue: true
      });
      wrapper.appendChild(progress);
      
      progressSection.appendChild(wrapper);
    });
    
    container.appendChild(progressSection);
    
    // Skeletons
    const skeletonSection = document.createElement('div');
    skeletonSection.innerHTML = '<h3>Skeleton Loading</h3>';
    
    const skeletonTypes = [
      { type: 'text', width: '200px', height: '20px' },
      { type: 'text', width: '150px', height: '20px' },
      { type: 'text', width: '250px', height: '20px' },
      { type: 'box', width: '100px', height: '100px' }
    ];
    
    skeletonTypes.forEach(config => {
      const skeleton = MathHelpAtoms.Loading.Skeleton(config);
      skeleton.style.marginBottom = '0.5rem';
      skeletonSection.appendChild(skeleton);
    });
    
    container.appendChild(skeletonSection);
    
    return container;
  }
};

// ============================================
// DIVIDER STORIES
// ============================================

export const Dividers = {
  render: () => {
    const container = document.createElement('div');
    
    // Horizontal dividers
    const horizontalSection = document.createElement('div');
    horizontalSection.innerHTML = '<h3>Horizontal Dividers</h3>';
    
    const content1 = document.createElement('p');
    content1.textContent = 'Content above divider';
    horizontalSection.appendChild(content1);
    
    horizontalSection.appendChild(MathHelpAtoms.Divider.Horizontal());
    
    const content2 = document.createElement('p');
    content2.textContent = 'Content below divider';
    horizontalSection.appendChild(content2);
    
    horizontalSection.appendChild(MathHelpAtoms.Divider.Horizontal({ margin: '2rem 0' }));
    
    const content3 = document.createElement('p');
    content3.textContent = 'Content with custom margin';
    horizontalSection.appendChild(content3);
    
    container.appendChild(horizontalSection);
    
    // Divider with text
    const textSection = document.createElement('div');
    textSection.innerHTML = '<h3>Dividers with Text</h3>';
    
    textSection.appendChild(MathHelpAtoms.Divider.WithText('OR'));
    textSection.appendChild(MathHelpAtoms.Divider.WithText('Section Break'));
    textSection.appendChild(MathHelpAtoms.Divider.WithText('Continue Below'));
    
    container.appendChild(textSection);
    
    // Vertical divider
    const verticalSection = document.createElement('div');
    verticalSection.innerHTML = '<h3>Vertical Divider</h3>';
    
    const verticalContainer = document.createElement('div');
    verticalContainer.style.display = 'flex';
    verticalContainer.style.alignItems = 'center';
    verticalContainer.style.gap = '1rem';
    
    const leftContent = document.createElement('span');
    leftContent.textContent = 'Left content';
    verticalContainer.appendChild(leftContent);
    
    verticalContainer.appendChild(MathHelpAtoms.Divider.Vertical({ height: '50px' }));
    
    const rightContent = document.createElement('span');
    rightContent.textContent = 'Right content';
    verticalContainer.appendChild(rightContent);
    
    verticalSection.appendChild(verticalContainer);
    container.appendChild(verticalSection);
    
    return container;
  }
};

// ============================================
// TOOLTIP STORIES
// ============================================

export const Tooltips = {
  render: () => {
    const container = document.createElement('div');
    container.style.padding = '4rem';
    
    const positions = ['top', 'right', 'bottom', 'left'];
    
    // Position examples
    const positionSection = document.createElement('div');
    positionSection.innerHTML = '<h3>Tooltip Positions</h3>';
    
    const positionGrid = document.createElement('div');
    positionGrid.style.display = 'grid';
    positionGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    positionGrid.style.gap = '4rem';
    positionGrid.style.marginTop = '2rem';
    
    positions.forEach(position => {
      const wrapper = document.createElement('div');
      wrapper.style.textAlign = 'center';
      
      const button = document.createElement('button');
      button.className = 'btn btn-primary btn-medium';
      button.textContent = `Hover for ${position} tooltip`;
      
      const tooltip = new MathHelpAtoms.Tooltip({ position });
      const tooltipElement = tooltip.render(`This is a ${position} tooltip`, button);
      
      wrapper.appendChild(button);
      positionGrid.appendChild(wrapper);
    });
    
    positionSection.appendChild(positionGrid);
    container.appendChild(positionSection);
    
    // Click trigger
    const clickSection = document.createElement('div');
    clickSection.innerHTML = '<h3>Click Trigger</h3>';
    clickSection.style.marginTop = '4rem';
    
    const clickButton = document.createElement('button');
    clickButton.className = 'btn btn-secondary btn-medium';
    clickButton.textContent = 'Click for tooltip';
    
    const clickTooltip = new MathHelpAtoms.Tooltip({ 
      position: 'top',
      trigger: 'click'
    });
    clickTooltip.render('Click triggered tooltip', clickButton);
    
    clickSection.appendChild(clickButton);
    container.appendChild(clickSection);
    
    return container;
  }
};