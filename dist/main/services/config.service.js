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
const verifyConfigFile_fn_1 = __importDefault(require("../functions/verifyConfigFile.fn"));
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
    if (fs.existsSync(getConfigPathFile())) {
        try {
            let config = JSON.parse(fs.readFileSync(getConfigPathFile(), { encoding: 'utf-8' }));
            return (0, verifyConfigFile_fn_1.default)(config, getDefaultConfigFile());
        }
        catch (error) {
            return getDefaultConfigFile();
        }
    }
    else {
        return getDefaultConfigFile();
    }
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
            language: 'english',
            songAmount: 8,
            theme: config_type_1.ThemeOptions.SystemBased,
            artSize: 128,
            gridGap: 16,
            contrastRatio: 4.5,
            fontSize: 16,
            sortBy: 'Track',
            sortOrder: 'asc',
            pauseAnimatedArtWhenAppUnfocused: false,
            alwaysShowAlbumOverlay: false,
            isFullscreen: false,
            equalizerHash: '3qu',
            lyricsStyle: {
                fontSize: 16,
                fontWeight: 500,
                textAlignment: 0
            }
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
