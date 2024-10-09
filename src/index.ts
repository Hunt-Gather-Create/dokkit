import { program } from 'commander';
import { processCommand } from './commands/process';
import { ProcessOptions } from './types';

program
  .argument('<directory>', 'Directory to process')
  .option('-o, --output-dir <path>', 'Output directory path')
  .option('--task <task>', 'Task to execute')
  .action((directory: string, options: ProcessOptions) => {
    processCommand(directory, {
      outputDir: options.outputDir,
      task: options.task
    });
  });

program.parse(process.argv);
