"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumColors = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const config_service_1 = require("./config.service");
const color_type_1 = require("../types/color.type");
//@ts-expect-error
const hex_to_hsl_1 = __importDefault(require("hex-to-hsl"));
let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function getAlbumColors(imageId) {
    return new Promise((resolve, reject) => {
        var _a;
        let config = config_service_1.getConfig();
        let imagePath = path_1.default.join(__1.appDataPath, '/art', String((_a = config === null || config === void 0 ? void 0 : config['art']) === null || _a === void 0 ? void 0 : _a['dimension']), `${imageId}.webp`);
        sharp_1.default(imagePath)
            .resize(1, 1)
            .raw()
            .toBuffer((err, buffer) => {
            if (err) {
                return;
            }
            let hexColor = buffer.toString('hex');
            let hslColorObject = color_type_1.ColorTypeShell();
            const difference = 15;
            let hslColor = hex_to_hsl_1.default(hexColor);
            hslColorObject.hue = hslColor[0];
            hslColorObject.saturation = hslColor[1];
            hslColorObject.lightnessBase = hslColor[2];
            if (hslColorObject.lightnessBase + difference > 100) {
                hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference - 100;
            }
            else {
                hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference;
            }
            if (hslColorObject.lightnessBase - difference < 0) {
                hslColorObject.lightnessLow = 100 + hslColorObject.lightnessBase - difference;
            }
            else {
                hslColorObject.lightnessLow = hslColorObject.lightnessBase - difference;
            }
            resolve(hslColorObject);
        });
    });
}
exports.getAlbumColors = getAlbumColors;
