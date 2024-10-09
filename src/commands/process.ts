import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config';
import { ProcessOptions } from '../types';
import { loadPrompts, findPrompt, executePrompt } from '../services/ai';
import { processDirectory } from '../services/directory';

/**
 * Processes the command based on the given directory and options.
 * @param {string} directory - The directory to process.
 * @param {ProcessOptions} options - The options for processing.
 */
export async function processCommand(directory: string, options: ProcessOptions): Promise<void> {
  const config = loadConfig(directory);

  // Command-line option takes precedence over config file
  const outputDir = options.outputDir || config.outputDir || path.join(directory, '.instructions');

  // Ensure the output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const summaryPath = path.join(outputDir, 'summary.md');

  if (options.task) {
    await handleTask(directory, outputDir, summaryPath, options.task);
  } else {
    // If no task is specified, just summarize the repository
    processDirectory(directory, outputDir);
    console.log(`Repository summary created at ${summaryPath}`);
  }
}

/**
 * Handles the task execution based on the given parameters.
 * @param {string} directory - The directory containing the prompts.
 * @param {string} outputDir - The directory where the output will be saved.
 * @param {string} summaryPath - The path to the summary file.
 * @param {string} task - The task to execute.
 */
async function handleTask(directory: string, outputDir: string, summaryPath: string, task: string): Promise<void> {
  // Check if summary exists, if not, generate it first
  if (!fs.existsSync(summaryPath)) {
    console.info('Summary not found. Generating summary first...');
    processDirectory(directory, outputDir);
  }

  const promptsDir = path.join(directory, 'prompts');
  if (!fs.existsSync(promptsDir)) {
    console.error('Prompts directory not found. Please create a "prompts" folder with your markdown prompt files.');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set. Please set it before running the AI command.');
    process.exit(1);
  }

  const prompts = loadPrompts(promptsDir);
  const selectedPrompt = findPrompt(prompts, task);

  if (selectedPrompt) {
    const result = await executePrompt(selectedPrompt, summaryPath);
    const outputPath = path.join(outputDir, selectedPrompt.output);
    fs.writeFileSync(outputPath, result);
    console.log(`Task result written to ${outputPath}`);
  } else {
    console.error(`No prompt found for task: ${task}`);
    process.exit(1);
  }
}
