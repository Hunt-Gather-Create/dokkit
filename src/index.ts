import { program } from 'commander';
import fs from 'fs';
import ignore from 'ignore';
import path from 'path';

function summarizeFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return `## File: ${path.basename(filePath)}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}

function processDirectory(dirPath: string, isRoot: boolean = true): string[] {
  const files = fs.readdirSync(dirPath);
  const instructionsDir = path.join(dirPath, '.instructions');
  const gitignorePath = path.join(dirPath, '.gitignore');

  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir);
  }

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
      const subDirSummaries = processDirectory(filePath, false) || [];
      summaries.push(...subDirSummaries);
    }
  });

  if (isRoot) {
    const summaryFilePath = path.join(dirPath, '.instructions', 'summary.md');
    fs.writeFileSync(summaryFilePath, summaries.join('---\n\n'));
    console.log(`Summaries written to ${summaryFilePath}`);
  }

  return summaries;
}

program
  .version('1.0.0')
  .argument('<directory>', 'Directory to process')
  .action((directory: string) => {
    processDirectory(directory);
  });

program.parse(process.argv);
