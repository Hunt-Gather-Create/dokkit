#!/usr/bin/env node

import { program } from 'commander';
import { processCommand } from './commands/process';
import { ProcessOptions } from './types';

program
  .argument('[directory]', 'Directory to process (defaults to current directory)')
  .option('-o, --output-dir <path>', 'Output directory path')
  .option('--task <task>', 'Task to execute')
  .action((directory: string = process.cwd(), options: ProcessOptions) => {
    processCommand(directory, {
      outputDir: options.outputDir,
      task: options.task
    });
  });

program.parse(process.argv);
