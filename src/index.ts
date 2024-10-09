import { program } from 'commander';
import { processCommand } from './commands/process';

program
  .argument('<directory>', 'Directory to process')
  .option('-o, --output <path>', 'Output file path')
  .option('--task <task>', 'Task to execute')
  .action(processCommand);

program.parse(process.argv);
