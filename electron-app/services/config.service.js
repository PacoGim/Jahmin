"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.getConfig = void 0;
const config_type_1 = require("../types/config.type");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const __1 = require("..");
const getConfigPathFile = () => {
    const configFileName = 'config.json';
    const configFilePath = path_1.default.join((0, __1.appDataPath)(), configFileName);
    if (!fs_1.default.existsSync((0, __1.appDataPath)())) {
        fs_1.default.mkdirSync((0, __1.appDataPath)());
    }
    return configFilePath;
};
function getConfig() {
    var _a, _b, _c, _d, _e;
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
    if (((_a = config === null || config === void 0 ? void 0 : config.group) === null || _a === void 0 ? void 0 : _a.groupBy) === undefined || ((_c = (_b = config === null || config === void 0 ? void 0 : config.group) === null || _b === void 0 ? void 0 : _b.groupBy) === null || _c === void 0 ? void 0 : _c.length) === 0) {
        config.group = getDefaultConfigFile().group;
    }
    if ((config === null || config === void 0 ? void 0 : config.songListTags) === undefined || ((_d = config === null || config === void 0 ? void 0 : config.songListTags) === null || _d === void 0 ? void 0 : _d.length) === 0) {
        config.songListTags = getDefaultConfigFile().songListTags;
    }
    if (((_e = config === null || config === void 0 ? void 0 : config.userOptions) === null || _e === void 0 ? void 0 : _e.songAmount) === undefined) {
        config.userOptions = getDefaultConfigFile().userOptions;
    }
    return config;
}
exports.getConfig = getConfig;
function saveConfig(newConfig) {
    let config = getConfig();
    config = (0, deepmerge_1.default)(config, newConfig, { arrayMerge: (destinationArray, sourceArray) => sourceArray });
    try {
        fs_1.default.writeFileSync(getConfigPathFile(), JSON.stringify(config, null, 2));
        return config;
    }
    catch (error) {
        return false;
    }
}
exports.saveConfig = saveConfig;
function getDefaultConfigFile() {
    return {
        group: {
            groupBy: ['Genre'],
            groupByValues: []
        },
        art: {
            dimension: 128
        },
        groupOnlyByFolder: false,
        userOptions: {
            songAmount: 8,
            theme: config_type_1.ThemeOptions.Auto
        },
        songListTags: [
            {
                align: 'Left',
                name: 'Track',
                size: 'Collapse'
            },
            {
                align: 'Left',
                name: 'Title',
                size: 'Expand'
            },
            {
                align: 'Left',
                name: 'Rating',
                size: 'Collapse'
            },
            {
                align: 'Left',
                name: 'Duration',
                size: 'Collapse'
            }
        ]
    };
}
