"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadConfig(directory) {
    const configPath = path_1.default.join(directory, '.dokkit.config.json');
    let config = {};
    if (fs_1.default.existsSync(configPath)) {
        try {
            const configContent = fs_1.default.readFileSync(configPath, 'utf-8');
            config = JSON.parse(configContent);
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn(`Error loading config file: ${error.message}`);
            }
            else {
                console.warn('An unknown error occurred while loading the config file');
            }
        }
    }
    return config;
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.js.map