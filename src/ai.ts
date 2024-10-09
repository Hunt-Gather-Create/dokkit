import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface Prompt {
  name: string;
  description: string;
  content: string;
}

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

export function findPrompt(prompts: Prompt[], task: string): Prompt | undefined {
  return prompts.find((prompt) => prompt.name.toLowerCase() === task.toLowerCase());
}

export async function executePrompt(prompt: Prompt): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: prompt.content
    });
    return text;
  } catch (error) {
    console.error('Error executing AI prompt:', error);
    return 'Error: Unable to execute AI prompt';
  }
}
