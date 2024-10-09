export interface DokkitConfig {
  outputDir?: string;
}

export interface Prompt {
  name: string;
  description: string;
  content: string;
}

export interface ProcessOptions {
  outputDir?: string;
  task?: string;
}
