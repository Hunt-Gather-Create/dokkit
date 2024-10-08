import fs from 'fs';
import path from 'path';
import { DokkitConfig } from './types';

export function loadConfig(directory: string): DokkitConfig {
  const configPath = path.join(directory, '.dokkit.config.json');
  let config: DokkitConfig = {};

  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`Error loading config file: ${error.message}`);
      } else {
        console.warn('An unknown error occurred while loading the config file');
      }
    }
  }

  return config;
}
