import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Prompt } from '../types';

/**
 * Loads prompts from the specified directory.
 * @param {string} promptsDir - The directory containing prompt files.
 * @returns {Prompt[]} An array of loaded prompts.
 */
export function loadPrompts(promptsDir: string): Prompt[] {
  const prompts: Prompt[] = [];
  const files = fs.readdirSync(promptsDir);

  files.forEach((file) => {
    if (path.extname(file) === '.md') {
      const filePath = path.join(promptsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      prompts.push({
        name: data.name || path.basename(file, '.md'),
        description: data.description || '',
        content: content.trim(),
        output: data.output || 'output.md'
      });
    }
  });

  return prompts;
}

/**
 * Finds a prompt by its name.
 * @param {Prompt[]} prompts - The array of prompts to search.
 * @param {string} task - The name of the task to find.
 * @returns {Prompt | undefined} The found prompt or undefined.
 */
export function findPrompt(prompts: Prompt[], task: string): Prompt | undefined {
  return prompts.find((prompt) => prompt.name.toLowerCase() === task.toLowerCase());
}

/**
 * Executes a prompt using the AI model.
 * @param {Prompt} prompt - The prompt to execute.
 * @param {string} summaryPath - The path to the summary file.
 * @returns {Promise<string>} The result of the AI execution.
 */
export async function executePrompt(prompt: Prompt, summaryPath: string): Promise<string> {
  const summary = fs.readFileSync(summaryPath, 'utf-8');
  const promptWithSummary = prompt.content.replace('{{SUMMARY}}', summary);

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: promptWithSummary,
    });
    return text;
  } catch (error) {
    console.error('Error executing AI prompt:', error);
    return 'Error: Unable to execute AI prompt';
  }
}
