"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.getConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const __1 = require("..");
const getConfigPathFile = () => {
    const configFileName = 'config.json';
    const configFilePath = path_1.default.join(__1.appDataPath, configFileName);
    if (!fs_1.default.existsSync(__1.appDataPath)) {
        fs_1.default.mkdirSync(__1.appDataPath);
    }
    return configFilePath;
};
function getConfig() {
    let config;
    if (fs_1.default.existsSync(getConfigPathFile())) {
        try {
            config = JSON.parse(fs_1.default.readFileSync(getConfigPathFile(), { encoding: 'utf-8' }));
        }
        catch (error) {
            config = getDefaultConfigFile();
        }
    }
    else {
        config = getDefaultConfigFile();
    }
    return config;
}
exports.getConfig = getConfig;
function saveConfig(newConfig) {
    let config = getConfig();
    config = deepmerge_1.default(config, newConfig);
    fs_1.default.writeFileSync(getConfigPathFile(), JSON.stringify(config, null, 2));
}
exports.saveConfig = saveConfig;
function getDefaultConfigFile() {
    return {
        order: {
            grouping: ['Genre']
        }
    };
}
