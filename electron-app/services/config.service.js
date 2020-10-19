"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.loadConfig = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var getConfigPathFile = function (app) {
    var appDataPath = path_1.default.join(app.getPath('appData'), 'Jahmin');
    var configFileName = 'config.json';
    var configFilePath = path_1.default.join(appDataPath, configFileName);
    if (!fs_1.default.existsSync(appDataPath)) {
        fs_1.default.mkdirSync(appDataPath);
    }
    return configFilePath;
};
function loadConfig(app) {
    var config;
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
    var config = loadConfig(app);
    config = Object.assign(config, newConfig);
    fs_1.default.writeFileSync(getConfigPathFile(app), json_beautify_1.default(config, null, 2, 0));
}
exports.saveConfig = saveConfig;
function getDefaultConfigFile() {
    return {
        bounds: undefined
    };
}
