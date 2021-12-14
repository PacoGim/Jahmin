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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
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
    if ((config === null || config === void 0 ? void 0 : config.userOptions) === undefined) {
        config.userOptions = getDefaultConfigFile().userOptions;
    }
    else {
        if (((_e = config === null || config === void 0 ? void 0 : config.userOptions) === null || _e === void 0 ? void 0 : _e.contrastRatio) === undefined) {
            config.userOptions.contrastRatio = (_f = getDefaultConfigFile().userOptions) === null || _f === void 0 ? void 0 : _f.contrastRatio;
        }
        if (((_g = config === null || config === void 0 ? void 0 : config.userOptions) === null || _g === void 0 ? void 0 : _g.songAmount) === undefined) {
            config.userOptions.songAmount = (_h = getDefaultConfigFile().userOptions) === null || _h === void 0 ? void 0 : _h.songAmount;
        }
        if (((_j = config === null || config === void 0 ? void 0 : config.userOptions) === null || _j === void 0 ? void 0 : _j.artSize) === undefined) {
            config.userOptions.artSize = (_k = getDefaultConfigFile().userOptions) === null || _k === void 0 ? void 0 : _k.artSize;
        }
        if (((_l = config === null || config === void 0 ? void 0 : config.userOptions) === null || _l === void 0 ? void 0 : _l.gridGap) === undefined) {
            config.userOptions.gridGap = (_m = getDefaultConfigFile().userOptions) === null || _m === void 0 ? void 0 : _m.gridGap;
        }
        if (((_o = config === null || config === void 0 ? void 0 : config.userOptions) === null || _o === void 0 ? void 0 : _o.theme) === undefined) {
            config.userOptions.theme = (_p = getDefaultConfigFile().userOptions) === null || _p === void 0 ? void 0 : _p.theme;
        }
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
        groupOnlyByFolder: false,
        userOptions: {
            songAmount: 8,
            theme: config_type_1.ThemeOptions.Auto,
            artSize: 128,
            gridGap: 16,
            contrastRatio: 4.5
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
