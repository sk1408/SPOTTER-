
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.blue}=== Starting Desktop Development Mode ====${colors.reset}`);

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev:web'], { 
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
});

// When Vite server is ready, launch Electron
waitOn({
  resources: ['http://localhost:8080'],
  timeout: 30000,
}).then(() => {
  console.log(`${colors.cyan}Web server started at http://localhost:8080${colors.reset}`);
  console.log(`${colors.magenta}Starting Electron...${colors.reset}`);
  
  const electronProcess = spawn('npx', ['electron', '.'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_IS_DEV: 1 }
  });

  electronProcess.on('close', (code) => {
    console.log(`${colors.green}Electron process exited with code ${code}${colors.reset}`);
    viteProcess.kill();
    process.exit();
  });

}).catch((err) => {
  console.error('Error starting dev server:', err);
  viteProcess.kill();
  process.exit(1);
});

process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
});
