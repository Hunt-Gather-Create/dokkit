import fs from 'fs';
import path from 'path';
import { program } from 'commander';

function summarizeFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const summary = lines.slice(0, 5).join('\n'); // First 5 lines as summary
  return `File: ${path.basename(filePath)}\n\nSummary:\n${summary}\n\n`;
}

function processDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath);
  const instructionsDir = path.join(dirPath, '.instructions');

  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir);
  }

  const summaries: string[] = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile() && !file.startsWith('.')) {
      const summary = summarizeFile(filePath);
      summaries.push(summary);
    }
  });

  const summaryFilePath = path.join(instructionsDir, 'summary.txt');
  fs.writeFileSync(summaryFilePath, summaries.join('---\n\n'));
  console.log(`Summaries written to ${summaryFilePath}`);
}

program
  .version('1.0.0')
  .argument('<directory>', 'Directory to process')
  .action((directory: string) => {
    processDirectory(directory);
  });

program.parse(process.argv);
