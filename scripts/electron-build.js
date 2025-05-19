
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}=== Building Desktop App ====${colors.reset}`);

// Step 1: Build React App for production
console.log(`${colors.cyan}Building React app...${colors.reset}`);
try {
  execSync('cross-env ELECTRON=true npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}React build complete${colors.reset}`);
} catch (error) {
  console.error('Failed to build React app', error);
  process.exit(1);
}

// Step 2: Build Electron main process typescript
console.log(`${colors.cyan}Building Electron main process...${colors.reset}`);
try {
  if (!fs.existsSync('dist-electron')) {
    fs.mkdirSync('dist-electron');
  }
  execSync('tsc -p electron/tsconfig.json', { stdio: 'inherit' });
  console.log(`${colors.green}Electron main process build complete${colors.reset}`);
} catch (error) {
  console.error('Failed to build Electron main process', error);
  process.exit(1);
}

// Step 3: Package the app with electron-builder
console.log(`${colors.cyan}Packaging desktop app with electron-builder...${colors.reset}`);
try {
  // Use --win for Windows specifically
  execSync('electron-builder build --config electron-builder.json --win', { stdio: 'inherit' });
  console.log(`${colors.green}${colors.bright}Desktop app packaging complete!${colors.reset}`);
} catch (error) {
  console.error('Failed to package desktop app', error);
  process.exit(1);
}

console.log(`${colors.yellow}${colors.bright}Desktop app installer available in the release/ directory${colors.reset}`);
console.log(`${colors.green}The installer will create desktop and start menu shortcuts automatically.${colors.reset}`);
