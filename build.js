#!/usr/bin/env node

/**
 * Build script for Math Help
 * Bundles and minifies JavaScript files for production
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Configuration
const config = {
  inputFiles: [
    'calculator.js',
    'ad-optimization.js',
    'katex-lazy.js'
  ],
  outputFile: 'scripts-bundle.min.js',
  terserOptions: {
    compress: {
      drop_console: false, // Keep console for debugging
      drop_debugger: true,
      passes: 2
    },
    mangle: {
      safari10: true
    },
    format: {
      comments: false,
      preamble: '/* Math Help Optimized Script Bundle - v1.0 */'
    }
  }
};

async function bundleAndMinify() {
  console.log('🚀 Building Math Help scripts...\n');
  
  try {
    // Read all input files
    let bundledCode = '';
    
    for (const file of config.inputFiles) {
      if (fs.existsSync(file)) {
        console.log(`📄 Reading ${file}...`);
        const code = fs.readFileSync(file, 'utf8');
        bundledCode += `\n// Source: ${file}\n${code}\n`;
      } else {
        console.warn(`⚠️  Warning: ${file} not found, skipping...`);
      }
    }
    
    // Wrap in IIFE to avoid global scope pollution
    bundledCode = `(function() {
      'use strict';
      ${bundledCode}
    })();`;
    
    // Minify the bundled code
    console.log('\n🔧 Minifying code...');
    const result = await minify(bundledCode, config.terserOptions);
    
    if (result.error) {
      throw result.error;
    }
    
    // Write the minified bundle
    fs.writeFileSync(config.outputFile, result.code);
    
    // Calculate size reduction
    const originalSize = Buffer.byteLength(bundledCode, 'utf8');
    const minifiedSize = Buffer.byteLength(result.code, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
    
    console.log('\n✅ Build complete!');
    console.log(`📊 Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Size reduction: ${reduction}%`);
    console.log(`\n📦 Output: ${config.outputFile}`);
    
    // Create a non-minified bundle for development
    const devBundle = `/* Math Help Script Bundle - Development Version */
${bundledCode}`;
    fs.writeFileSync('scripts-bundle.js', devBundle);
    console.log(`📦 Development bundle: scripts-bundle.js`);
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
bundleAndMinify();