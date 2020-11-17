"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.loadConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getConfigPathFile = (app) => {
    const appDataPath = path_1.default.join(app.getPath('appData'), 'Jahmin');
    const configFileName = 'config.json';
    const configFilePath = path_1.default.join(appDataPath, configFileName);
    if (!fs_1.default.existsSync(appDataPath)) {
        fs_1.default.mkdirSync(appDataPath);
    }
    return configFilePath;
};
function loadConfig(app) {
    let config;
    if (fs_1.default.existsSync(getConfigPathFile(app))) {
        try {
            config = JSON.parse(fs_1.default.readFileSync(getConfigPathFile(app), { encoding: 'utf-8' }));
        }
        catch (error) {
            //TODO Alert Config File Error
            config = getDefaultConfigFile();
        }
    }
    else {
        config = getDefaultConfigFile();
    }
    return config;
}
exports.loadConfig = loadConfig;
function saveConfig(app, newConfig) {
    let config = loadConfig(app);
    config = Object.assign(config, newConfig);
    fs_1.default.writeFileSync(getConfigPathFile(app), JSON.stringify(config, null, 2));
}
exports.saveConfig = saveConfig;
function getDefaultConfigFile() {
    return {
        bounds: undefined
    };
}
