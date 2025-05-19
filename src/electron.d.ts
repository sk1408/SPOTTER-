
// Type declarations for Electron-specific code
declare namespace NodeJS {
  interface ProcessEnv {
    ELECTRON?: string;
  }
}

// Type declarations for isElectron check
interface Window {
  process?: {
    type: string;
    platform: string;
  };
}
