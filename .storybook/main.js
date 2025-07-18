// Storybook configuration for Math Help components

module.exports = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../components/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    'storybook-addon-designs',
    'storybook-dark-mode'
  ],
  
  features: {
    buildStoriesJson: true,
    babelModeV7: true
  },
  
  framework: '@storybook/html',
  
  core: {
    builder: '@storybook/builder-webpack5'
  },
  
  staticDirs: ['../public', '../design-tokens', '../accessibility'],
  
  webpackFinal: async (config) => {
    // Add support for importing CSS
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    });
    
    // Add support for design tokens
    config.module.rules.push({
      test: /tokens\.(js|json)$/,
      type: 'javascript/auto',
      use: ['babel-loader']
    });
    
    // Resolve aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, '../components'),
      '@tokens': path.resolve(__dirname, '../design-tokens'),
      '@accessibility': path.resolve(__dirname, '../accessibility')
    };
    
    return config;
  }
};