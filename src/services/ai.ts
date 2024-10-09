import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Prompt } from '../types';

/**
 * Loads prompts from markdown files in the specified directory.
 * @param promptsDir - The directory path containing prompt markdown files.
 * @returns An array of Prompt objects.
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
      });
    }
  });

  return prompts;
}

/**
 * Finds a prompt by its name (case-insensitive).
 * @param prompts - An array of Prompt objects to search through.
 * @param task - The name of the task/prompt to find.
 * @returns The matching Prompt object, or undefined if not found.
 */
export function findPrompt(prompts: Prompt[], task: string): Prompt | undefined {
  return prompts.find((prompt) => prompt.name.toLowerCase() === task.toLowerCase());
}

/**
 * Executes a prompt by replacing a placeholder with a summary and generating text using an AI model.
 * @param prompt - The Prompt object to execute.
 * @param outputPath - The file path containing the summary to inject into the prompt.
 * @returns A Promise that resolves to the generated text string.
 */
export async function executePrompt(prompt: Prompt, outputPath: string): Promise<string> {
  const summary = fs.readFileSync(outputPath, 'utf-8');
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
