import fs from 'fs';
import ignore from 'ignore';
import path from 'path';

/**
 * Summarizes the content of a file.
 * @param {string} filePath - The path to the file.
 * @returns {string} A string containing the file name and its content.
 */
function summarizeFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return `## File: ${path.basename(filePath)}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}

/**
 * Processes a directory, generating summaries for its contents.
 * @param {string} dirPath - The path to the directory to process.
 * @param {string} outputDir - The directory where the summary will be saved.
 * @returns {string[]} An array of summaries for the processed files.
 */
export function processDirectory(dirPath: string, outputDir: string): string[] {
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
      const subDirSummaries = processDirectory(filePath, outputDir);
      summaries.push(...subDirSummaries);
    }
  });

  // Write summaries to the output file
  const outputPath = path.join(outputDir, 'summary.md');
  fs.writeFileSync(outputPath, summaries.join('---\n\n'));

  return summaries;
}
