"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumColors = void 0;
const sharp = require('sharp');
const color_type_1 = require("../../types/color.type");
const config_service_1 = require("../services/config.service");
const getFileExtension_fn_1 = __importDefault(require("./getFileExtension.fn"));
const getAllowedArts_fn_1 = __importDefault(require("./getAllowedArts.fn"));
const allowedArts_var_1 = require("../global/allowedArts.var");
const workers_service_1 = require("../services/workers.service");
const generateId_fn_1 = __importDefault(require("./generateId.fn"));
const getAppDataPath_fn_1 = __importDefault(require("./getAppDataPath.fn"));
let contrastRatioConfig = (0, config_service_1.getConfig)().userOptions.contrastRatio || 4.5;
let previousContrastRatio = undefined;
let ffmpegImageWorker;
let ffmpegDeferredPromises = new Map();
async function getAlbumColors(folderPath, contrastRatio = contrastRatioConfig) {
    return new Promise(async (resolve, reject) => {
        if (folderPath === undefined || folderPath === 'undefined')
            return resolve(undefined);
        let allowedArtFiles = (0, getAllowedArts_fn_1.default)(folderPath);
        if (allowedArtFiles === undefined) {
            return resolve(undefined);
        }
        let videoArts = allowedArtFiles.filter(file => allowedArts_var_1.videoFormats.includes((0, getFileExtension_fn_1.default)(file)));
        let animatedArts = allowedArtFiles.filter(file => allowedArts_var_1.animatedFormats.includes((0, getFileExtension_fn_1.default)(file)));
        let imageArts = allowedArtFiles.filter(file => allowedArts_var_1.imageFormats.includes((0, getFileExtension_fn_1.default)(file)));
        if (videoArts.length !== 0 || animatedArts.length !== 0) {
            let promiseId = (0, generateId_fn_1.default)();
            ffmpegDeferredPromises.set(promiseId, resolve);
            ffmpegImageWorker.postMessage({
                id: promiseId,
                type: 'handle-art-color',
                appDataPath: (0, getAppDataPath_fn_1.default)(),
                contrastRatio,
                artPath: [...videoArts, ...animatedArts][0]
            });
        }
        if (imageArts.length !== 0) {
            return getImageArtColors(imageArts[0], contrastRatio).then((hslColorObject) => {
                resolve(hslColorObject);
            });
        }
        return resolve(undefined);
    });
}
exports.getAlbumColors = getAlbumColors;
function getImageArtColors(artPath, contrastRatio) {
    return new Promise((resolve, reject) => {
        getArtColorFromArtPath(artPath, contrastRatio).then((hslColorObject) => {
            resolve(hslColorObject);
        });
    });
}
function getArtColorFromArtPath(artPath, contrastRatio) {
    return new Promise((resolve, reject) => {
        sharp(artPath)
            .resize(1, 1)
            .raw()
            .toBuffer((err, buffer) => {
            if (err) {
                return resolve(undefined);
            }
            let hexColor = buffer.toString('hex').substring(0, 6);
            let hslColorObject = (0, color_type_1.ColorTypeDefault)();
            let hslColor = hexToHsl(hexColor);
            getTwoContrastedHslColors(hslColor, contrastRatio).then((data) => {
                hslColorObject.hue = hslColor.h;
                hslColorObject.saturation = hslColor.s;
                hslColorObject.lightnessBase = hslColor.l;
                hslColorObject.lightnessLight = data.colorLight.l;
                hslColorObject.lightnessDark = data.colorDark.l;
                resolve(hslColorObject);
            });
        });
    });
}
function getTwoContrastedHslColors(hslColor, contrastRatio) {
    return new Promise((resolve, reject) => {
        recursiveLuminanceFinder(hslColor, 0, contrastRatio).then(data => {
            resolve(data);
        });
    });
}
function recursiveLuminanceFinder(hslBaseColor, luminanceIndex = 0, contrastRatio) {
    return new Promise((resolve, reject) => {
        let lowLuminance = hslBaseColor.l - luminanceIndex;
        let highLuminance = hslBaseColor.l + luminanceIndex;
        if (lowLuminance < 0)
            lowLuminance = 0;
        if (highLuminance > 100)
            highLuminance = 100;
        let hslBaseColorDark = { ...hslBaseColor, l: lowLuminance };
        let hslBaseColorLight = { ...hslBaseColor, l: highLuminance };
        let ratio = getTwoHslColorsContrastRatio(hslBaseColorDark, hslBaseColorLight);
        if (ratio < 1 / contrastRatio || previousContrastRatio === ratio) {
            previousContrastRatio = undefined;
            return resolve({ colorDark: hslBaseColorDark, colorLight: hslBaseColorLight });
        }
        else {
            previousContrastRatio = ratio;
            return resolve(recursiveLuminanceFinder(hslBaseColor, luminanceIndex + 1, contrastRatio));
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
/********************** Workers **********************/
(0, workers_service_1.getWorker)('ffmpegImage').then(worker => {
    if (!ffmpegImageWorker) {
        ffmpegImageWorker = worker;
        ffmpegImageWorker.on('message', handleFfmpegImageWorkerResponse);
    }
});
function handleFfmpegImageWorkerResponse(data) {
    if (data.type === 'handle-art-color') {
        getArtColorFromArtPath(data.fileBuffer, data.contrastRatio).then((hslColorObject) => {
            console.log(hslColorObject);
            ffmpegDeferredPromises.get(data.id)(hslColorObject);
            ffmpegDeferredPromises.delete(data.id);
        });
    }
}
