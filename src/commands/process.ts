import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config';
import { DokkitConfig } from '../types';
import { loadPrompts, findPrompt, executePrompt } from '../services/ai';
import { processDirectory } from '../services/directory';

/**
 * Processes the command based on the given directory and options.
 * @param directory - The directory to process.
 * @param options - The options for processing, including output path and task.
 */
export async function processCommand(directory: string, options: { output?: string, task?: string }) {
  const config = loadConfig(directory);

  // Command-line option takes precedence over config file
  if (options.output) {
    config.output = options.output;
  }

  const outputPath = config.output
    ? path.resolve(directory, config.output)
    : path.join(directory, '.instructions', 'summary.md');

  if (options.task) {
    await handleTask(directory, outputPath, options.task);
  } else {
    // Original functionality: process directory and create summary
    processDirectory(directory, config, outputPath, true);
  }
}

/**
 * Handles the execution of a specific task.
 * @param directory - The directory containing the task files.
 * @param outputPath - The path where the output will be saved.
 * @param task - The name of the task to execute.
 */
async function handleTask(directory: string, outputPath: string, task: string) {
  // Check if summary exists, if not, generate it first
  if (!fs.existsSync(outputPath)) {
    console.info('Summary not found. Generating summary first...');
    processDirectory(directory, {}, outputPath, true);
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
    const result = await executePrompt(selectedPrompt, outputPath);
    console.log(result);
  } else {
    console.error(`No prompt found for task: ${task}`);
    process.exit(1);
  }
}
