"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.getConfig = void 0;
const config_type_1 = require("../../types/config.type");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
const deepmerge = require('deepmerge');
function getConfigPathFile() {
    const configFileName = 'config.json';
    const configFilePath = path.join((0, getAppDataPath_fn_1.default)(), configFileName);
    if (!fs.existsSync((0, getAppDataPath_fn_1.default)())) {
        fs.mkdirSync((0, getAppDataPath_fn_1.default)());
    }
    return configFilePath;
}
function getConfig() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    let config;
    if (fs.existsSync(getConfigPathFile())) {
        try {
            config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' }));
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
        if (((_g = config === null || config === void 0 ? void 0 : config.userOptions) === null || _g === void 0 ? void 0 : _g.fontSize) === undefined) {
            config.userOptions.fontSize = (_h = getDefaultConfigFile().userOptions) === null || _h === void 0 ? void 0 : _h.fontSize;
        }
        if (((_j = config === null || config === void 0 ? void 0 : config.userOptions) === null || _j === void 0 ? void 0 : _j.sortBy) === undefined) {
            config.userOptions.sortBy = (_k = getDefaultConfigFile().userOptions) === null || _k === void 0 ? void 0 : _k.sortBy;
        }
        if (((_l = config === null || config === void 0 ? void 0 : config.userOptions) === null || _l === void 0 ? void 0 : _l.sortOrder) === undefined) {
            config.userOptions.sortOrder = (_m = getDefaultConfigFile().userOptions) === null || _m === void 0 ? void 0 : _m.sortOrder;
        }
        if (((_o = config === null || config === void 0 ? void 0 : config.userOptions) === null || _o === void 0 ? void 0 : _o.songAmount) === undefined) {
            config.userOptions.songAmount = (_p = getDefaultConfigFile().userOptions) === null || _p === void 0 ? void 0 : _p.songAmount;
        }
        if (((_q = config === null || config === void 0 ? void 0 : config.userOptions) === null || _q === void 0 ? void 0 : _q.artSize) === undefined) {
            config.userOptions.artSize = (_r = getDefaultConfigFile().userOptions) === null || _r === void 0 ? void 0 : _r.artSize;
        }
        if (((_s = config === null || config === void 0 ? void 0 : config.userOptions) === null || _s === void 0 ? void 0 : _s.gridGap) === undefined) {
            config.userOptions.gridGap = (_t = getDefaultConfigFile().userOptions) === null || _t === void 0 ? void 0 : _t.gridGap;
        }
        if (((_u = config === null || config === void 0 ? void 0 : config.userOptions) === null || _u === void 0 ? void 0 : _u.theme) === undefined) {
            config.userOptions.theme = (_v = getDefaultConfigFile().userOptions) === null || _v === void 0 ? void 0 : _v.theme;
        }
        if ((config === null || config === void 0 ? void 0 : config.directories) === undefined) {
            config.directories = getDefaultConfigFile().directories;
        }
        if (((_w = config === null || config === void 0 ? void 0 : config.directories) === null || _w === void 0 ? void 0 : _w.add) === undefined) {
            config.directories.add = (_x = getDefaultConfigFile().directories) === null || _x === void 0 ? void 0 : _x.add;
        }
        if (((_y = config === null || config === void 0 ? void 0 : config.directories) === null || _y === void 0 ? void 0 : _y.exclude) === undefined) {
            config.directories.exclude = (_z = getDefaultConfigFile().directories) === null || _z === void 0 ? void 0 : _z.exclude;
        }
    }
    return config;
}
exports.getConfig = getConfig;
function saveConfig(newConfig) {
    let config = getConfig();
    config = deepmerge(config, newConfig, { arrayMerge: (destinationArray, sourceArray) => sourceArray });
    try {
        fs.writeFileSync(getConfigPathFile(), JSON.stringify(config, null, 2));
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
        directories: {
            add: [],
            exclude: []
        },
        groupOnlyByFolder: false,
        userOptions: {
            songAmount: 8,
            theme: config_type_1.ThemeOptions.SystemBased,
            artSize: 128,
            gridGap: 16,
            contrastRatio: 4.5,
            fontSize: 16,
            sortBy: 'Track',
            sortOrder: 'asc',
            pauseAnimatedArtWhenAppUnfocused: false
        },
        songListTags: [
            {
                align: 'center',
                value: 'Track',
                isExpanded: false
            },
            {
                align: 'left',
                value: 'Title',
                isExpanded: true
            },
            {
                align: 'center',
                value: 'PlayCount',
                isExpanded: false
            },
            {
                align: 'center',
                value: 'Rating',
                isExpanded: false
            },
            {
                align: 'left',
                value: 'Duration',
                isExpanded: false
            },
            {
                align: 'center',
                value: 'DynamicArtists',
                isExpanded: false
            }
        ]
    };
}
