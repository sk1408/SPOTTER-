
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Monitor, Laptop } from "lucide-react";

// Detecting if running in Electron
const isElectron = () => {
  // @ts-ignore - Electron adds these properties to window
  return window && window.process && window.process.type;
};

export function PlatformInfo() {
  const [platform, setPlatform] = useState<string>('web');
  
  useEffect(() => {
    if (isElectron()) {
      // @ts-ignore - Electron adds these properties to process
      const platformName = window.process.platform;
      let platformDisplay = 'desktop';
      
      // Convert platform codes to readable names
      switch (platformName) {
        case 'darwin':
          platformDisplay = 'macOS';
          break;
        case 'win32':
          platformDisplay = 'Windows';
          break;
        case 'linux':
          platformDisplay = 'Linux';
          break;
        default:
          platformDisplay = 'desktop';
      }
      
      setPlatform(platformDisplay);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      {platform === 'web' ? (
        <Badge variant="outline" className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          <span>Web App</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
          <Laptop className="h-3 w-3" />
          <span>{platform} App</span>
        </Badge>
      )}
    </div>
  );
}
