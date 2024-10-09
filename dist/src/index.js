"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const ignore_1 = __importDefault(require("ignore"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const package_json_1 = require("../package.json");
function summarizeFile(filePath) {
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    return `## File: ${path_1.default.basename(filePath)}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}
function processDirectory(dirPath, config, outputPath, isRoot = true) {
    const files = fs_1.default.readdirSync(dirPath);
    const gitignorePath = path_1.default.join(dirPath, '.gitignore');
    const summaries = [];
    const ig = (0, ignore_1.default)();
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
    if (fs_1.default.existsSync(gitignorePath)) {
        const gitignoreContent = fs_1.default.readFileSync(gitignorePath, 'utf-8');
        const gitignoreLines = gitignoreContent.split('\n');
        gitignoreLines.forEach((line) => {
            ig.add(line);
        });
    }
    files.forEach((file) => {
        const filePath = path_1.default.join(dirPath, file);
        const relativePath = path_1.default.relative(dirPath, filePath);
        // Skip if the file is ignored by .gitignore or is .git folder
        if (ig.ignores(relativePath)) {
            return;
        }
        const stats = fs_1.default.statSync(filePath);
        if (stats.isFile() && !file.startsWith('.')) {
            const summary = summarizeFile(filePath);
            summaries.push(summary);
        }
        else if (stats.isDirectory() && file !== '.instructions') {
            // Recursively process subdirectories
            const subDirSummaries = processDirectory(filePath, config, outputPath, false) || [];
            summaries.push(...subDirSummaries);
        }
    });
    if (isRoot) {
        // Ensure the directory exists
        fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
        fs_1.default.writeFileSync(outputPath, summaries.join('---\n\n'));
        console.info(`Summaries written to ${outputPath}`);
    }
    return summaries;
}
commander_1.program
    .version(package_json_1.version)
    .argument('<directory>', 'Directory to process')
    .option('-o, --output <path>', 'Output file path')
    .action((directory, options) => {
    const config = (0, config_1.loadConfig)(directory);
    // Command-line option takes precedence over config file
    if (options.output) {
        config.output = options.output;
    }
    const outputPath = config.output
        ? path_1.default.resolve(directory, config.output)
        : path_1.default.join(directory, '.instructions', 'summary.md');
    processDirectory(directory, config, outputPath, true);
});
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map