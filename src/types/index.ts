export interface DokkitConfig {
  outputDir?: string;
}

export interface Prompt {
  name: string;
  description: string;
  content: string;
  output: string;
}

export interface ProcessOptions {
  outputDir?: string;
  task?: string;
}
