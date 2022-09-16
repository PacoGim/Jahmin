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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumColors = void 0;
const sharp = require('sharp');
const color_type_1 = require("../../types/color.type");
const config_service_1 = require("../services/config.service");
const fs = __importStar(require("fs"));
const music_metadata_1 = __importDefault(require("music-metadata"));
const path = __importStar(require("path"));
const allowedSongExtensions_var_1 = __importDefault(require("../global/allowedSongExtensions.var"));
const getFileExtension_fn_1 = __importDefault(require("./getFileExtension.fn"));
const handleArt_service_1 = require("../services/handleArt.service");
let contrastRatio = (0, config_service_1.getConfig)().userOptions.contrastRatio;
const notCompress = ['mp4', 'webm', 'apng', 'gif'];
let previousContrastRatio = undefined;
function getAlbumColors(rootDir, contrast) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (contrast) {
                contrastRatio = contrast;
            }
            if (rootDir === undefined || rootDir === 'undefined') {
                return resolve(undefined);
            }
            const imagePaths = (0, handleArt_service_1.getAllowedFiles)(rootDir).filter(file => !notCompress.includes(getExtension(file)));
            if (imagePaths === undefined) {
                return resolve(undefined);
            }
            let imagePath = imagePaths[0];
            // If no images found in directory
            if (imagePath === undefined) {
                // Find the first valid song file
                let firstValidFileFound = fs
                    .readdirSync(rootDir)
                    .find(file => allowedSongExtensions_var_1.default.includes((0, getFileExtension_fn_1.default)(file) || ''));
                // If valid song file found
                if (firstValidFileFound) {
                    // Get its album art
                    let common = (yield music_metadata_1.default.parseFile(path.join(rootDir, firstValidFileFound))).common;
                    const cover = music_metadata_1.default.selectCover(common.picture); // pick the cover image
                    // If no cover found, just return
                    if (cover === null) {
                        return resolve(undefined);
                    }
                    else {
                        // Sets the image path to the album art buffer
                        imagePath = cover === null || cover === void 0 ? void 0 : cover.data;
                    }
                }
                else {
                    // If no valid song file found, just return
                    return resolve(undefined);
                }
            }
            // Check again if imagePath is undefined
            if (imagePath === undefined) {
                return resolve(undefined);
            }
            sharp(imagePath)
                .resize(1, 1)
                .raw()
                .toBuffer((err, buffer) => {
                if (err) {
                    return resolve(undefined);
                }
                let hexColor = buffer.toString('hex').substring(0, 6);
                let hslColorObject = (0, color_type_1.ColorTypeShell)();
                let hslColor = hexToHsl(hexColor);
                getTwoContrastedHslColors(hslColor).then((data) => {
                    hslColorObject.hue = hslColor.h;
                    hslColorObject.saturation = hslColor.s;
                    hslColorObject.lightnessBase = hslColor.l;
                    hslColorObject.lightnessLight = data.colorLight.l;
                    hslColorObject.lightnessDark = data.colorDark.l;
                    resolve(hslColorObject);
                });
            });
        }));
    });
}
exports.getAlbumColors = getAlbumColors;
function getExtension(data) {
    return data.split('.').pop() || '';
}
function getTwoContrastedHslColors(hslColor) {
    return new Promise((resolve, reject) => {
        recursiveLuminanceFinder(hslColor).then(data => {
            resolve(data);
        });
    });
}
function recursiveLuminanceFinder(hslBaseColor, luminanceIndex = 0) {
    return new Promise((resolve, reject) => {
        let lowLuminance = hslBaseColor.l - luminanceIndex;
        let highLuminance = hslBaseColor.l + luminanceIndex;
        if (lowLuminance < 0)
            lowLuminance = 0;
        if (highLuminance > 100)
            highLuminance = 100;
        let hslBaseColorDark = Object.assign(Object.assign({}, hslBaseColor), { l: lowLuminance });
        let hslBaseColorLight = Object.assign(Object.assign({}, hslBaseColor), { l: highLuminance });
        let ratio = getTwoHslColorsContrastRatio(hslBaseColorDark, hslBaseColorLight);
        if (ratio < 1 / contrastRatio || previousContrastRatio === ratio) {
            previousContrastRatio = undefined;
            return resolve({ colorDark: hslBaseColorDark, colorLight: hslBaseColorLight });
        }
        else {
            previousContrastRatio = ratio;
            return resolve(recursiveLuminanceFinder(hslBaseColor, luminanceIndex + 1));
        }
    });
}
function getTwoHslColorsContrastRatio(colorDark, colorLight) {
    let colorDarkRgb = convertHslColorToRgb(colorDark.h, colorDark.s, colorDark.l);
    let colorLightRgb = convertHslColorToRgb(colorLight.h, colorLight.s, colorLight.l);
    let colorDarkLuminance = luminance(colorDarkRgb.r, colorDarkRgb.g, colorDarkRgb.b);
    let colorLightLuminance = luminance(colorLightRgb.r, colorLightRgb.g, colorLightRgb.b);
    const ratio = colorDarkLuminance > colorLightLuminance
        ? (colorLightLuminance + 0.05) / (colorDarkLuminance + 0.05)
        : (colorDarkLuminance + 0.05) / (colorLightLuminance + 0.05);
    return ratio;
}
function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function convertHslColorToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let rgb = [0, 0, 0];
    let i = Math.floor(h / 60);
    if (i === 0) {
        rgb = [c, x, 0];
    }
    else if (i === 1) {
        rgb = [x, c, 0];
    }
    else if (i === 2) {
        rgb = [0, c, x];
    }
    else if (i === 3) {
        rgb = [0, x, c];
    }
    else if (i === 4) {
        rgb = [x, 0, c];
    }
    else if (i === 5) {
        rgb = [c, 0, x];
    }
    rgb = rgb.map(x => Math.round((x + m) * 255));
    return {
        r: rgb[0],
        g: rgb[1],
        b: rgb[2]
    };
}
function hexToHsl(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return null;
    }
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    (r /= 255), (g /= 255), (b /= 255);
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h;
    let s;
    let l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        if (h === undefined) {
            return null;
        }
        h /= 6;
    }
    return {
        h: Math.floor(h * 360),
        s: Math.floor(s * 100),
        l: Math.floor(l * 100)
    };
}
