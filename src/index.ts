import { program } from 'commander';
import fs from 'fs';
import ignore from 'ignore';
import path from 'path';
import { loadConfig } from './config';
import { DokkitConfig } from './types';
import { version } from '../package.json';

function summarizeFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return `## File: ${path.basename(filePath)}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}

function processDirectory(dirPath: string, config: DokkitConfig, outputPath: string, isRoot: boolean = true): string[] {
  const files = fs.readdirSync(dirPath);
  const gitignorePath = path.join(dirPath, '.gitignore');

  const summaries: string[] = [];
  const ig = ignore();

  // Always ignore .git folder and common lock files
  ig.add([
    '.git',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '*.lock',
    '*.js.map',
    'dist',
    'node_modules',
    '.DS_Store'
  ]);

  // Read .gitignore if it exists
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const gitignoreLines = gitignoreContent.split('\n');
    gitignoreLines.forEach((line) => {
      ig.add(line);
    });
  }

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const relativePath = path.relative(dirPath, filePath);

    // Skip if the file is ignored by .gitignore or is .git folder
    if (ig.ignores(relativePath)) {
      return;
    }

    const stats = fs.statSync(filePath);

    if (stats.isFile() && !file.startsWith('.')) {
      const summary = summarizeFile(filePath);
      summaries.push(summary);
    } else if (stats.isDirectory() && file !== '.instructions') {
      // Recursively process subdirectories
      const subDirSummaries = processDirectory(filePath, config, outputPath, false) || [];
      summaries.push(...subDirSummaries);
    }
  });

  if (isRoot) {
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, summaries.join('---\n\n'));
    console.info(`Summaries written to ${outputPath}`);
  }

  return summaries;
}

program
  .version(version)
  .argument('<directory>', 'Directory to process')
  .option('-o, --output <path>', 'Output file path')
  .action((directory: string, options: { output?: string }) => {
    const config = loadConfig(directory);

    // Command-line option takes precedence over config file
    if (options.output) {
      config.output = options.output;
    }

    const outputPath = config.output
      ? path.resolve(directory, config.output)
      : path.join(directory, '.instructions', 'summary.md');

    processDirectory(directory, config, outputPath, true);
  });

program.parse(process.argv);
