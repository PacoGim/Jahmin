"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.getConfig = void 0;
const config_type_1 = require("../types/config.type");
const toml_1 = __importDefault(require("@iarna/toml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const __1 = require("..");
const getConfigPathFile = () => {
    const configFileName = 'config.toml';
    const configFilePath = path_1.default.join(__1.appDataPath(), configFileName);
    if (!fs_1.default.existsSync(__1.appDataPath())) {
        fs_1.default.mkdirSync(__1.appDataPath());
    }
    return configFilePath;
};
function getConfig() {
    var _a, _b, _c;
    let config;
    if (fs_1.default.existsSync(getConfigPathFile())) {
        try {
            config = toml_1.default.parse(fs_1.default.readFileSync(getConfigPathFile(), { encoding: 'utf-8' }));
        }
        catch (error) {
            config = getDefaultConfigFile();
        }
    }
    else {
        config = getDefaultConfigFile();
    }
    if (((_a = config === null || config === void 0 ? void 0 : config['order']) === null || _a === void 0 ? void 0 : _a['grouping']) === undefined || ((_c = (_b = config === null || config === void 0 ? void 0 : config['order']) === null || _b === void 0 ? void 0 : _b['grouping']) === null || _c === void 0 ? void 0 : _c.length) === 0) {
        config.order = {
            grouping: ['Extension', 'Genre', 'AlbumArtist', 'Album'],
            filtering: []
        };
    }
    return config;
}
exports.getConfig = getConfig;
function saveConfig(newConfig) {
    let config = getConfig();
    config = deepmerge_1.default(config, newConfig, { arrayMerge: (destinationArray, sourceArray) => sourceArray });
    try {
        fs_1.default.writeFileSync(getConfigPathFile(), toml_1.default.stringify(config));
        return config;
    }
    catch (error) {
        return false;
    }
}
exports.saveConfig = saveConfig;
function getDefaultConfigFile() {
    return {
        order: {
            grouping: ['Extension', 'Genre', 'AlbumArtist', 'Album'],
            filtering: []
        },
        art: {
            dimension: 128
        },
        groupOnlyByFolder: false,
        userOptions: {
            theme: config_type_1.ThemeOptions.Auto
        }
    };
}
